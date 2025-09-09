-- Add matricula field to profiles table
ALTER TABLE public.profiles ADD COLUMN matricula TEXT;

-- Create unique index on matricula to prevent duplicates
CREATE UNIQUE INDEX idx_profiles_matricula ON public.profiles(matricula) WHERE matricula IS NOT NULL;

-- Insert users into auth.users and profiles
-- Note: In a real system, you'd use Supabase dashboard or API to create auth users
-- For now, we'll create the profile records and they can be linked later

-- Insert profiles for the fiscal users
INSERT INTO public.profiles (user_id, nome, matricula, login, perfil) VALUES
(gen_random_uuid(), 'Kézia Antero Rodrigues', '1800', 'kezia@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Alírio Silva Costa', '1802', 'alirio@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Jammes Maxwell S. de Andrade', '1801', 'jammes@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Jarbas Magno Campos de Souza', '1740', 'jarbas@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Josias de Oliveira Batista', '1754', 'josias@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Nadjalyne O. de Andrade Barbosa', '1796', 'nadjalyne@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Reginaldo Lima Duarte', '1723', 'reginaldo@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Rodolfo Celestino P. da Silva', '1741', 'rodolfo@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Rodrigo Pereira Nery', '1739', 'rodrigo@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Rogério Soares Medeiros', '1798', 'rogerio@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Sheila Tania D. de carvalho Benigno', '1934', 'sheila@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Thales Tamargo C. da Costa', '1935', 'thales@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Waldir Cunha de Oliveira', '1300', 'waldir@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Waltenci Amaral da Silva', '1799', 'waltenci@fiscal.com', 'usuario'),
(gen_random_uuid(), 'Marcelo Pereira Alves', '1465', 'marcelo@fiscal.com', 'usuario');

-- Update the handle_new_user function to include matricula
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, login, matricula)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data ->> 'matricula'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;