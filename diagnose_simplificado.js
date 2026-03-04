
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    console.log('--- DIAGNOSTICO SIMPLIFICADO ---');

    console.log('1. CONFIGS (refer_earn_config):');
    const { data: configs, error: ce } = await supabase.from('refer_earn_config').select('id, headline, updated_at');
    if (ce) console.error('Erro:', ce);
    else configs.forEach(c => console.log(` C-ID: ${c.id} | Head: ${c.headline?.substring(0, 20)}`));

    console.log('2. FEATURES (refer_earn_features):');
    const { data: feats, error: fe } = await supabase.from('refer_earn_features').select('id, config_id, title');
    if (fe) console.error('Erro:', fe);
    else feats.forEach(f => console.log(` F-ID: ${f.id} -> C-ID: ${f.config_id} | T: ${f.title}`));
}

diagnose();
