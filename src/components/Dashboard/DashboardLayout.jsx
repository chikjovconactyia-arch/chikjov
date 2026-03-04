import React, { useState } from 'react';
import Sidebar from './Sidebar';
import PreviewSection from './PreviewSection';
import ConfigLandingPage from './ConfigLandingPage';
import SalesFunnel from './SalesFunnel';
import Profile from './Profile';

const DashboardLayout = () => {
    // Definir 'dashboard' como o estado inicial para cair no default (PreviewSection)
    const [activeSection, setActiveSection] = useState('dashboard');

    const renderContent = () => {
        switch (activeSection) {
            case 'perfil':
                return <Profile />;
            case 'config-landingpage':
                return <ConfigLandingPage />;
            case 'funil':
                return <SalesFunnel />;
            case 'dashboard':
            default:
                return <PreviewSection />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f3f4f6]">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            {renderContent()}
        </div>
    );
};

export default DashboardLayout;
