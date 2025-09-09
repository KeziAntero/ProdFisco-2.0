-- Reconfigurar banco: recriar tabelas e inserir serviços

-- Dropar tabelas existentes (em ordem devido às foreign keys)
DROP TABLE IF EXISTS public.itens_servico CASCADE;
DROP TABLE IF EXISTS public.registros_produtividade CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recriar tabela de perfis
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    login TEXT NOT NULL,
    perfil TEXT DEFAULT 'usuario',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de serviços
CREATE TABLE public.servicos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    pontuacao_base NUMERIC NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de registros de produtividade
CREATE TABLE public.registros_produtividade (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    numero_registro SERIAL,
    competencia TEXT NOT NULL,
    total_pontos NUMERIC NOT NULL DEFAULT 0,
    situacao TEXT NOT NULL DEFAULT 'ativo',
    anotacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de itens de serviço
CREATE TABLE public.itens_servico (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    registro_id UUID NOT NULL REFERENCES public.registros_produtividade(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
    id_documento TEXT NOT NULL,
    qtd_fiscais INTEGER NOT NULL DEFAULT 1,
    quantidade NUMERIC,
    pontuacao_calculada NUMERIC NOT NULL DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_produtividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para servicos
CREATE POLICY "Todos podem visualizar serviços" ON public.servicos FOR SELECT USING (true);

-- Políticas RLS para registros_produtividade
CREATE POLICY "Usuários podem ver seus próprios registros" ON public.registros_produtividade FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar seus próprios registros" ON public.registros_produtividade FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios registros" ON public.registros_produtividade FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem excluir seus próprios registros" ON public.registros_produtividade FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para itens_servico
CREATE POLICY "Usuários podem ver itens de seus registros" ON public.itens_servico FOR SELECT USING (
    EXISTS (SELECT 1 FROM registros_produtividade rp WHERE rp.id = itens_servico.registro_id AND rp.user_id = auth.uid())
);
CREATE POLICY "Usuários podem criar itens de seus registros" ON public.itens_servico FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM registros_produtividade rp WHERE rp.id = itens_servico.registro_id AND rp.user_id = auth.uid())
);
CREATE POLICY "Usuários podem atualizar itens de seus registros" ON public.itens_servico FOR UPDATE USING (
    EXISTS (SELECT 1 FROM registros_produtividade rp WHERE rp.id = itens_servico.registro_id AND rp.user_id = auth.uid())
);
CREATE POLICY "Usuários podem excluir itens de seus registros" ON public.itens_servico FOR DELETE USING (
    EXISTS (SELECT 1 FROM registros_produtividade rp WHERE rp.id = itens_servico.registro_id AND rp.user_id = auth.uid())
);

-- Inserir serviços completos
INSERT INTO public.servicos (codigo, descricao, pontuacao_base) VALUES
('APR001', 'Apuração de R$ 1,00 a R$ 500,00', 1.0),
('APR002', 'Apuração de R$ 501,00 a R$ 1.000,00', 2.0),
('APR003', 'Apuração de R$ 1.001,00 a R$ 3.000,00', 2.5),
('APR004', 'Apuração de R$ 3.001,00 a R$ 5.000,00', 3.0),
('APR005', 'Apuração de R$ 5.001,00 a R$ 8.000,00', 4.0),
('APR006', 'Apuração de R$ 8.001,00 a R$ 10.000,00', 6.0),
('APR007', 'Apuração de R$ 10.001,00 a R$ 16.000,00', 8.0),
('APR008', 'Apuração acima de R$ 16.000,01', 10.0),
('SER001', 'Serviço concluído com apuração da receita COM contagem dos ingressos, por show', 2.0),
('SER002', 'Serviço concluído com apuração da receita SEM contagem dos ingressos, por show', 1.0),
('ALT001', 'Alteração cadastral no mercantil', 0.2),
('ATE001', 'Atendimento para suporte NFS_e', 0.5),
('ATE002', 'Atendimento para suporte NFS_e (Virtual)', 0.2),
('AVE001', 'Averiguação de estabelecimento comercial', 1.5),
('BAI001', 'Baixa/Suspensão de atividade mercantil', 0.2),
('CAD001', 'Cadastro mercantil', 0.5),
('CAD002', 'Cadastro mercantil de ofício', 0.4),
('COB001', 'Cobrança Feira livre', 5.0),
('CON001', 'Consulta documentos auxiliares', 0.5),
('CON002', 'Consulta REDESIM', 1.0),
('NOT001', 'Nota fiscal avulsa', 0.1),
('DEC001', 'Declaração de substituição de veículo', 0.5),
('DEC002', 'Declaração de taxista', 0.2),
('DEC003', 'Declaração de transferência de placa de aluguel para particular', 0.2),
('INC001', 'Inclusão de cadastro para taxista', 0.5),
('ATE003', 'Atendimento (Geral)', 0.1),
('CON003', 'Confecção de Certidões ou Similar', 0.5),
('DES001', 'Despacho', 1.0),
('ENT001', 'Entrega de termo de Confissão de dívida', 3.0),
('INS001', 'Inscrição de débitos em Dívida ativa, por inscrição', 0.3),
('JOR001', 'Jornada dupla', 2.0),
('LAU001', 'Laudo e parecer fund. em consultas e requerimento, protocolo, ou processo judicial', 2.0),
('MAN001', 'Manifestação em defesa de auto de infração', 4.0),
('PAR001', 'Parcelamento', 0.1),
('PRE001', 'Prescrição de débitos (por exercícios)', 0.1),
('DES002', 'Despacho final (Fiscalização cumprida)', 1.0),
('EMB001', 'Embargos de Obras ou atividades', 2.0),
('FIS001', 'Fiscalização cumprida, por contribuinte (Homologação)', 2.0),
('FIS002', 'Fiscalização especial, com dedicação exclusiva, por determinação do secretário, por dia', 3.0),
('IND001', 'Indicação de eventos', 3.0),
('LAV001', 'Lavratura do termo de encerramento de fiscalização', 2.0),
('LAV002', 'Lavratura do termo de início de fiscalização', 1.0),
('LEV001', 'Levantamento de ISS na fonte', 5.0),
('LEV002', 'Levantamento fiscal cumprido por até 12 meses', 5.0),
('LEV003', 'Levantamento fiscal cumprido por até 24 meses', 7.0),
('LEV004', 'Levantamento fiscal por fração proporcional, até 06 meses', 3.0),
('ORD001', 'Ordem de fiscalização cumprida com termo de conclusão', 1.0),
('ORD002', 'Ordem de serviço cumprida, com embaraço, devidamente notificada', 1.0),
('ORD003', 'Ordem de serviço não cumprida, com embaraço à fiscalização', 2.0),
('PLA001', 'Plantão fiscal – em cumprimento da escala normal, por dia', 2.0),
('POR001', 'Por fração proporcional, até 06 meses', 3.0),
('REL001', 'Relatório de encaminhamento ao MP', 2.0),
('TER001', 'Termo de início de fiscalização', 1.0),
('VER001', 'Verificação da falta de recolhimento de tributos', 0.5),
('VER002', 'Verificação em doc. Auxiliares no levantamento fiscal, na falta dos livros, e/ou notas fiscais, por exercício', 0.5),
('VER003', 'Verificação em livros contábeis', 2.0),
('VER004', 'Verificação em livros fiscais instituídos pela municipalidade', 0.2),
('ALT002', 'Alteração cadastral imobiliária', 0.2),
('ATU001', 'Atualização de IPTU', 0.3),
('AVA001', 'Avaliação de ITIV', 1.5),
('BAI002', 'Baixa de Cadastro Imobiliário', 0.2),
('CAD003', 'Cadastro de enumeração imobiliário', 0.1),
('CAD004', 'Cadastro ignorado (Localização CPF)', 1.7),
('CAD005', 'Cadastro imobiliário de ofício', 0.3),
('CAD006', 'Cadastro imobiliário em campo', 0.4),
('CAD007', 'Cadastro imóvel novo', 0.3),
('CON004', 'Confecção de croqui', 3.0),
('IND002', 'Indicação de contribuinte não localizado', 0.5),
('IND003', 'Indicação de contribuinte novo', 0.5),
('SEP001', 'Separação e organização dos carnes de IPTU', 0.3),
('NOT002', 'Notificação de débitos em aberto ainda não inscritos em DA', 0.5),
('NOT003', 'Notificação voluntária sem O.S.', 0.2);

-- Recriar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON public.registros_produtividade FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_itens_updated_at BEFORE UPDATE ON public.itens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recriar função para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, login)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();