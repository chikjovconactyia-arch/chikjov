import React from 'react';
import { TrendingUp, Users, Calendar, Repeat } from 'lucide-react';
import './Partners.css';

const Partners = () => {
    const features = [
        {
            icon: <TrendingUp size={24} />,
            title: "Mais Visibilidade",
            description: "Marketing digital e tráfego pago no Google e Meta para atrair clientes da região."
        },
        {
            icon: <Calendar size={24} />,
            title: "Agenda Cheia",
            description: "Nossa tecnologia conecta usuários próximos que buscam seus serviços agora."
        },
        {
            icon: <Users size={24} />,
            title: "Renda Extra Equipe",
            description: "Cada colaborador recebe um link próprio para indicar e ganhar comissões."
        },
        {
            icon: <Repeat size={24} />,
            title: "Fidelização",
            description: "Clientes retornam pelo cashback e clube de vantagens integrado."
        }
    ];

    return (
        <section id="para-estabelecimentos" className="partners">
            <div className="container">
                <div className="partners-header">
                    <span className="badge-b2b">Para Estabelecimentos</span>
                    <h2 className="section-title">Cresça com a ChikJov</h2>
                    <p className="section-subtitle">Mais visibilidade. Mais clientes. Mais faturamento.</p>
                </div>

                <div className="partners-grid">
                    {features.map((feature, index) => (
                        <div className="partner-card" key={index}>
                            <div className="partner-icon">
                                {feature.icon}
                            </div>
                            <h3 className="partner-title">{feature.title}</h3>
                            <p className="partner-desc">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;
