-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  perfil TEXT DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  pontuacao_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para serviços
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para serviços (todos podem ler)
CREATE POLICY "Todos podem visualizar serviços" 
ON public.servicos 
FOR SELECT 
USING (true);

-- Inserir serviços padrão
INSERT INTO public.servicos (codigo, descricao, pontuacao_base) VALUES
('VS001', 'Vistoria inicial', 10.00),
('VS002', 'Vistoria de acompanhamento', 5.00),
('VS003', 'Vistoria final', 15.00),
('FO001', 'Fiscalização de obra', 20.00);

-- Criar tabela de registros de produtividade
CREATE TABLE public.registros_produtividade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_registro SERIAL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL, -- formato MM/AAAA
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_pontos DECIMAL(10,2) NOT NULL DEFAULT 0,
  situacao TEXT NOT NULL DEFAULT 'ativo',
  anotacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.registros_produtividade ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para registros
CREATE POLICY "Usuários podem ver seus próprios registros" 
ON public.registros_produtividade 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios registros" 
ON public.registros_produtividade 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros" 
ON public.registros_produtividade 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios registros" 
ON public.registros_produtividade 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar tabela de itens de serviço
CREATE TABLE public.itens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_id UUID NOT NULL REFERENCES public.registros_produtividade(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
  id_documento TEXT NOT NULL,
  qtd_fiscais INTEGER NOT NULL DEFAULT 1,
  quantidade DECIMAL(10,2),
  pontuacao_calculada DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.itens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para itens de serviço
CREATE POLICY "Usuários podem ver itens de seus registros" 
ON public.itens_servico 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.registros_produtividade rp 
  WHERE rp.id = registro_id AND rp.user_id = auth.uid()
));

CREATE POLICY "Usuários podem criar itens de seus registros" 
ON public.itens_servico 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.registros_produtividade rp 
  WHERE rp.id = registro_id AND rp.user_id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar itens de seus registros" 
ON public.itens_servico 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.registros_produtividade rp 
  WHERE rp.id = registro_id AND rp.user_id = auth.uid()
));

CREATE POLICY "Usuários podem excluir itens de seus registros" 
ON public.itens_servico 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.registros_produtividade rp 
  WHERE rp.id = registro_id AND rp.user_id = auth.uid()
));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registros_updated_at
  BEFORE UPDATE ON public.registros_produtividade
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itens_updated_at
  BEFORE UPDATE ON public.itens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, login)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', new.email),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();