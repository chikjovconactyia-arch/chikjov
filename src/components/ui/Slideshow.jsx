import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Star, Ticket, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSlides } from "../../hooks/useSlides";

const iconMap = {
    star: <Star className="w-5 h-5" />,
    ticket: <Ticket className="w-5 h-5" />,
    mappin: <MapPin className="w-5 h-5" />,
};

/* Compute transition style based on selected effect */
function getTransformStyle(isCurrent, direction, effect) {
    if (isCurrent) {
        switch (effect) {
            case 'flip':
                return { opacity: 1, transform: 'perspective(800px) rotateY(0deg) scale(1)' };
            case 'zoom':
                return { opacity: 1, transform: 'scale(1)' };
            case 'fade':
                return { opacity: 1, transform: 'none' };
            case 'slide':
            default:
                return { opacity: 1, transform: 'translateY(0) scale(1)' };
        }
    }
    // NOT current
    switch (effect) {
        case 'flip':
            return {
                opacity: 0,
                transform: direction === 1
                    ? 'perspective(800px) rotateY(90deg) scale(0.9)'
                    : 'perspective(800px) rotateY(-90deg) scale(0.9)',
            };
        case 'zoom':
            return { opacity: 0, transform: 'scale(0.7)' };
        case 'fade':
            return { opacity: 0, transform: 'none' };
        case 'slide':
        default:
            return {
                opacity: 0,
                transform: direction === 1
                    ? 'translateY(40px) scale(0.97)'
                    : 'translateY(-40px) scale(0.97)',
            };
    }
}

/* Floating particles for ambient effect */
const FloatingParticle = ({ delay, size, x, y, duration }) => (
    <div
        className="absolute rounded-full bg-white/10 pointer-events-none"
        style={{
            width: size,
            height: size,
            left: `${x}%`,
            top: `${y}%`,
            animation: `floatUp ${duration}s ease-in-out ${delay}s infinite`,
        }}
    />
);

