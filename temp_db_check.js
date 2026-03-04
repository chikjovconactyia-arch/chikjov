
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env manualmente para garantir
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERRO: Variáveis de ambiente faltando no .env');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Presente' : 'Ausente');
    process.exit(1);
}

console.log('Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key (início):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Tentar um SELECT simples na tabela settings (pública)
        console.log('\n1. Testando SELECT na tabela hero_settings...');
        const { data: settings, error: selectError } = await supabase
            .from('hero_settings')
            .select('*')
            .limit(1);

        if (selectError) {
            console.error('FALHA no SELECT:', selectError.message);
            console.error('Código:', selectError.code);
            console.error('Detalhes:', selectError.details || 'Nenhum detalhe adicional');

            if (selectError.code === '42P01') {
                console.error(' DIAGNÓSTICO: A tabela hero_settings NÃO EXISTE. O script SQL não foi executado corretamente.');
            } else if (selectError.code === 'PGRST301' || selectError.message.includes('JWT')) {
                console.error(' DIAGNÓSTICO: Problema de autenticação (Token inválido ou expirado).');
            }
        } else {
            console.log(' SUCESSO no SELECT! Dados:', settings);
        }

        // Tentar um SELECT na tabela slides (pública)
        console.log('\n2. Testando SELECT na tabela hero_slides...');
        const { data: slides, error: slidesError } = await supabase
            .from('hero_slides')
            .select('*')
            .limit(1);

        if (slidesError) {
            console.error('FALHA no SELECT de slides:', slidesError.message);
        } else {
            console.log(' SUCESSO no SELECT de slides! Contagem:', slides.length);
        }

    } catch (err) {
        console.error('ERRO INESPERADO:', err);
    }
}

testConnection();
