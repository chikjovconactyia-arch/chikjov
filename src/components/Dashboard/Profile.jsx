import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Lock, Camera, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [user, setUser] = useState(null);
    const fileInputRef = React.useRef(null);

    // Form States
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                let { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullName(profile.full_name || '');
                    setAvatarUrl(profile.avatar_url || '');
                } else {
                    setFullName(user.user_metadata?.full_name || '');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (event) => {
        try {
            setMessage(null);
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Selecione uma imagem para enviar.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload for avatars bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Local State
            setAvatarUrl(publicUrl);

            // 4. Persist immediately to DB
            const updates = {
                id: user.id,
                avatar_url: publicUrl,
                updated_at: new Date(),
            };

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (updateError) throw updateError;

            setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao fazer upload da imagem.' });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const updates = {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (profileError) throw profileError;

            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (authError) throw authError;

            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error("As senhas não coincidem.");
                }
                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });
                if (passwordError) throw passwordError;
            }

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
                        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e segurança.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-100 pb-8">
                                <div className="w-full md:w-1/3">
                                    <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil</h3>
                                    <p className="text-sm text-gray-500 mt-1">Essa imagem será exibida publicamente.</p>
                                </div>
                                <div className="w-full md:w-2/3 flex items-center gap-6">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploading}
                                    />

                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-white shadow-md overflow-hidden relative">
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                </div>
                                            )}
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                            ) : (
                                                fullName ? fullName.charAt(0).toUpperCase() : <User size={32} />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCameraClick}
                                            disabled={uploading}
                                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer z-20"
                                            title="Alterar foto"
                                        >
                                            <Camera size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                                        <input
                                            type="text"
                                            value={avatarUrl}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Clique no ícone da câmera para enviar uma nova foto.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-100 pb-8">
                                <div className="w-full md:w-1/3">
                                    <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                                    <p className="text-sm text-gray-500 mt-1">Atualize seus dados de identificação.</p>
                                </div>
                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Seu nome completo"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-1/3">
                                    <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
                                    <p className="text-sm text-gray-500 mt-1">Atualize sua senha de acesso.</p>
                                </div>
                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Deixe em branco para manter a atual"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Repita a nova senha"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="flex items-center gap-2">
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        <span>Salvar Alterações</span>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
