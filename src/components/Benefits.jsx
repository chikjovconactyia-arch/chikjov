import React from 'react';
import { Tag, Stethoscope, Scissors, Users } from 'lucide-react';
import './Benefits.css';

const Benefits = () => {
    const benefits = [
        {
            icon: <Tag size={24} />,
            title: "Clube de Descontos",
            description: "Acesse ofertas exclusivas no Clube Certo: cinemas, farmácias e grandes varejistas.",
            color: "#FF4757"
        },
        {
            icon: <Stethoscope size={24} />,
            title: "Telemedicina 24h",
            description: "3 consultas/mês incluídas e atendimento médico a qualquer hora na palma da mão.",
            color: "#2ED573"
        },
        {
            icon: <Scissors size={24} />,
            title: "Descontos em Parceiros",
            description: "Pague menos em cortes, unhas e estética na nossa rede credenciada.",
            color: "#ECCC68"
        },
        {
            icon: <Users size={24} />,
            title: "Indique e Ganhe",
            description: "Ganhe R$ 20 por indicação direta e R$ 5 no segundo nível. Receba via Pix/Asaas.",
            color: "#1E90FF"
        }
    ];

    return (
        <section className="benefits">
            <div className="container">
                <div className="benefits-layout">
                    <div className="benefits-text">
                        <h2 className="section-title">
                            Tudo que você recebe por <span className="text-gradient">R$ 39,90/mês</span>
                        </h2>
                        <p className="section-description">
                            Um investimento que se paga sozinho. Economize mais do que a mensalidade já no primeiro uso.
                        </p>
                        <div className="benefits-cta">
                            <a
                                href="https://www.boon.clubecerto.com.br/checkout/ed38d6fe-1735-4e82-b3eb-437ffd99c913"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                Quero assinar agora
                            </a>
                        </div>

                        <div className="quote-box">
                            "Um app que pode se pagar sozinho apenas com os descontos da farmácia."
                        </div>
                    </div>

                    <div className="benefits-grid">
                        {benefits.map((item, index) => (
                            <div className="benefit-card" key={index}>
                                <div className="benefit-icon" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <h3 className="benefit-title">{item.title}</h3>
                                <p className="benefit-desc">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Benefits;
