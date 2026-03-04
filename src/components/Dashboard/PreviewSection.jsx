import React from 'react';

const PreviewSection = () => {
    return (
        <div className="flex-1 bg-[#f8f9fc] h-screen overflow-auto p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
                    <p className="text-gray-500 mt-1">Bem-vindo de volta ao painel de controle.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white px-4 py-2 rounded-lg text-gray-600 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                        Ajuda
                    </button>
                    <button className="bg-purple-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-600/20">
                        Criar Novo
                    </button>
                </div>
            </header>

            {/* Placeholder Content Area - mimicking a "preview" of dashboard stats/widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total de Vendas</h3>
                    <p className="text-3xl font-bold text-gray-900">R$ 12.450</p>
                    <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                        <span>+12.5%</span>
                        <span className="ml-1 text-gray-500">vs mês anterior</span>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Novos Leads</h3>
                    <p className="text-3xl font-bold text-gray-900">145</p>
                    <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                        <span>+5.2%</span>
                        <span className="ml-1 text-gray-500">vs semana anterior</span>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Conversão</h3>
                    <p className="text-3xl font-bold text-gray-900">3.2%</p>
                    <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
                        <span>-0.8%</span>
                        <span className="ml-1 text-gray-500">vs média</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Big Chart Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex items-center justify-center">
                    <p className="text-gray-400">Gráfico de desempenho será exibido aqui</p>
                </div>

                {/* Activity Feed Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade Recente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">U{i}</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Novo cadastro de usuário</p>
                                    <p className="text-xs text-gray-500">Há {i * 2} horas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewSection;
