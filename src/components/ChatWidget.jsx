import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import './ChatWidget.css';

const WEBHOOK_URL = 'https://webhookn8n.conectyia.cloud/webhook/Chat-landingpage';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Olá! Sou IA da ChikJov. Como posso te ajudar hoje?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substring(7));
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [messages, isOpen]);

    // Initialize Speech Recognition once
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'pt-BR';
            recognition.interimResults = true; // Permite ver o texto enquanto fala

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                setInput(transcript);

                // Se a fala foi finalizada (pelo tempo de silêncio do navegador)
                if (event.results[0].isFinal) {
                    setIsListening(false);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech error", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("Acesso ao microfone negado. Por favor, habilite nas configurações do navegador.");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Seu navegador não suporta reconhecimento de voz.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Failed to start recognition:", error);
                // Se já estiver rodando, para e inicia de novo
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 100);
            }
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (textToSend = input) => {
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 0);
        setIsLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    sessionId: sessionId
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Trata diferentes formatos de resposta do n8n
                let botText = "";
                if (typeof data === 'string') {
                    botText = data;
                } else if (Array.isArray(data) && data.length > 0) {
                    botText = data[0].output || data[0].message || data[0].text || JSON.stringify(data[0]);
                } else {
                    botText = data.output || data.message || data.text || (typeof data === 'object' ? JSON.stringify(data) : "Desculpe, não entendi.");
                }

                const botMsg = { id: Date.now() + 1, text: botText, sender: 'bot' };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error('Webhook error');
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Desculpe, estou com dificuldades de conexão no momento. Tente novamente em instantes.", sender: 'bot', isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-widget">
            {/* Toggle Button */}
            <button
                className={`chat-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat support"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4M8 16h.01M16 16h.01" /></svg>
                        </div>
                        <div>
                            <h3>ChikJov IA</h3>
                            <span className="status">Online</span>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-content">
                                    {msg.text}
                                    {msg.sender === 'bot' && (
                                        <button className="speak-btn" onClick={() => speak(msg.text)} title="Ouvir">
                                            <Volume2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="message bot"><div className="typing-indicator"><span>.</span><span>.</span><span>.</span></div></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <button
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={toggleListening}
                            title="Falar"
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Digite sua mensagem..."
                            disabled={isLoading}
                        />
                        <button className="send-btn" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
