import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const JOB_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Tempo Inteiro' },
  { value: 'part-time', label: 'Tempo Parcial' },
  { value: 'contract', label: 'Contrato' },
  { value: 'internship', label: 'Estágio' }
];

const STATUS_LABELS = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'Analisada', color: 'bg-blue-100 text-blue-700' },
  shortlisted: { label: 'Selecionado', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' }
};

const JobManagement = () => {
  const { isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // jobs | applications
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchJobs();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'applications' && selectedJobId) {
      fetchApplications(selectedJobId);
    } else if (activeTab === 'applications') {
      fetchAllApplications();
    }
  }, [activeTab, selectedJobId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*, job_applications(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      setAppsLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, jobs(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      setAppsLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, jobs(title)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const deleteJob = async (id) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      setJobs(jobs.filter(j => j.id !== id));
      setDeleteModal(null);
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const toggleJobActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;
      setJobs(jobs.map(j => j.id === id ? { ...j, is_active: !currentActive } : j));
    } catch (err) {
      console.error('Error toggling job:', err);
    }
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const downloadCV = async (cvUrl) => {
    try {
      const { data, error } = await supabase.storage
        .from('cv-uploads')
        .createSignedUrl(cvUrl.replace('cv-uploads/', ''), 300);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Error downloading CV:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Carreiras</h1>
            <p className="text-slate-500 text-sm mt-1">Gerir vagas e candidaturas</p>
          </div>
          <button
            onClick={() => { setEditingJob(null); setShowJobForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <i className="fa-solid fa-plus"></i>
            Nova Vaga
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => { setActiveTab('jobs'); setSelectedJobId(null); }}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-briefcase mr-2"></i>
            Vagas ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-file-lines mr-2"></i>
            Candidaturas
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <i className="fa-solid fa-briefcase text-4xl text-gray-300 mb-4"></i>
                <p className="text-slate-500">Nenhuma vaga criada.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const appCount = job.job_applications?.[0]?.count || 0;
                  return (
                    <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900 truncate">{job.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {job.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span><i className="fa-solid fa-location-dot mr-1 text-emerald-500"></i>{job.location}</span>
                          <span><i className="fa-solid fa-clock mr-1"></i>{JOB_TYPE_OPTIONS.find(t => t.value === job.type)?.label || job.type}</span>
                          <span><i className="fa-solid fa-users mr-1"></i>{appCount} candidatura{appCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedJobId(job.id); setActiveTab('applications'); }}
                          className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Ver candidaturas"
                        >
                          <i className="fa-solid fa-file-lines"></i>
                        </button>
                        <button
                          onClick={() => toggleJobActive(job.id, job.is_active)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${job.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={job.is_active ? 'Desativar' : 'Ativar'}
                        >
                          <i className={`fa-solid ${job.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        <button
                          onClick={() => { setEditingJob(job); setShowJobForm(true); }}
                          className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => setDeleteModal({ type: 'job', id: job.id, title: job.title })}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <>
            {/* Filter by job */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedJobId(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedJobId ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-gray-200 hover:border-emerald-300'}`}
              >
                Todas
              </button>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedJobId === job.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-gray-200 hover:border-emerald-300'}`}
                >
                  {job.title}
                </button>
              ))}
            </div>

            {appsLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-slate-500">Nenhuma candidatura recebida.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.pending;
                  return (
                    <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-900">{app.name}</h3>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                            <span><i className="fa-solid fa-envelope mr-1"></i>{app.email}</span>
                            {app.phone && <span><i className="fa-solid fa-phone mr-1"></i>{app.phone}</span>}
                            <span><i className="fa-solid fa-briefcase mr-1 text-emerald-500"></i>{app.jobs?.title || '—'}</span>
                            <span><i className="fa-solid fa-calendar mr-1"></i>{new Date(app.created_at).toLocaleDateString('pt-PT')}</span>
                          </div>
                          {app.message && (
                            <p className="text-sm text-slate-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                              {app.message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {app.cv_url && (
                            <button
                              onClick={() => downloadCV(app.cv_url)}
                              className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <i className="fa-solid fa-file-pdf"></i>
                              CV
                            </button>
                          )}
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="pending">Pendente</option>
                            <option value="reviewed">Analisada</option>
                            <option value="shortlisted">Selecionado</option>
                            <option value="rejected">Rejeitada</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <JobFormModal
            job={editingJob}
            onSave={(saved) => {
              if (editingJob) {
                setJobs(jobs.map(j => j.id === saved.id ? { ...j, ...saved } : j));
              } else {
                setJobs([{ ...saved, job_applications: [{ count: 0 }] }, ...jobs]);
              }
              setShowJobForm(false);
              setEditingJob(null);
            }}
            onClose={() => { setShowJobForm(false); setEditingJob(null); }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal(null)}></div>
            <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-slate-900 mb-2">Eliminar Vaga</h3>
              <p className="text-slate-600 text-sm mb-6">
                Tem a certeza que deseja eliminar <strong>{deleteModal.title}</strong>? 
                Todas as candidaturas associadas serão também eliminadas.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteJob(deleteModal.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Job Form Modal ──────────────────────────────────────────────── */
const JobFormModal = ({ job, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: job?.title || '',
    location: job?.location || 'Braga',
    description: job?.description || '',
    requirements: job?.requirements || '',
    benefits: job?.benefits || '',
    type: job?.type || 'full-time',
    is_active: job?.is_active ?? true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Título e descrição são obrigatórios.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (job?.id) {
        // Update
        const { data, error: updateErr } = await supabase
          .from('jobs')
          .update(form)
          .eq('id', job.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        onSave(data);
      } else {
        // Create
        const { data, error: insertErr } = await supabase
          .from('jobs')
          .insert(form)
          .select()
          .single();

        if (insertErr) throw insertErr;
        onSave(data);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Erro ao guardar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 md:pt-16 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="font-bold text-slate-900 text-lg">
            {job ? 'Editar Vaga' : 'Nova Vaga'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-xmark text-slate-600"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Ex: Consultor Imobiliário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Braga"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {JOB_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Vaga ativa (visível no site)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Descrição detalhada da vaga..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requisitos</label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Um requisito por linha..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Benefícios</label>
            <textarea
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Um benefício por linha..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  A guardar...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  {job ? 'Guardar' : 'Criar Vaga'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobManagement;
