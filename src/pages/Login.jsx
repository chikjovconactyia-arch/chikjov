import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50">
            {/* Lado Esquerdo - Formulário */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
                <div className="mb-8">
                    <img src="/logo-chikjov.png" alt="Chikjov Logo" className="h-12 object-contain" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
                    <p className="text-gray-500 mb-8">Bem-vindo de volta, insira seus dados</p>

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                        <button className="px-8 py-2 bg-white rounded-lg shadow-sm text-gray-900 font-medium text-sm transition-all">Sign In</button>
                        <button className="px-8 py-2 text-gray-500 font-medium text-sm hover:text-gray-900 transition-all">Signup</button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-600" />
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                        © 2026 Agência WebSic | ConectyIA | Todos os direitos reservados ChikJov.
                    </p>
                </motion.div>
            </div>

            {/* Lado Direito - Imagem */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden">
                <img
                    src="/indique e ganhe.png"
                    alt="Promoção Indique e Ganhe"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Login;
