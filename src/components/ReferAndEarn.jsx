import React from 'react';
import { FeatureSteps } from './ui/FeatureSteps';
import { ArrowRight } from 'lucide-react';
import { useReferEarnConfig } from '../hooks/useReferEarnConfig';

const ReferAndEarn = () => {
    const { config, loading } = useReferEarnConfig();

    if (loading) return (
        <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (!config) return null;

    // Features are now loaded from config
    const features = Array.isArray(config.features) ? config.features : [];

    return (
        <section id="indique-e-ganhe" className="py-20 pt-10 -mt-20 bg-white relative z-10">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-sm font-semibold tracking-wide uppercase mb-4">
                        {config.badge_text || 'Indique e Ganhe'}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {config.headline}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        {config.subheadline}
                    </p>
                    <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {config.description}
                    </p>
                </div>

                {/* Feature Steps Component */}
                <FeatureSteps
                    features={features.map(f => ({
                        step: f.step,
                        title: f.title,
                        content: f.content,
                        image: f.image_url || f.image
                    }))}
                    title="" // Title handled above
                    autoPlayInterval={4000}
                    imageHeight="h-[400px] md:h-[500px]"
                />

                {/* Financial Highlight & CTA */}
                <div className="mt-20 text-center bg-gray-50 rounded-3xl p-8 md:p-12 max-w-5xl mx-auto border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {config.highlight_title}
                        </h3>
                        <p className="text-lg text-gray-600 mb-8">
                            {config.highlight_text}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href={config.cta_button_link} className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                                {config.cta_button_text}
                                <ArrowRight size={20} />
                            </a>
                            <a href={config.secondary_button_link} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition">
                                {config.secondary_button_text}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReferAndEarn;
