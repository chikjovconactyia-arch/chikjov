import React, { useEffect, useRef, useState } from 'react';
import { MapPin, TicketPercent, DollarSign, Sparkles } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Se o elemento estiver visível, setIsVisible(true)
                // Se quisermos efeito de saída ao rolar pra cima/baixo, podemos usar entry.isIntersecting
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.15 } // Trigger when 15% of section is visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const steps = [
        {
            icon: <MapPin className="w-8 h-8" />,
            title: "Encontre perto de você",
            description: "Localize salões, barbearias e clínicas parceiras através da nossa tecnologia de geolocalização inteligente.",
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: <TicketPercent className="w-8 h-8" />,
            title: "Aproveite descontos",
            description: "Use o Clube Certo para economizar em milhares de lojas, cinemas e farmácias em todo o Brasil.",
            color: "from-purple-500 to-violet-600"
        },
        {
            icon: <DollarSign className="w-8 h-8" />,
            title: "Ganhe indicando",
            description: "Compartilhe seu link exclusivo e ganhe R$ 20,00 por cada indicação + renda recorrente.",
            color: "from-emerald-500 to-teal-600"
        }
    ];

    return (
        <section
            id="como-funciona"
            className={`how-it-works mt-24 relative overflow-hidden ${isVisible ? 'is-visible' : ''}`}
            ref={sectionRef}
        >
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2 animate-bounce-subtle">
                        <Sparkles size={14} />
                        <span>Passo a Passo</span>
                    </div>
                    <h2 className="section-title text-4xl md:text-5xl font-extrabold text-[#2D1B69]">
                        Como funciona
                    </h2>
                    <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-violet-400 mx-auto rounded-full" />
                    <p className="section-subtitle text-lg text-gray-500 max-w-2xl mx-auto">
                        Simples, rápido e lucrativo. Comece a economizar e ganhar hoje mesmo.
                    </p>
                </div>

                <div className="steps-grid gap-8">
                    {steps.map((step, index) => (
                        <div
                            className={`step-card group`}
                            key={index}
                            style={{
                                transitionDelay: `${index * 150}ms`,
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
                            }}
                        >
                            <div className="step-card-inner">
                                <div className={`step-icon-outer p-1 rounded-full bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <div className="step-icon-wrapper w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white relative">
                                        {step.icon}
                                        <span className="step-number-badge">{index + 1}</span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <h3 className="step-title text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="step-description text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Decorative connecting line (only for desktop) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/4 -right-4 w-8 border-t-2 border-dashed border-gray-200" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
