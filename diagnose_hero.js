import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Credentials from .env (user confirmed these are correct for "chikjov" project)
const supabaseUrl = 'https://tkpyrvvwrwslragvazgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHlydnZ3cndzbHJhZ3ZhemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjM2NzQsImV4cCI6MjA4NjczOTY3NH0.wdiV2xLvuayK76O7sdvBrhkNwblLROfiTCGHkOXVomw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    const report = {
        timestamp: new Date().toISOString(),
        url: supabaseUrl,
        slides: { success: false, count: 0, error: null, first_item: null },
        settings: { success: false, count: 0, error: null }
    };

    try {
        // 1. Testar Leitura Pública de Slides
        const { data: slides, error: slidesError } = await supabase.from('hero_slides').select('*');
        if (slidesError) {
            report.slides.error = slidesError;
        } else {
            report.slides.success = true;
            report.slides.count = slides.length;
            if (slides.length > 0) report.slides.first_item = slides[0];
        }

        // 2. Testar Leitura Pública de Configurações
        const { data: settings, error: settingsError } = await supabase.from('hero_settings').select('*');
        if (settingsError) {
            report.settings.error = settingsError;
        } else {
            report.settings.success = true;
            report.settings.count = settings.length;
        }

    } catch (e) {
        report.fatal_error = e.message;
    }

    fs.writeFileSync('diagnosis.json', JSON.stringify(report, null, 2));
    console.log('Diagnosis written to diagnosis.json');
}

diagnose();
