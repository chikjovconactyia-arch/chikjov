import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Smartphone, MapPin, Instagram, Mail, User } from 'lucide-react';
import { useFunnels, addLeadToFunnel } from '../hooks/useFunnels';

const PartnerModal = ({ isOpen, onClose, plan }) => {
    const { refreshFunnels } = useFunnels();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        instagram: '',
        businessName: '',
        address: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const leadData = {
            ...formData,
            plan: plan?.name || 'Não especificado',
            value: plan?.price ? `R$ ${plan.price}` : 'R$ 0,00',
            instagram: formData.instagram || ''
        };

        const added = await addLeadToFunnel(leadData);

        if (added) {
            setSuccess(true);
            // Opcional: recarregar dados se estiver na mesma página
            if (refreshFunnels) refreshFunnels();

            setTimeout(() => {
                setSuccess(false);
                setFormData({
                    name: '', email: '', whatsapp: '', instagram: '', businessName: '', address: ''
                });
                onClose();
            }, 2500);
        } else {
            alert('Erro ao salvar os dados no funil. Verifique se o banco está configurado.');
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Sucesso!</h3>
                        <p className="text-gray-500">
                            Recebemos seus dados. Em breve nossa equipe entrará em contato com você!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center pt-8 pb-2 px-6">
                            <img src="/logo-chikjov.png" alt="Chikjov" className="h-10 mx-auto mb-4 object-contain" />
                            <h2 className="text-xl font-bold text-gray-900">Quero ser parceiro Chikjov</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Você selecionou o plano <span className="font-bold text-purple-600">{plan?.name}</span>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Nome Completo *</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">WhatsApp *</label>
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            required
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Email *</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Instagram</label>
                                <div className="relative">
                                    <Instagram size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        placeholder="@seu_instagram"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Nome Fantasia do Estabelecimento *</label>
                                <input
                                    required
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Ex: Pizzaria do João"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Endereço do Estabelecimento *</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        placeholder="Rua, número, bairro e cidade"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 flex items-center justify-center py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <span>Enviar</span>
                                    )}
                                </span>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default PartnerModal;
