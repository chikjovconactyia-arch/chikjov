import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const defaultSections = [
    {
        title: "Plataforma",
        links: [
            { name: "Seu aplicativo", href: "#seu-aplicativo" },
            { name: "Como funciona", href: "#como-funciona" },
            { name: "Indique e Ganhe", href: "#indique-e-ganhe" },
            { name: "Para Estabelecimentos", href: "#para-estabelecimentos" },
        ],
    },
    {
        title: "Empresa",
        links: [
            { name: "Sobre nós", href: "#" },
            { name: "Carreiras", href: "#" },
            { name: "Contato", href: "#" },
            { name: "Blog", href: "#" },
        ],
    },
    {
        title: "Suporte",
        links: [
            { name: "Central de Ajuda", href: "#" },
            { name: "Termos de Uso", href: "#" },
            { name: "Privacidade", href: "#" },
            { name: "Status", href: "#" },
        ],
    },
];

const defaultSocialLinks = [
    { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
    { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
    { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
    { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
    { name: "Termos e Condições", href: "#" },
    { name: "Política de Privacidade", href: "#" },
];

export const Footer7 = ({
    logo = {
        url: "/",
        src: "/logo-chikjov.png",
        alt: "ChikJov Logo",
        title: "ChikJov",
    },
    sections = defaultSections,
    description = "A tecnologia que conecta você aos melhores estabelecimentos da sua região com vantagens exclusivas.",
    socialLinks = defaultSocialLinks,
    copyright = `© 2026 Agência WebSic | ConectyIA | Todos os direitos reservados ChikJov.`,
    legalLinks = defaultLegalLinks,
}) => {
    return (
        <footer className="py-20 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
                    <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
                        {/* Logo */}
                        <div className="flex items-center gap-3 lg:justify-start">
                            <a href={logo.url} className="flex items-center gap-2">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    title={logo.title}
                                    className="h-10 w-auto object-contain"
                                />
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    {logo.title}
                                </span>
                            </a>
                        </div>
                        <p className="max-w-[80%] text-base text-gray-500 leading-relaxed">
                            {description}
                        </p>
                        <ul className="flex items-center space-x-6 text-gray-400">
                            {socialLinks.map((social, idx) => (
                                <li key={idx} className="transition-all duration-300 hover:text-purple-600 hover:scale-110">
                                    <a href={social.href} aria-label={social.label}>
                                        {social.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid w-full gap-10 md:grid-cols-3 lg:gap-20">
                        {sections.map((section, sectionIdx) => (
                            <div key={sectionIdx}>
                                <h3 className="mb-6 font-bold text-gray-900 text-lg">{section.title}</h3>
                                <ul className="space-y-4 text-sm text-gray-500">
                                    {section.links.map((link, linkIdx) => (
                                        <li
                                            key={linkIdx}
                                            className="transition-colors duration-200 hover:text-purple-600"
                                        >
                                            <a href={link.href} className="flex items-center gap-2">
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-16 flex flex-col justify-between gap-6 border-t border-gray-100 pt-10 text-sm font-medium text-gray-400 md:flex-row md:items-center">
                    <p className="order-2 lg:order-1">{copyright}</p>
                    <ul className="order-1 flex flex-wrap gap-x-8 gap-y-2 md:order-2">
                        {legalLinks.map((link, idx) => (
                            <li key={idx} className="hover:text-purple-600 transition-colors">
                                <a href={link.href}> {link.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};
