import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const USERS_PER_PAGE = 10;

const UserManagement = ({ onClose }) => {
  const { isConfigurator, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isConfigurator || isAdmin) {
      fetchUsers();
    }
  }, [currentPage]);

  useEffect(() => {
    // Filter users based on search term and role
    let filtered = users;
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
    setTotalUsers(filtered.length);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users via REST API...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Users fetched:', data?.length || 0, 'users');

      setUsers(data || []);
      setFilteredUsers(data || []);
      setTotalUsers(data?.length || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Erro ao carregar utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Get the current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || supabaseKey;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert('Função atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Erro ao atualizar função do utilizador');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'configurator':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'seller':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'configurator':
        return 'fa-crown';
      case 'admin':
        return 'fa-shield-halved';
      case 'seller':
        return 'fa-briefcase';
      default:
        return 'fa-user';
    }
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (!isConfigurator && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-700">Acesso Negado</h2>
          <p className="text-gray-500 mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <i className="fa-solid fa-users-gear text-emerald-500"></i>
                Gestão de Utilizadores
              </h1>
              <p className="text-slate-500 mt-2">
                Gerir funções e permissões dos utilizadores
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Utilizadores</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Administradores</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'admin' || u.role === 'configurator').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-shield-halved text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Vendedores</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'seller').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-briefcase text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Utilizadores</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-user text-gray-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Procurar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-700 bg-white min-w-[180px]"
            >
              <option value="all">Todas as funções</option>
              <option value="configurator">Configurador</option>
              <option value="admin">Administrador</option>
              <option value="seller">Vendedor</option>
              <option value="user">Utilizador</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-500 mb-4"></i>
                <p className="text-slate-500">A carregar utilizadores...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <i className="fa-solid fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
                <p className="text-slate-700 font-medium mb-2">Erro ao carregar utilizadores</p>
                <p className="text-slate-500 text-sm max-w-md">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <i className="fa-solid fa-refresh mr-2"></i>
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <i className="fa-solid fa-users text-4xl text-gray-300 mb-4"></i>
                <p className="text-slate-500">Nenhum utilizador encontrado</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Utilizador
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Função Atual
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Data de Registo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <tr key={user.id} onClick={() => setSelectedUser(user)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-gray-200"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                            <i className={`fa-solid ${getRoleIcon(user.role)}`}></i>
                            {user.role === 'configurator' && 'Configurador'}
                            {user.role === 'admin' && 'Administrador'}
                            {user.role === 'seller' && 'Vendedor'}
                            {user.role === 'user' && 'Utilizador'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            {new Date(user.created_at).toLocaleDateString('pt-PT')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {updatingUserId === user.id ? (
                            <i className="fa-solid fa-spinner fa-spin text-emerald-500"></i>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={!isConfigurator && !isAdmin && user.role === 'configurator'}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="user">Utilizador</option>
                              <option value="seller">Vendedor</option>
                              <option value="admin">Administrador</option>
                              {(isConfigurator || isAdmin) && <option value="configurator">Configurador</option>}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    A mostrar {startIndex + 1} a {Math.min(endIndex, totalUsers)} de {totalUsers} utilizadores
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-emerald-500 text-white'
                                : 'border border-gray-300 text-slate-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-slate-400">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-white relative">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{selectedUser.name || 'Sem nome'}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2 bg-white/20 text-white`}>
                      <i className={`fa-solid ${getRoleIcon(selectedUser.role)}`}></i>
                      {selectedUser.role === 'configurator' && 'Configurador'}
                      {selectedUser.role === 'admin' && 'Administrador'}
                      {selectedUser.role === 'seller' && 'Vendedor'}
                      {selectedUser.role === 'user' && 'Utilizador'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-emerald-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-phone text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="text-sm font-medium text-slate-800">{selectedUser.phone || 'Não disponível'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-calendar text-purple-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Data de Registo</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(selectedUser.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-clock text-amber-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Última Atualização</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedUser.updated_at
                        ? new Date(selectedUser.updated_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Não disponível'}
                    </p>
                  </div>
                </div>

                {selectedUser.marketing_consent !== undefined && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <i className={`fa-solid ${selectedUser.marketing_consent ? 'fa-check-circle text-teal-600' : 'fa-times-circle text-red-400'}`}></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Consentimento Marketing</p>
                      <p className="text-sm font-medium text-slate-800">{selectedUser.marketing_consent ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-fingerprint text-slate-500"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ID</p>
                    <p className="text-xs font-mono text-slate-500 break-all">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2.5 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
