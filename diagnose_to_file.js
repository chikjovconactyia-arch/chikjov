
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    let output = '--- DIAGNOSTICO COMPLETO ---\n';

    const { data: configs } = await supabase.from('refer_earn_config').select('*');
    output += `\n1. CONFIGS (${configs?.length || 0}):\n`;
    configs?.forEach(c => {
        output += `   [ID: ${c.id}] Created: ${c.updated_at}\n`
    });

    const { data: features } = await supabase.from('refer_earn_features').select('*');
    output += `\n2. FEATURES (${features?.length || 0}):\n`;
    features?.forEach(f => {
        output += `   [ID: ${f.id}] -> Config: ${f.config_id} | Title: ${f.title}\n`
    });

    fs.writeFileSync('diagnostico.txt', output);
    console.log('Diagnostico salvo em diagnostico.txt');
}

diagnose();
