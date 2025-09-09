import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

function formatError(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    // Prefer common fields returned by Supabase/PostgREST
  const e = err as Record<string, unknown>;
  if (typeof e.message === 'string') return e.message as string;
  if (typeof e.error === 'string') return e.error as string;
    try {
      return JSON.stringify(err, null, 2);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export interface ItemServico {
  id?: string;
  servico_id: string;
  id_documento: string;
  qtd_fiscais: number;
  quantidade?: number;
  pontuacao_calculada: number;
  observacoes?: string;
  servico?: {
    descricao: string;
    pontuacao_base: number;
  } | null;
}

export interface RegistroProdutividade {
  id?: string;
  numero_registro?: number;
  competencia: string;
  data_criacao?: string;
  total_pontos: number;
  situacao: string;
  anotacoes?: string;
  itens_servico?: ItemServico[];
}

export function useRegistros(filters?: { mes?: string; ano?: string }) {
  return useQuery({
    queryKey: ['registros', filters],
    queryFn: async () => {
      let query = supabase
        .from('registros_produtividade')
        .select(`
          *,
          itens_servico (
            *,
            servico:servicos (
              descricao,
              pontuacao_base
            )
          )
        `)
        .eq('situacao', 'ativo')
        .order('data_criacao', { ascending: false });

      if (filters?.mes && filters?.mes !== 'all' && filters?.ano) {
        const competencia = `${filters.mes.padStart(2, '0')}/${filters.ano}`;
        query = query.eq('competencia', competencia);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateRegistro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registro: RegistroProdutividade & { itens: ItemServico[] }) => {
      // Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o perfil existe, se não criar um
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            nome: user.user_metadata?.nome || user.email || 'Usuário',
            login: user.email || '',
            matricula: user.user_metadata?.matricula || null,
          });
        
        if (profileError) throw profileError;
      }

      // Criar registro
      const { data: registroData, error: registroError } = await supabase
        .from('registros_produtividade')
        .insert({
          user_id: user.id,
          competencia: registro.competencia,
          total_pontos: registro.total_pontos,
          anotacoes: registro.anotacoes,
        })
        .select()
        .single();

      if (registroError) throw registroError;

      // Criar itens de serviço
      // Remover property `id` para que o banco gere DEFAULT gen_random_uuid()
      const itensWithRegistroId = registro.itens.map(item => {
        const { id: _omitId, ...rest } = item as Partial<ItemServico>;
        return {
          ...rest,
          registro_id: registroData.id,
        } as Omit<ItemServico, 'id'> & { registro_id: string };
      });

      const { error: itensError } = await supabase
        .from('itens_servico')
        .insert(itensWithRegistroId);

      if (itensError) throw itensError;

      return registroData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      toast({
        title: "PRT criada com sucesso!",
        description: "Registro de produtividade salvo.",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Erro ao criar PRT",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRegistro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      registro, 
      itens 
    }: { 
      id: string; 
      registro: RegistroProdutividade; 
      itens: ItemServico[] 
    }) => {
      // Atualizar registro
      const { error: registroError } = await supabase
        .from('registros_produtividade')
        .update({
          competencia: registro.competencia,
          total_pontos: registro.total_pontos,
          anotacoes: registro.anotacoes,
        })
        .eq('id', id);

      if (registroError) throw registroError;

      // Deletar itens existentes
      const { error: deleteError } = await supabase
        .from('itens_servico')
        .delete()
        .eq('registro_id', id);

      if (deleteError) throw deleteError;

      // Inserir novos itens
      // Remover property `id` para que o banco gere DEFAULT gen_random_uuid()
      const itensWithRegistroId = itens.map(item => {
        const { id: _omitId, ...rest } = item as Partial<ItemServico>;
        return {
          ...rest,
          registro_id: id,
        } as Omit<ItemServico, 'id'> & { registro_id: string };
      });

      const { error: itensError } = await supabase
        .from('itens_servico')
        .insert(itensWithRegistroId);

      if (itensError) throw itensError;

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      toast({
        title: "PRT atualizada com sucesso!",
        description: "Registro de produtividade atualizado.",
      });
    },
    onError: (error: unknown) => {
      const message = formatError(error);
      toast({
        title: "Erro ao atualizar PRT",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRegistro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('registros_produtividade')
        .update({ situacao: 'excluido' })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      toast({
        title: "PRT excluída com sucesso!",
        description: "Registro de produtividade removido.",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Erro ao excluir PRT",
        description: message,
        variant: "destructive",
      });
    },
  });
}