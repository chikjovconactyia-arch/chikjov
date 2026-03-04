import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const SlideEditor = ({ slide, onUpdate, onClose }) => {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    // Local state for form fields to avoid saving on every keystroke
    const [formData, setFormData] = useState({
        title: '',
        headline: '',
        description: '',
        button_text: '',
        button_link: '',
        second_button_text: '',
        second_button_link: '',
    });

    // Synchronize local state when slide prop changes
    useEffect(() => {
        if (slide) {
            setFormData({
                title: slide.title || '',
                headline: slide.headline || '',
                description: slide.description || '',
                button_text: slide.button_text || slide.buttonText || '',
                button_link: slide.button_link || slide.buttonLink || '',
                second_button_text: slide.second_button_text || slide.secondButtonText || '',
                second_button_link: slide.second_button_link || slide.secondButtonLink || '',
            });
        }
    }, [slide?.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field) => {
        // Save only if value has changed
        const currentValue = slide[field] || (field === 'button_text' ? slide.buttonText : field === 'button_link' ? slide.buttonLink : field === 'second_button_text' ? slide.secondButtonText : field === 'second_button_link' ? slide.secondButtonLink : '');

        if (formData[field] !== currentValue) {
            onUpdate(slide.id, { [field]: formData[field] });
        }
    };

    const handleImageUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Validate image dimensions
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                const is16by9 = Math.abs(ratio - 16 / 9) < 0.1;
                if (!is16by9) {
                    alert(`Proporção recomendada: 16:9 (1920x1080).\nImagem atual: ${img.width}x${img.height}.\nA imagem será usada mesmo assim.`);
                }
                onUpdate(slide.id, { image_url: e.target.result });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    };

    if (!slide) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Editar Slide</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Slide</label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                            } ${slide.img ? 'h-48' : 'h-40'}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {(slide.image_url || slide.img) ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={slide.image_url || slide.img}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-medium">Clique para trocar</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                                <Upload className="w-8 h-8" />
                                <p className="text-sm font-medium">Arraste uma imagem ou clique para enviar</p>
                                <p className="text-xs text-gray-400">Recomendado: 1920x1080 (16:9)</p>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria / Título Secundário</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        onBlur={() => handleBlur('title')}
                        placeholder="Ex: Programas de Indicação"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                </div>

                {/* Headline */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frase de Impacto (Título Principal)</label>
                    <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => handleInputChange('headline', e.target.value)}
                        onBlur={() => handleBlur('headline')}
                        placeholder="Ex: Ganhe para usar!"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        onBlur={() => handleBlur('description')}
                        placeholder="Texto complementar do slide..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                </div>

                {/* CTA Button */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão CTA</label>
                        <input
                            type="text"
                            value={formData.button_text}
                            onChange={(e) => handleInputChange('button_text', e.target.value)}
                            onBlur={() => handleBlur('button_text')}
                            placeholder="Ex: Saiba mais"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link de Destino</label>
                        <input
                            type="text"
                            value={formData.button_link}
                            onChange={(e) => handleInputChange('button_link', e.target.value)}
                            onBlur={() => handleBlur('button_link')}
                            placeholder="Ex: /planos"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* Second Button (Optional) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Segundo Botão <span className="text-gray-400 font-normal">(opcional)</span></label>
                        <input
                            type="text"
                            value={formData.second_button_text}
                            onChange={(e) => handleInputChange('second_button_text', e.target.value)}
                            onBlur={() => handleBlur('second_button_text')}
                            placeholder="Texto do segundo botão"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link do Segundo Botão <span className="text-gray-400 font-normal">(opcional)</span></label>
                        <input
                            type="text"
                            value={formData.second_button_link}
                            onChange={(e) => handleInputChange('second_button_link', e.target.value)}
                            onBlur={() => handleBlur('second_button_link')}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideEditor;
