-- =======================================================
-- CORREÇÃO DE DUPLICIDADE (INDIQUE E GANHE)
-- Execute este script para remover configurações duplicadas e recuperar os slides sumidos
-- =======================================================

-- 1. Identificar a Configuração "Boa" (a mais recente, que deve ter os slides)
-- Vamos manter a configuração criada POR ÚLTIMO (que provavelmente é a que você editou recentemente)
-- e apagar as anteriores.

DELETE FROM public.refer_earn_config
WHERE id NOT IN (
    SELECT id
    FROM public.refer_earn_config
    ORDER BY updated_at DESC
    LIMIT 1
);

-- 2. Garantir que as features (slides) órfãs sejam apagadas (opcional, para limpeza)
DELETE FROM public.refer_earn_features
WHERE config_id NOT IN (SELECT id FROM public.refer_earn_config);

-- 3. Confirmação
-- Após rodar, deve restar apenas 1 linha na tabela refer_earn_config.
