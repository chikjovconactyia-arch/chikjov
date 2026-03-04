import React, { useState } from 'react';
import './Form.css';

const WEBHOOK_URL = 'https://webhookn8n.conectyia.cloud/webhook/8649d194-0fa9-4469-8dc5-d4c490010cbd';

const Form = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', type: 'assinante' });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', type: 'assinante' });
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <section className="contact-form-section">
            <div className="container">
                <div className="form-card">
                    <div className="form-header">
                        <h2 className="form-title">Pronto para começar?</h2>
                        <p className="form-subtitle">Preencha seus dados e entraremos em contato.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="success-message">
                            <h3>🎉 Obrigado!</h3>
                            <p>Recebemos seus dados. Logo entraremos em contato.</p>
                            <button onClick={() => setStatus('idle')} className="btn-reset">Enviar outro</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="signup-form">
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Telefone / WhatsApp</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tenho interesse em ser:</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="assinante"
                                            checked={formData.type === 'assinante'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        <span>Assinante</span>
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="parceiro"
                                            checked={formData.type === 'parceiro'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        <span>Parceiro (Estabelecimento)</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>

                            {status === 'error' && <p className="error-text">Erro ao enviar. Tente novamente.</p>}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Form;
