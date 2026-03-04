import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, Type, Link as LinkIcon, Image as ImageIcon, Layout, BadgeCheck, Plus, Trash2, GripVertical, Upload, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useReferEarnConfig } from '../../hooks/useReferEarnConfig';

const ReferEarnConfig = () => {
    const { config, saveConfig, defaults, loading } = useReferEarnConfig();
    const [formData, setFormData] = useState(defaults);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

    useEffect(() => {
        if (config) {
            setFormData(config);
        }
    }, [config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData(prev => ({ ...prev, features: newFeatures }));
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const addFeature = () => {
        const newFeature = {
            step: "Nova Etapa",
            title: "Novo Título",
            content: "Descrição da nova funcionalidade...",
            image_url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000"
        };
        setFormData(prev => ({
            ...prev,
            features: [newFeature, ...(prev.features || [])]
        }));
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const removeFeature = (index) => {
        if (!confirm('Remover este item?')) return;
        const newFeatures = [...(formData.features || [])];
        newFeatures.splice(index, 1);
        setFormData(prev => ({ ...prev, features: newFeatures }));
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const moveFeature = (index, direction) => {
        const newFeatures = [...(formData.features || [])];
        if (direction === 'up' && index > 0) {
            [newFeatures[index], newFeatures[index - 1]] = [newFeatures[index - 1], newFeatures[index]];
        } else if (direction === 'down' && index < newFeatures.length - 1) {
            [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
        }
        setFormData(prev => ({ ...prev, features: newFeatures }));
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const handleImageUpload = (index, file) => {
        if (!file) return;
        // Validate file size (max 2MB for localStorage)
        if (file.size > 2 * 1024 * 1024) {
            alert('Imagem muito grande! Máximo de 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            handleFeatureChange(index, 'image_url', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveStatus('saving');

        // Simulate network delay for better UX
        setTimeout(() => {
            const success = saveConfig(formData);
            if (success) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        }, 600);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="flex-1 bg-[#f8f9fc] h-screen overflow-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 px-8 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Gestão da Sessão - Indique e Ganhe</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Edite os textos, links e slides da seção de indicação</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveStatus === 'saved' && (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-fade-in">
                                <Check size={16} />
                                <span>Salvo com sucesso</span>
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={saveStatus === 'saving'}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-lg 
                            ${saveStatus === 'saving'
                                    ? 'bg-purple-400 cursor-not-allowed text-white'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'}`}
                        >
                            <span className="flex items-center gap-2">
                                {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>{saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Hero Block Configuration */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <Layout size={18} className="text-purple-600" />
                            <h3 className="font-semibold text-gray-800">Bloco Hero (Topo da Seção)</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Badge & Headline fields ... (kept same as before) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <BadgeCheck size={16} className="text-gray-400" />
                                        Badge Superior
                                    </label>
                                    <input
                                        type="text"
                                        name="badge_text"
                                        value={formData.badge_text || formData.badgeText || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Type size={16} className="text-gray-400" />
                                        Headline Principal
                                    </label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={formData.headline || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-bold text-gray-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    Subheadline
                                </label>
                                <textarea
                                    name="subheadline"
                                    value={formData.subheadline || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors h-16"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    Descrição Detalhada
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors h-24"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features / Slider Configuration */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layout size={18} className="text-purple-600" />
                                <h3 className="font-semibold text-gray-800">Slides & Funcionalidades ({formData.features?.length || 0})</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                            >
                                <Plus size={16} />
                                Adicionar Slide
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {formData.features?.map((feature, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 p-4 transition hover:border-purple-200">
                                    <div className="flex gap-4">
                                        {/* Image Preview */}
                                        <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-300 relative group">
                                            <img src={feature.image_url || feature.image} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Título do Slide</label>
                                                    <input
                                                        type="text"
                                                        value={feature.title}
                                                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500"
                                                        placeholder="Ex: Clube de Descontos"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Etapa / Passo (Opcional)</label>
                                                    <input
                                                        type="text"
                                                        value={feature.step}
                                                        onChange={(e) => handleFeatureChange(index, 'step', e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500"
                                                        placeholder="Ex: Passo 1"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                                                <textarea
                                                    value={feature.content}
                                                    onChange={(e) => handleFeatureChange(index, 'content', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 h-16 resize-none"
                                                    placeholder="Descrição do benefício..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Imagem do Slide</label>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition cursor-pointer border border-purple-200">
                                                        <Upload size={16} />
                                                        Enviar Imagem
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                        />
                                                    </label>
                                                    <span className="text-xs text-gray-400">ou cole uma URL:</span>
                                                    <input
                                                        type="text"
                                                        value={(feature.image_url || feature.image)?.startsWith('data:') ? '' : (feature.image_url || feature.image || '')}
                                                        onChange={(e) => handleFeatureChange(index, 'image_url', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 focus:ring-1 focus:ring-purple-500"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                {(feature.image_url || feature.image) && (
                                                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                                                        <Check size={12} />
                                                        {(feature.image_url || feature.image).startsWith('data:') ? 'Imagem enviada com sucesso' : 'URL externa definida'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'up')}
                                                    disabled={index === 0}
                                                    className={`p-1.5 rounded-lg transition ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                                    title="Mover para cima"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'down')}
                                                    disabled={index === (formData.features?.length || 0) - 1}
                                                    className={`p-1.5 rounded-lg transition ${index === (formData.features?.length || 0) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                                    title="Mover para baixo"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition mt-auto"
                                                title="Remover Slide"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Highlight Box & Buttons */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <BadgeCheck size={18} className="text-purple-600" />
                            <h3 className="font-semibold text-gray-800">Destaque & Botões</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Destaque</label>
                                    <input
                                        type="text"
                                        name="highlight_title"
                                        value={formData.highlight_title || formData.highlightTitle || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Principal</label>
                                    <input
                                        type="text"
                                        name="cta_button_link"
                                        value={formData.cta_button_link || formData.ctaButtonLink || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            {/* Simplified view for other fields to save space/complexity for now as Step 2 covers most needs. 
                                 Ideally I'd add all fields again but I'll focus on the requested missing features part. 
                                 I'll add the rest of the button fields though for completeness. 
                             */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Destaque</label>
                                    <input
                                        type="text"
                                        name="highlight_text"
                                        value={formData.highlight_text || formData.highlightText || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Principal</label>
                                    <input
                                        type="text"
                                        name="cta_button_text"
                                        value={formData.cta_button_text || formData.ctaButtonText || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Secundário</label>
                                    <input
                                        type="text"
                                        name="secondary_button_text"
                                        value={formData.secondary_button_text || formData.secondaryButtonText || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Secundário</label>
                                    <input
                                        type="text"
                                        name="secondary_button_link"
                                        value={formData.secondary_button_link || formData.secondaryButtonLink || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ReferEarnConfig;
