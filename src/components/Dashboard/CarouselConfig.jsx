import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Eye, EyeOff, Trash2, Edit3, Check, XCircle, AlertCircle, Image as ImageIcon, Settings, Timer, Sparkles, Layers, RotateCcw, Zap } from 'lucide-react';
import { useSlides } from '../../hooks/useSlides';
import SlideEditor from './SlideEditor';
import SlidePreview from './SlidePreview';
import './CarouselConfig.css';

const CarouselConfigContent = () => {
    const { slides, loading, saveStatus, carouselSettings, updateCarouselSettings, addSlide, updateSlide, deleteSlide, toggleSlide, reorderSlides } = useSlides();
    const [editingId, setEditingId] = useState(null);
    const [previewId, setPreviewId] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);

    // Update previewId when slides load if not set
    useEffect(() => {
        if (!previewId && slides.length > 0) {
            setPreviewId(slides[0].id);
        }
    }, [slides, previewId]);

    // Safe derived state
    const editingSlide = editingId ? (slides.find(s => s.id === editingId) || null) : null;
    const previewSlide = previewId ? (slides.find(s => s.id === previewId) || (slides.length > 0 ? slides[0] : null)) : (slides.length > 0 ? slides[0] : null);

    const handleAdd = async () => {
        if (saveStatus === 'auth_error') {
            alert('Erro de Conexão: O projeto do Supabase está inacessível ou pausado. Verifique seu painel do Supabase.');
            return;
        }
        const newId = await addSlide();
        if (newId) {
            setEditingId(newId);
            setPreviewId(newId);
        }
    };

    const handleDelete = (id) => {
        if (!confirm('Tem certeza que deseja excluir este slide?')) return;
        deleteSlide(id);
        if (editingId === id) setEditingId(null);
        if (previewId === id) {
            const remainingSlides = slides.filter(s => s.id !== id);
            setPreviewId(remainingSlides[0]?.id || null);
        }
    };

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        reorderSlides(dragIndex, index);
        setDragIndex(index);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="carousel-config flex-1 bg-[#f8f9fc] h-screen overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 px-8 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Configuração do Carrossel Hero</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Gerencie os slides da seção principal da landing page</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveStatus === 'saved' && (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-fade-in">
                                <Check size={16} />
                                <span>Salvo</span>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium animate-fade-in" title="Erro de permissão ou conexão no banco de dados">
                                <XCircle size={16} />
                                <span>Erro ao salvar</span>
                            </div>
                        )}
                        {saveStatus === 'auth_error' && (
                            <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium animate-fade-in" title="Erro 401: Falha na autenticação com Supabase">
                                <AlertCircle size={16} />
                                <span>Erro de Conexão</span>
                            </div>
                        )}
                        <button
                            onClick={handleAdd}
                            disabled={saveStatus === 'saving'}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 ${saveStatus === 'saving' || saveStatus === 'auth_error' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="flex items-center justify-center w-4 h-4">
                                {saveStatus === 'saving' ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Plus size={16} />
                                )}
                            </span>
                            <span>Adicionar Slide</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {saveStatus === 'auth_error' && (
                    <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-orange-800">Conexão Perdida com o Banco de Dados (Erro 401)</h4>
                            <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                                O Supabase rejeitou as credenciais. Por favor:
                                <br />• Verifique se o projeto está <strong>Ativo</strong> no painel do Supabase.
                                <br />• Verifique se as chaves no arquivo <code>.env</code> estão corretas.
                            </p>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left: Slide List + Editor */}
                    <div className="space-y-6">
                        {/* Slide List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Slides ({slides.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {slides.map((slide, index) => (
                                    <div
                                        key={slide.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-move group ${dragIndex === index ? 'bg-purple-50 border-l-2 border-purple-500' : 'hover:bg-gray-50'
                                            } ${previewId === slide.id ? 'bg-purple-50/50' : ''}`}
                                        onClick={() => setPreviewId(slide.id)}
                                    >
                                        {/* Drag Handle */}
                                        <div className="text-gray-300 group-hover:text-gray-500 transition-colors">
                                            <GripVertical size={16} />
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                            {(slide.image_url || slide.img) ? (
                                                <img src={slide.image_url || slide.img} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={14} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {slide.headline || 'Sem título'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {slide.title || 'Sem categoria'}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSlide(slide.id); }}
                                                className={`p-1.5 rounded-lg transition-colors ${(slide.is_active || slide.active)
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={(slide.is_active || slide.active) ? 'Desativar slide' : 'Ativar slide'}
                                            >
                                                {(slide.is_active || slide.active) ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingId(slide.id); setPreviewId(slide.id); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                title="Editar slide"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(slide.id); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Excluir slide"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${(slide.is_active || slide.active)
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {(slide.is_active || slide.active) ? 'Ativo' : 'Inativo'}
                                        </div>
                                    </div>
                                ))}

                                {slides.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <ImageIcon className="mx-auto text-gray-300 mb-3" size={40} />
                                        <p className="text-gray-500 text-sm">Nenhum slide criado</p>
                                        <button
                                            onClick={handleAdd}
                                            className="mt-3 text-purple-600 text-sm font-medium hover:underline"
                                        >
                                            Criar primeiro slide
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slide Editor */}
                        {editingSlide && (
                            <SlideEditor
                                slide={editingSlide}
                                onUpdate={updateSlide}
                                onClose={() => setEditingId(null)}
                            />
                        )}
                    </div>

                    {/* Right: Preview */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-700">Preview do Slide</h3>
                            </div>
                            <div className="p-4">
                                <SlidePreview slide={previewSlide} />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-2xl font-bold text-gray-900">{slides.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Total</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-2xl font-bold text-green-600">{slides.filter(s => s.is_active || s.active).length}</p>
                                <p className="text-xs text-gray-500 mt-1">Ativos</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-2xl font-bold text-gray-400">{slides.filter(s => !(s.is_active || s.active)).length}</p>
                                <p className="text-xs text-gray-500 mt-1">Inativos</p>
                            </div>
                        </div>

                        {/* ── Carousel Settings Panel ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <Settings size={15} className="text-gray-500" />
                                <h3 className="text-sm font-semibold text-gray-700">Configurações do Carrossel</h3>
                            </div>
                            <div className="p-5 space-y-6">

                                {/* Speed Control */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Timer size={15} className="text-purple-500" />
                                            <label className="text-sm font-medium text-gray-700">Velocidade do Autoplay</label>
                                        </div>
                                        <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                                            {(carouselSettings.speed / 1000).toFixed(1)}s
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={3000}
                                        max={15000}
                                        step={500}
                                        value={carouselSettings.speed}
                                        onChange={(e) => updateCarouselSettings({ speed: Number(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1"><Zap size={10} /> Rápido</span>
                                        <span className="text-[11px] text-gray-400">Lento</span>
                                    </div>
                                </div>

                                {/* Transition Effect */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles size={15} className="text-purple-500" />
                                        <label className="text-sm font-medium text-gray-700">Efeito de Transição</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'slide', label: 'Deslizar', icon: <Layers size={16} />, desc: 'Vertical suave' },
                                            { value: 'fade', label: 'Fade', icon: <Sparkles size={16} />, desc: 'Aparição gradual' },
                                            { value: 'zoom', label: 'Zoom', icon: <Zap size={16} />, desc: 'Escala com fade' },
                                            { value: 'flip', label: 'Flip', icon: <RotateCcw size={16} />, desc: 'Rotação 3D' },
                                        ].map((fx) => (
                                            <button
                                                key={fx.value}
                                                onClick={() => updateCarouselSettings({ effect: fx.value })}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${carouselSettings.effect === fx.value
                                                    ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-500/10'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${carouselSettings.effect === fx.value
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {fx.icon}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${carouselSettings.effect === fx.value ? 'text-purple-700' : 'text-gray-700'
                                                        }`}>{fx.label}</p>
                                                    <p className="text-[11px] text-gray-400">{fx.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Error Boundary for UI Stability ---
class CarouselErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Carousel UI Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 p-12 bg-[#f8f9fc] h-screen overflow-auto">
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-red-100 shadow-xl p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ops! A interface encontrou um erro.</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Ocorreu uma falha inesperada na renderização do carrossel.
                            Isso pode ser causado por dados corrompidos ou falha na sincronização com o banco de dados.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20"
                            >
                                Recarregar Página
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition">Ver detalhes técnicos</summary>
                                <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-[10px] text-gray-500 overflow-auto max-h-40 font-mono">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const CarouselConfig = () => (
    <CarouselErrorBoundary>
        <CarouselConfigContent />
    </CarouselErrorBoundary>
);

export default CarouselConfig;
