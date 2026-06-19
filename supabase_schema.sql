-- ==========================================================
-- SCRIPT DE CONFIGURÇÃO DO SUPABASE PARA O SUSTENTABOT
-- Copie e cole na aba SQL Editor do seu projeto Supabase!
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    name TEXT PRIMARY KEY,
    password TEXT NOT NULL DEFAULT '1234',
    region TEXT DEFAULT 'Sudeste',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 100,
    badges JSONB DEFAULT '["welcome"]'::jsonb,
    "carbonSaved" NUMERIC DEFAULT 0,
    "waterSaved" NUMERIC DEFAULT 0,
    "plasticAvoided" NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar segurança RLS (Row Level Security) se desejar
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política simplificada para acesso de leitura/escrita público do app
CREATE POLICY "Permitir leitura e escrita pública nos Perfis" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);
