import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const BUCKET = 'property-images';

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const extractStoragePath = (value) => {
  if (!value) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = value.indexOf(marker);

  if (markerIndex >= 0) {
    return decodeURIComponent(value.slice(markerIndex + marker.length).split('?')[0]);
  }

  return value.startsWith(`${BUCKET}/`) ? value.slice(BUCKET.length + 1) : value;
};

const isFolder = (item) => !item.id && !item.metadata?.mimetype && !item.name.includes('.');

const StorageCleanup = () => {
  const { isConfigurator } = useAuth();
  const [files, setFiles] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('unused');

  const usedPaths = useMemo(() => {
    const paths = new Set();
    properties.forEach((property) => {
      (property.images || []).forEach((image) => {
        const path = extractStoragePath(image);
        if (path) paths.add(path);
      });
    });
    return paths;
  }, [properties]);

  const filesWithUsage = useMemo(() => files.map((file) => ({
    ...file,
    used: usedPaths.has(file.path),
    propertyTitles: properties
      .filter((property) => (property.images || []).some((image) => extractStoragePath(image) === file.path))
      .map((property) => property.title)
  })), [files, properties, usedPaths]);

  const visibleFiles = useMemo(() => {
    if (filter === 'used') return filesWithUsage.filter((file) => file.used);
    if (filter === 'selected') return filesWithUsage.filter((file) => selected.has(file.path));
    if (filter === 'all') return filesWithUsage;
    return filesWithUsage.filter((file) => !file.used);
  }, [filesWithUsage, filter, selected]);

  const stats = useMemo(() => {
    const totalBytes = filesWithUsage.reduce((sum, file) => sum + (file.size || 0), 0);
    const unusedFiles = filesWithUsage.filter((file) => !file.used);
    const unusedBytes = unusedFiles.reduce((sum, file) => sum + (file.size || 0), 0);

    return {
      total: filesWithUsage.length,
      used: filesWithUsage.length - unusedFiles.length,
      unused: unusedFiles.length,
      totalBytes,
      unusedBytes
    };
  }, [filesWithUsage]);

  const listBucketFiles = async (prefix = '') => {
    const collected = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(prefix, {
          limit,
          offset,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      if (listError) throw listError;
      const items = data || [];

      for (const item of items) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (isFolder(item)) {
          const nested = await listBucketFiles(path);
          collected.push(...nested);
        } else {
          collected.push({
            path,
            name: item.name,
            folder: prefix || 'raiz',
            size: item.metadata?.size || 0,
            mimetype: item.metadata?.mimetype || '',
            updatedAt: item.updated_at || item.created_at || null
          });
        }
      }

      if (items.length < limit) break;
      offset += limit;
    }

    return collected;
  };

  const fetchData = async () => {
    if (!isConfigurator) return;

    try {
      setLoading(true);
      setError(null);
      setSelected(new Set());

      const [{ data: propertyData, error: propertyError }, bucketFiles] = await Promise.all([
        supabase.from('properties').select('id,title,images'),
        listBucketFiles()
      ]);

      if (propertyError) throw propertyError;

      setProperties(propertyData || []);
      setFiles(bucketFiles);
    } catch (err) {
      console.error('Error loading storage cleanup:', err);
      setError(err.message || 'Erro ao carregar imagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isConfigurator]);

  const toggleSelected = (path) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectVisibleUnused = () => {
    setSelected(new Set(visibleFiles.filter((file) => !file.used).map((file) => file.path)));
  };

  const deleteSelected = async () => {
    const paths = [...selected].filter((path) => {
      const file = filesWithUsage.find((item) => item.path === path);
      return file && !file.used;
    });

    if (paths.length === 0) return;

    const confirmed = window.confirm(`Eliminar ${paths.length} imagem(ns) não utilizadas do bucket? Esta ação não pode ser revertida.`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
      if (removeError) throw removeError;
      await fetchData();
    } catch (err) {
      console.error('Error deleting images:', err);
      setError(err.message || 'Erro ao eliminar imagens.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isConfigurator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <i className="fa-solid fa-lock text-5xl text-gray-300 mb-4"></i>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2">Esta área está disponível apenas para configuradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <i className="fa-solid fa-images text-emerald-500"></i>
              Limpeza de Imagens
            </h1>
            <p className="text-slate-500 mt-2">Gerir imagens antigas do bucket de imóveis.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading || deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <i className={`fa-solid fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
              Atualizar
            </button>
            <button
              onClick={deleteSelected}
              disabled={selected.size === 0 || deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <i className={`fa-solid ${deleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
              Eliminar Seleção
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            <p className="text-sm text-slate-500">{formatBytes(stats.totalBytes)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Em Uso</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.used}</p>
            <p className="text-sm text-slate-500">referenciadas em imóveis</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Sem Uso</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.unused}</p>
            <p className="text-sm text-slate-500">{formatBytes(stats.unusedBytes)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Selecionadas</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{selected.size}</p>
            <p className="text-sm text-slate-500">prontas para eliminar</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'unused', label: 'Sem uso' },
                { id: 'used', label: 'Em uso' },
                { id: 'all', label: 'Todas' },
                { id: 'selected', label: 'Selecionadas' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === item.id ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={selectVisibleUnused}
              disabled={visibleFiles.every((file) => file.used)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <i className="fa-solid fa-check-double"></i>
              Selecionar visíveis sem uso
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-emerald-500 mb-4"></i>
              <p>A carregar imagens...</p>
            </div>
          ) : visibleFiles.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-400 mb-4"></i>
              <p>Nenhuma imagem encontrada para este filtro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="w-12 px-4 py-3"></th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Imagem</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tamanho</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Atualizada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleFiles.map((file) => {
                    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(file.path).data.publicUrl;
                    const isSelected = selected.has(file.path);

                    return (
                      <tr key={file.path} className={file.used ? 'bg-white' : 'bg-amber-50/30'}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={file.used}
                            onChange={() => toggleSelected(file.path)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[320px]">
                            <img src={publicUrl} alt="" className="w-16 h-12 object-cover rounded-lg bg-gray-100 border border-gray-200" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 break-all">{file.path}</p>
                              <p className="text-xs text-slate-400">{file.mimetype || file.folder}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {file.used ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <i className="fa-solid fa-link"></i>
                                Em uso
                              </span>
                              <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{file.propertyTitles.join(', ')}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                              <i className="fa-solid fa-broom"></i>
                              Sem uso
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatBytes(file.size)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString('pt-PT') : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageCleanup;
