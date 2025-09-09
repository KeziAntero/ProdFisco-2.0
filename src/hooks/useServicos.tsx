import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Servico {
  id: string;
  codigo: string;
  descricao: string;
  pontuacao_base: number;
  ativo: boolean;
}

export function useServicos() {
  return useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('descricao');

      if (error) throw error;
      return data as Servico[];
    },
  });
}