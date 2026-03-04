import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Benefits from '../components/Benefits';
import Partners from '../components/Partners';
import Plans from '../components/Plans';
import ReferAndEarn from '../components/ReferAndEarn';
import ChatWidget from '../components/ChatWidget';
import Navbar from '../components/Navbar';
import { Footer7 } from '../components/ui/footer-7';

function Home() {
    return (
        <div className="landing-page">
            <Navbar />

            <main>
                <Hero />
                <HowItWorks />
                <Benefits />
                <ReferAndEarn />
                <Partners />
                <Plans />
                {/* <Form /> Removed as per user request */}
            </main>

            <Footer7 />

            <ChatWidget />
        </div>
    );
}

export default Home;
