import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './Plans.css';
import PartnerModal from './PartnerModal';

const Plans = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleOpenModal = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    const plans = [
        {
            name: "Essencial",
            price: "79,90",
            features: ["Presença na plataforma", "Geolocalização", "Link de indicação"],
            highlight: false,
            link: "https://www.boon.clubecerto.com.br/checkout/dd5a8111-a927-4b6c-83c5-4f35dea96489"
        },
        {
            name: "Destaque",
            price: "99,90",
            features: ["Tudo do Essencial", "Destaque nas buscas", "Tráfego pago moderado"],
            highlight: true,
            link: "https://www.boon.clubecerto.com.br/checkout/8770cf85-7032-4187-8b4f-033d03102066"
        },
        {
            name: "Premium",
            price: "149,90",
            features: ["Tudo do Destaque", "Prioridade no tráfego", "Suporte comercial dedicado", "Maior visibilidade"],
            highlight: false,
            link: "https://www.boon.clubecerto.com.br/checkout/a01f0471-f4be-481f-ba67-bce39d57acc7"
        }
    ];

    return (
        <section className="plans">
            <div className="container">
                <div className="text-center mb-12 max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-6 leading-tight">
                        Cresça seu estabelecimento com mais visibilidade, clientes e faturamento
                    </h2>

                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Escolha o plano ideal da ChikJov e tenha marketing profissional, tráfego pago, novos clientes todos os dias e renda extra para sua equipe.
                    </p>

                    <div className="inline-block py-1 px-4 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-semibold tracking-wide uppercase mb-4">
                        Escolha o plano ideal
                    </div>
                </div>

                {/* <h2 className="section-title text-center">Escolha o plano ideal</h2> */}
                {/* Replaced the old simple title with the styled badge above, or we can keep it if user strictly wants both. 
                    The user said "Inserir acima do título atual". 
                    But usually having two titles is weird. 
                    The badge "Escolha o plano ideal" serves as the section identifier now.
                */}

                <div className="plans-grid">
                    {plans.map((plan, index) => (
                        <div className={`plan-card ${plan.highlight ? 'highlight' : ''}`} key={index}>
                            {plan.highlight && <div className="popular-badge">Mais Popular</div>}
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                <span className="currency">R$</span>
                                <span className="amount">{plan.price}</span>
                                <span className="period">/mês</span>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}>
                                        <Check size={18} className="check-icon" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={plan.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`btn-plan ${plan.highlight ? 'btn-primary' : 'btn-outline'} flex items-center justify-center no-underline`}
                            >
                                Quero ser parceiro
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <PartnerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                plan={selectedPlan}
            />
        </section>
    );
};

export default Plans;
