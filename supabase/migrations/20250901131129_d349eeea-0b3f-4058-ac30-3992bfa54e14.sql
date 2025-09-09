-- Add foreign key constraints to connect the tables properly

-- Connect itens_servico to registros_produtividade
ALTER TABLE public.itens_servico 
ADD CONSTRAINT fk_itens_servico_registro 
FOREIGN KEY (registro_id) REFERENCES public.registros_produtividade(id) ON DELETE CASCADE;

-- Connect itens_servico to servicos
ALTER TABLE public.itens_servico 
ADD CONSTRAINT fk_itens_servico_servico 
FOREIGN KEY (servico_id) REFERENCES public.servicos(id) ON DELETE RESTRICT;

-- Connect registros_produtividade to auth.users
ALTER TABLE public.registros_produtividade 
ADD CONSTRAINT fk_registros_produtividade_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Connect profiles to auth.users  
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;