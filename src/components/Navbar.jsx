import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    const navLinks = [
        { href: "#seu-aplicativo", label: "Seu aplicativo" },
        { href: "#como-funciona", label: "Como funciona" },
        { href: "#indique-e-ganhe", label: "Indique e Ganhe" },
        { href: "#para-estabelecimentos", label: "Para Estabelecimentos" },
    ];

    return (
        <>
            <header className={`navbar-fixed ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 z-[1100]">
                        <img src="/logo-chikjov.png" alt="ChikJov" className="h-10 md:h-12 w-auto transition-all" />
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link-item"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="https://www.boon.clubecerto.com.br/checkout/ed38d6fe-1735-4e82-b3eb-437ffd99c913"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-enter-desktop text-decoration-none"
                        >
                            <LogIn size={18} className="mr-2" />
                            Assinar Agora!
                        </a>
                    </nav>

                    {/* Mobile Toggle Button */}
                    <button
                        className="lg:hidden p-2 rounded-xl bg-purple-50 text-purple-600 z-[1100] hover:bg-purple-100 transition-colors"
                        onClick={toggleMenu}
                        aria-label="Alternar menu"
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1050] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMenu}
            />

            {/* Mobile Sidebar */}
            <aside className={`mobile-nav-sidebar lg:hidden ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="flex flex-col h-full bg-white">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between border-bottom border-gray-100">
                        <img src="/logo-chikjov.png" alt="ChikJov" className="h-8 w-auto" />
                        <button onClick={closeMenu} className="p-2 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Sidebar Links */}
                    <nav className="flex-1 flex flex-col py-6 overflow-y-auto">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-8 py-4 text-lg font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors border-l-4 border-transparent hover:border-purple-600"
                                onClick={closeMenu}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-6 border-t border-gray-100">
                        <a
                            href="https://www.boon.clubecerto.com.br/checkout/ed38d6fe-1735-4e82-b3eb-437ffd99c913"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 text-decoration-none"
                        >
                            <LogIn size={20} />
                            Assinar Agora!
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
