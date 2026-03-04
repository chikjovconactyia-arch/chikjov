import React, { useState } from 'react';
import { Images, Type, Palette, Layout, ChevronRight, ArrowLeft, Settings, BadgeCheck, Users } from 'lucide-react';
import ReferEarnConfig from './ReferEarnConfig';
import CarouselConfig from './CarouselConfig';
import UserManagement from './UserManagement';

const subPages = [
    {
        key: 'users',
        name: 'Gestão de Usuários',
        description: 'Cadastre e gerencie acessos ao sistema',
        icon: <Users size={22} />,
        color: 'from-blue-600 to-indigo-600',
    },
    {
        key: 'carrossel-hero',
        name: 'Carrossel Hero',
        description: 'Gerencie os slides da seção principal',
        icon: <Images size={22} />,
        color: 'from-purple-500 to-violet-600',
    },
    {
        key: 'refer-earn',
        name: 'Gestão da Sessão - Indique e Ganhe',
        description: 'Edite a seção de indicação e recompensas',
        icon: <BadgeCheck size={22} />,
        color: 'from-green-500 to-emerald-600',
    },
    {
        key: 'secoes',
        name: 'Seções da Página',
        description: 'Configure as seções de conteúdo',
        icon: <Layout size={22} />,
        color: 'from-blue-500 to-cyan-600',
        comingSoon: true,
    },
    {
        key: 'tipografia',
        name: 'Tipografia & Textos',
        description: 'Fontes, tamanhos e textos globais',
        icon: <Type size={22} />,
        color: 'from-amber-500 to-orange-600',
        comingSoon: true,
    },
    {
        key: 'cores',
        name: 'Cores & Tema',
        description: 'Paleta de cores e tema visual',
        icon: <Palette size={22} />,
        color: 'from-pink-500 to-rose-600',
        comingSoon: true,
    },
];

const ConfigLandingPage = () => {
    const [activeSubPage, setActiveSubPage] = useState(null);

    // Render sub-page content
    if (activeSubPage === 'users') {
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Sub-page breadcrumb header */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setActiveSubPage(null)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
                    >
                        <ArrowLeft size={16} />
                        Config Admin
                    </button>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-sm font-semibold text-gray-900">Gestão de Usuários</span>
                </div>
                <UserManagement />
            </div>
        );
    }

    if (activeSubPage === 'carrossel-hero') {
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Sub-page breadcrumb header */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setActiveSubPage(null)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
                    >
                        <ArrowLeft size={16} />
                        Config Admin
                    </button>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-sm font-semibold text-gray-900">Carrossel Hero</span>
                </div>
                <CarouselConfig />
            </div>
        );
    }

    if (activeSubPage === 'refer-earn') {
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Sub-page breadcrumb header */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setActiveSubPage(null)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
                    >
                        <ArrowLeft size={16} />
                        Config Admin
                    </button>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-sm font-semibold text-gray-900">Indique e Ganhe</span>
                </div>
                <ReferEarnConfig />
            </div>
        );
    }

    // Main sub-pages listing
    return (
        <div className="flex-1 bg-[#f8f9fc] h-screen overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Configuração / Admin</h2>
                        <p className="text-sm text-gray-500">Gerencie usuários e personalize o sistema</p>
                    </div>
                </div>
            </div>

            {/* Sub-pages grid */}
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    {subPages.map((page) => (
                        <button
                            key={page.key}
                            onClick={() => !page.comingSoon && setActiveSubPage(page.key)}
                            disabled={page.comingSoon}
                            className={`group relative flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 ${page.comingSoon
                                ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 cursor-pointer'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                                {page.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900">{page.name}</h3>
                                    {page.comingSoon && (
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                                            Em breve
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{page.description}</p>
                            </div>

                            {/* Arrow */}
                            {!page.comingSoon && (
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConfigLandingPage;
