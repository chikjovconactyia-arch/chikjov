import React, { useEffect, useState } from 'react';
import { User, BarChart2, FileText, Settings, LogOut } from 'lucide-react'; // Adicionei LogOut
import { supabase } from '../../lib/supabase'; // Import Supabase Client

const Sidebar = ({ activeSection, onSectionChange }) => {
    const [userData, setUserData] = useState({
        fullName: 'Carregando...',
        role: '...',
        avatarUrl: null
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Buscar perfil na tabela public.profiles
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url, role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserData({
                        fullName: profile.full_name || 'Usuário',
                        role: formatRole(profile.role),
                        avatarUrl: profile.avatar_url
                    });
                } else {
                    // Fallback para metadados se perfil não existir (improvável com o script de fix)
                    setUserData({
                        fullName: user.user_metadata?.full_name || 'Usuário',
                        role: 'Usuário',
                        avatarUrl: null
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário na Sidebar:', error);
            }
        };

        fetchUserData();

        // Listener para atualizar se o perfil mudar (opcional, mas legal)
        const channel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                if (payload.new) {
                    setUserData(prev => ({
                        ...prev,
                        fullName: payload.new.full_name,
                        role: formatRole(payload.new.role),
                        avatarUrl: payload.new.avatar_url
                    }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    const formatRole = (role) => {
        if (!role) return 'Usuário';
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Administrador';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const menuItems = [
        { key: 'dashboard', name: 'Dashboard', icon: <BarChart2 size={20} /> },
        { key: 'perfil', name: 'Perfil', icon: <User size={20} /> },
        { key: 'funil', name: 'Funil de Vendas', icon: <BarChart2 size={20} /> },
        { key: 'relatorios', name: 'Relatorios', icon: <FileText size={20} /> },
        { key: 'config-landingpage', name: 'Config Admin', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="w-64 text-white flex flex-col h-screen flex-shrink-0" style={{ backgroundColor: '#8315d9' }}>
            {/* Logo Section */}
            <div className="p-6 border-b border-white/15">
                <img src="/logo-chikjov.png" alt="ChikJov" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onSectionChange(item.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${activeSection === item.key
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-white/15">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group relative">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shadow-lg text-white overflow-hidden flex-shrink-0">
                        {userData.avatarUrl ? (
                            <img src={userData.avatarUrl} alt={userData.fullName} className="w-full h-full object-cover" />
                        ) : (
                            userData.fullName.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate" title={userData.fullName}>
                            {userData.fullName}
                        </p>
                        <p className="text-xs text-white/60 truncate bg-white/10 inline-block px-1.5 py-0.5 rounded mt-0.5">
                            {userData.role}
                        </p>
                    </div>

                    {/* Logout Button (Opcional, mas útil ter nessa área) */}
                    <button
                        onClick={handleLogout}
                        className="absolute right-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Sair"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
