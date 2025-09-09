-- Migration: adicionar coluna `login` em profiles e popular a partir de `email`
-- Data: 2025-09-08

-- Adicionar coluna login se não existir
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS login TEXT;

-- Popular login a partir de email para registros existentes
UPDATE public.profiles
SET login = email
WHERE (login IS NULL OR login = '');

-- Criar índice único para login (quando presente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_login ON public.profiles(login) WHERE login IS NOT NULL;

-- Atualizar a função que insere novo profile para preencher também o campo login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, email, login, matricula)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
        NEW.email,
        NEW.email,
        NEW.raw_user_meta_data ->> 'matricula'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger que chama handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Nota: após aplicar esta migration, reinicie o serviço PostgREST/Supabase ou reimplemente o projeto
-- para garantir que o cache de esquema seja atualizado e a coluna `login` esteja disponível.