/* Progress ring around the slide counter */
const ProgressRing = ({ progress, size = 56, stroke = 3 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;
    return (
        <svg width={size} height={size} className="absolute -rotate-90" style={{ top: -4, left: -4 }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={stroke}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="white"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
            />
        </svg>
    );
};

export default function Slideshow({ className }) {
    const { slides, carouselSettings: settings, loading } = useSlides();
    const [current, setCurrent] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);

    // Filter active slides
    const activeSlides = slides.filter(s => s.is_active || s.active);

    // Autoplay progress timer
    useEffect(() => {
        if (!autoplay || activeSlides.length === 0 || loading) { setProgress(0); return; }
        const dur = settings.speed;
        const step = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += step;
            setProgress(elapsed / dur);
            if (elapsed >= dur) {
                setDirection(1);
                setIsTransitioning(true);
                setCurrent(prev => (prev + 1) % activeSlides.length);
                setTimeout(() => setIsTransitioning(false), 700);
                elapsed = 0;
            }
        }, step);
        return () => clearInterval(timer);
    }, [autoplay, activeSlides.length, current, settings.speed, loading]);

    const goTo = useCallback((index) => {
        if (isTransitioning || index === current) return;
        setDirection(index > current ? 1 : -1);
        setIsTransitioning(true);
        setCurrent(index);
        setProgress(0);
        setTimeout(() => setIsTransitioning(false), 700);
    }, [current, isTransitioning]);

    const nextSlide = useCallback(() => {
        if (isTransitioning || activeSlides.length === 0) return;
        setDirection(1);
        setIsTransitioning(true);
        setCurrent(prev => (prev + 1) % activeSlides.length);
        setProgress(0);
        setTimeout(() => setIsTransitioning(false), 700);
    }, [isTransitioning, activeSlides.length]);

    const prevSlide = useCallback(() => {
        if (isTransitioning || activeSlides.length === 0) return;
        setDirection(-1);
        setIsTransitioning(true);
        setCurrent(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
        setProgress(0);
        setTimeout(() => setIsTransitioning(false), 700);
    }, [isTransitioning, activeSlides.length]);

    if (loading) return (
        <div className="min-h-[100vh] flex items-center justify-center bg-[#1a0533]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (activeSlides.length === 0) return null;

    const slide = activeSlides[current];

    return (
        <div
            className={cn(
                "hero-slideshow relative w-full max-w-[1920px] mx-auto min-h-[100vh] overflow-hidden",
                className
            )}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
        >
            {/* ═══════════════════ BACKGROUND LAYERS ═══════════════════ */}

            {/* Deep gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d0a5e] to-[#0e0420]" />

            {/* Animated mesh gradient */}
            <div
                className="absolute inset-0 opacity-80 transition-opacity duration-1000"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(139, 92, 246, 0.4) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 50% at 60% 80%, rgba(109, 40, 217, 0.25) 0%, transparent 50%),
                        radial-gradient(ellipse 40% 40% at 10% 90%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)
                    `,
                }}
            />

            {/* Grain texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }}
            />

            {/* Floating particles */}
            <FloatingParticle delay={0} size={6} x={15} y={20} duration={8} />
            <FloatingParticle delay={2} size={4} x={75} y={60} duration={10} />
            <FloatingParticle delay={1} size={8} x={40} y={80} duration={7} />
            <FloatingParticle delay={3} size={5} x={85} y={15} duration={12} />
            <FloatingParticle delay={1.5} size={3} x={55} y={45} duration={9} />
            <FloatingParticle delay={4} size={6} x={25} y={70} duration={11} />
            <FloatingParticle delay={0.5} size={4} x={65} y={25} duration={8} />
            <FloatingParticle delay={2.5} size={7} x={90} y={75} duration={10} />

            {/* Glowing orbs */}
            <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[50%] right-[-10%] w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />


            {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
            <div className="relative z-10 w-full min-h-[100vh] flex flex-col md:flex-row items-center justify-between container mx-auto px-6 md:px-16 lg:px-24 pt-12 md:pt-32 pb-24 gap-12 md:gap-0">

                {/* ─── LEFT COLUMN: Text ─── */}
                <div className="w-full md:w-[52%] flex flex-col justify-center items-start text-white relative min-h-[650px] md:min-h-[600px] mt-24 md:mt-0">

                    {activeSlides.map((s, i) => (
                        <div
                            key={s.id || `text-${i}`}
                            className={cn(
                                "absolute inset-0 flex flex-col justify-start md:justify-center transition-all duration-700 ease-in-out pt-20 md:pt-0",
                                i === current ? "opacity-100 z-[50] pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                            )}
                            style={{
                                ...getTransformStyle(i === current, direction, settings.effect),
                            }}
                        >
                            {/* Category Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8 w-fit">
                                <span className="text-purple-300">
                                    {iconMap[s.icon] || <Sparkles className="w-4 h-4" />}
                                </span>
                                <span className="text-sm font-semibold text-white/90 tracking-wide uppercase">
                                    {s.title}
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
                                {s.headline}
                            </h1>

                            {/* Description */}
                            <p className="text-lg lg:text-xl text-white/70 mb-10 leading-relaxed max-w-[500px] font-light">
                                {s.description}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <a
                                    href={s.button_link || s.buttonLink || '#'}
                                    target={(s.button_link || s.buttonLink)?.startsWith('http') ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#6A1BFF] font-bold text-base shadow-[0_8px_32px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 z-50 cursor-pointer pointer-events-auto"
                                >
                                    {s.button_text || s.buttonText}
                                    <ArrowRight className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </a>
                                {(s.second_button_text || s.secondButtonText) && (s.second_button_link || s.secondButtonLink) && (
                                    <a
                                        href={s.second_button_link || s.secondButtonLink}
                                        target={(s.second_button_link || s.secondButtonLink)?.startsWith('http') ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-transparent text-white font-bold text-base border-2 border-white/40 transition-all duration-300 hover:bg-white/10 hover:border-white/70 hover:-translate-y-0.5 z-50 cursor-pointer pointer-events-auto"
                                    >
                                        {s.second_button_text || s.secondButtonText}
                                        <ArrowRight className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── RIGHT COLUMN: Phone Mockup ─── */}
                <div className="w-full md:w-[48%] h-full flex items-center justify-center relative">
                    {/* Phone glow */}
                    <div className="absolute w-[320px] h-[640px] bg-purple-500/20 rounded-[3rem] blur-[80px] z-0 animate-pulse" />

                    {/* Phone Frame */}
                    <div
                        className="relative z-10 transition-transform duration-700 ease-out"
                        style={{
                            transform: `perspective(1200px) rotateY(-8deg) rotateX(2deg) translateZ(0)`,
                        }}
                    >
                        {/* Reflection shimmer */}
                        <div
                            className="absolute inset-0 z-30 rounded-[2.8rem] pointer-events-none overflow-hidden"
                            style={{
                                background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.07) 45%, transparent 50%)',
                            }}
                        />

                        <div className="relative w-[280px] md:w-[320px] h-[570px] md:h-[650px] bg-[#1a1a2e] rounded-[2.8rem] border-[6px] border-[#2a2a3e] shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_60px_rgba(139,92,246,0.15)] overflow-hidden ring-1 ring-white/5">

                            {/* Dynamic Island */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-30 flex items-center justify-center">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a2e] border border-[#333]" />
                            </div>

                            {/* Status Bar */}
                            <div className="absolute top-0 left-0 right-0 h-12 z-20 flex items-center justify-between px-8 pt-1">
                                <span className="text-[10px] text-white/60 font-semibold">9:41</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-2 border border-white/40 rounded-sm relative">
                                        <div className="absolute inset-[1px] bg-white/60 rounded-[1px]" style={{ width: '70%' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content with slide transitions */}
                            <div className="absolute inset-0 w-full h-full">
                                {activeSlides.map((s, i) => (
                                    <div
                                        key={s.id || `img-${i}`}
                                        className="absolute inset-0 w-full h-full transition-all duration-700 ease-out"
                                        style={{
                                            opacity: i === current ? 1 : 0,
                                            transform: i === current
                                                ? 'scale(1)'
                                                : 'scale(1.08)',
                                        }}
                                    >
                                        <img
                                            src={s.image_url || s.img}
                                            alt={s.headline}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Gradient overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent" />
                                    </div>
                                ))}

                                {/* Phone UI overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                    {activeSlides.map((s, i) => (
                                        <div
                                            key={s.id || `ui-${i}`}
                                            className="transition-all duration-500"
                                            style={{
                                                opacity: i === current ? 1 : 0,
                                                transform: i === current ? 'translateY(0)' : 'translateY(20px)',
                                                position: i === current ? 'relative' : 'absolute',
                                                bottom: i === current ? undefined : 0,
                                                left: i === current ? undefined : 0,
                                                right: i === current ? undefined : 0,
                                                padding: i === current ? undefined : '24px',
                                                pointerEvents: i === current ? 'auto' : 'none',
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-purple-300">
                                                    {iconMap[s.icon] || <Star className="w-3 h-3" />}
                                                </div>
                                                <span className="text-[11px] text-white/70 font-medium uppercase tracking-wider">
                                                    {s.title}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-bold text-white leading-tight mb-1">
                                                {s.headline}
                                            </h4>
                                            <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">
                                                {s.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
                                                    {s.button_text || s.buttonText}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Phone bottom nav */}
                                <div className="absolute bottom-0 left-0 right-0 h-[52px] bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-20">
                                    {['M', '◎', '☰'].map((icon, i) => (
                                        <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 text-xs">
                                            {icon}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Home indicator */}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/20 rounded-full z-30" />
                        </div>
                    </div>

                    {/* Floating glass cards around phone */}
                    <div
                        className="absolute z-20 top-[15%] right-[5%] px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl"
                        style={{ animation: 'floatCard 4s ease-in-out infinite' }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                                ✓
                            </div>
                            <div>
                                <p className="text-[11px] text-white/90 font-semibold">Indicação confirmada</p>
                                <p className="text-[10px] text-white/50">+R$ 5,00 de bônus</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="absolute z-20 bottom-[20%] left-[2%] px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl"
                        style={{ animation: 'floatCard 5s ease-in-out 1s infinite' }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white text-xs">
                                🎬
                            </div>
                            <div>
                                <p className="text-[11px] text-white/90 font-semibold">Ingresso resgatado</p>
                                <p className="text-[10px] text-white/50">Cinema Premium</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Navigation Controls (Centered Below) ─── */}
                <div className="w-full flex justify-center items-center gap-6 mt-8 md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2 z-20">
                    <div className="flex gap-3">
                        <button
                            onClick={prevSlide}
                            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-white/70 hover:text-white backdrop-blur-sm"
                            aria-label="Slide anterior"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-white/70 hover:text-white backdrop-blur-sm"
                            aria-label="Próximo slide"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* Pill Indicators */}
                    <div className="flex items-center gap-2">
                        {activeSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={cn(
                                    "relative h-1.5 rounded-full transition-all duration-500",
                                    i === current ? "w-10" : "w-3 hover:bg-white/40"
                                )}
                                aria-label={`Ir para slide ${i + 1}`}
                            >
                                {/* Track */}
                                <div className={cn(
                                    "absolute inset-0 rounded-full",
                                    i === current ? "bg-white/25" : "bg-white/20"
                                )} />
                                {/* Fill */}
                                {i === current && (
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-100"
                                        style={{ width: `${progress * 100}%` }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Slide Counter ─── */}
            <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <ProgressRing progress={progress} size={56} stroke={2} />
                    <span className="text-white/80 font-mono text-xs font-bold">
                        {String(current + 1).padStart(2, '0')}
                    </span>
                </div>
                <div className="text-white/30 font-mono text-xs">
                    / {String(activeSlides.length).padStart(2, '0')}
                </div>
            </div>

            {/* ═══════════════════ KEYFRAME STYLES ═══════════════════ */}
            <style>{`
                @keyframes floatUp {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
                }
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </div>
    );
}
