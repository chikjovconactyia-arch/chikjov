-- ==============================================================================
-- SCRIPT DE INSPEÇÃO DE TRIGGERS E FUNÇÕES (DIAGNÓSTICO)
-- Execute este script e compartilhe o resultado se possível.
-- ==============================================================================

-- 1. Listar TODOS os Triggers na tabela `auth.users` (Pode ser a causa do erro de login)
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name,
    string_agg(event_manipulation, ',') as event,
    action_timing as activation,
    action_statement as definition
FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth'
GROUP BY 1,2,3,4,6,7;

-- 2. Listar Triggers na tabela `public.profiles`
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name,
    string_agg(event_manipulation, ',') as event,
    action_timing as activation,
    action_statement as definition
FROM information_schema.triggers
WHERE event_object_table = 'profiles' AND event_object_schema = 'public'
GROUP BY 1,2,3,4,6,7;

-- 3. Verificar estado atual da extensão pgcrypto
SELECT * FROM pg_available_extensions WHERE name = 'pgcrypto';
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- 4. Verificar se a função create_user_by_admin existe e está no schema correto
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_user_by_admin';
