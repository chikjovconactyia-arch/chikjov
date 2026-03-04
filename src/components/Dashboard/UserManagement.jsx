import React, { useState, useEffect } from 'react';
import { Plus, Search, User, MoreVertical, Shield, ShieldCheck, Mail, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'user' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Usando RPC segura para evitar problemas de RLS na listagem de Admin
            const { data, error } = await supabase
                .rpc('get_all_profiles_secure');

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            // Fallback silencioso (opcional) ou tratamento de erro visual
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        setSuccess(null);

        try {
            // Chama a função RPC segura no banco de dados
            const { data, error } = await supabase.rpc('create_user_by_admin', {
                email_input: newUser.email,
                password_input: newUser.password,
                full_name_input: newUser.fullName,
                role_input: newUser.role === 'colaborador' ? 'user' : newUser.role // Mapeia 'colaborador' -> 'user'
            });

            if (error) throw error;

            setSuccess('Usuário criado com sucesso!');
            setNewUser({ fullName: '', email: '', password: '', role: 'user' });
            setTimeout(() => {
                setShowModal(false);
                setSuccess(null);
                fetchUsers(); // Recarrega a lista
            }, 2000);

        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            setError(err.message || 'Erro ao criar usuário. Tente novamente.');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie os acessos e permissões do sistema ChikJov.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-purple-600/20"
                >
                    <Plus size={18} />
                    Novo Usuário
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou cargo..."
                    className="flex-1 outline-none text-sm text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Cargo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin text-purple-600" />
                                            Carregando usuários...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm overflow-hidden border border-purple-200">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.full_name?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.full_name || 'Usuário Sem Nome'}</p>
                                                    <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'super_admin' ? <ShieldCheck size={16} className="text-purple-600" /> : <User size={16} className="text-gray-400" />}
                                                <span className={`text-sm font-medium ${user.role === 'super_admin' ? 'text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100' :
                                                    user.role === 'admin' ? 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100' :
                                                        'text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200'
                                                    }`}>
                                                    {user.role === 'super_admin' ? 'Super Admin' :
                                                        user.role === 'admin' ? 'Admin' : 'Colaborador'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Novo Usuário</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-sm text-green-700">
                                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="Ex: João Silva"
                                        value={newUser.fullName}
                                        onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="email@exemplo.com"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Senha Temporária</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="Mínimo 6 caracteres"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Cargo (Permissão)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, role: 'colaborador' })}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${newUser.role === 'colaborador'
                                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <User size={16} />
                                        Colaborador
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, role: 'admin' })} // Mantendo 'admin' internamente mas exibindo 'Administrador'
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${newUser.role === 'admin'
                                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Shield size={16} />
                                        Administrador
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        'Criar Usuário'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
