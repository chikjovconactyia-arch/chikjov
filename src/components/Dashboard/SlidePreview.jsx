import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SlidePreview = ({ slide }) => {
    if (!slide) {
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-400 text-sm">Selecione um slide para visualizar</p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div className="relative w-full aspect-video bg-gradient-to-br from-[#8A2BE2] via-[#6A1BFF] to-[#4B00B5] overflow-hidden">
                {/* Background Decorative */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center px-8 md:px-12">
                    {/* Left: Text */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center text-white space-y-3 py-6">
                        {slide.title && (
                            <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">
                                {slide.title}
                            </h3>
                        )}
                        <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight">
                            {slide.headline || 'Título do Slide'}
                        </h1>
                        {slide.description && (
                            <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-sm">
                                {slide.description}
                            </p>
                        )}
                        {(slide.button_text || slide.buttonText) && (
                            <button className="mt-2 px-5 py-2 rounded-full bg-white text-[#6A1BFF] font-bold text-xs shadow-lg w-fit">
                                {slide.button_text || slide.buttonText}
                            </button>
                        )}
                    </div>

                    {/* Right: Phone Mockup */}
                    <div className="w-full md:w-1/2 h-full flex items-center justify-center">
                        <div className="relative w-[120px] md:w-[150px] h-[240px] md:h-[300px] bg-black rounded-[2rem] border-[4px] border-gray-900 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-10" />
                            {(slide.image_url || slide.img) ? (
                                <img src={slide.image_url || slide.img} alt="Slide preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Sem imagem</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <p className="text-[8px] font-medium opacity-80">{slide.title}</p>
                                <h4 className="text-xs font-bold">{slide.headline}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fake Navigation */}
                <div className="absolute bottom-4 left-8 flex items-center gap-3 z-20">
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60">
                        <ArrowLeft size={14} />
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60">
                        <ArrowRight size={14} />
                    </div>
                    <div className="flex gap-1.5 ml-2">
                        <div className="w-6 h-1.5 rounded-full bg-white" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlidePreview;
