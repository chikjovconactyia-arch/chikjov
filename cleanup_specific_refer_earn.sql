-- =======================================================
-- LIMPEZA ESPECÍFICA (INDIQUE E GANHE)
-- Execute este script para remover a configuração antiga e manter a correta
-- =======================================================

-- 1. Remover a configuração antiga/duplicada (ID detectado no diagnóstico)
-- Esta é a config criada às 00:29 (mais antiga) que tem apenas 1 slide ou está causando conflito.
DELETE FROM public.refer_earn_config
WHERE id = '1ec3a9fe-c6f7-4c99-b4c8-292ee462390c';

-- 2. Garantir limpeza de features orfãs (caso algum slide tenha ficado perdido)
DELETE FROM public.refer_earn_features
WHERE config_id NOT IN (SELECT id FROM public.refer_earn_config);

-- 3. Verificação
-- Após rodar, o sistema deve usar automaticamente a config restante (f9c4ea5b...), que é a mais recente.
