import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminRegistros(filters?: { mes?: string; ano?: string; incluirInativos?: boolean }) {
  return useQuery({
    queryKey: ['admin-registros', filters],
    queryFn: async () => {
      let query = supabase
        .from('registros_produtividade')
        .select(`
          *,
          user:profiles!registros_produtividade_user_id_fkey (
            nome,
            login,
            matricula
          ),
          itens_servico (
            *,
            servico:servicos (
              descricao,
              pontuacao_base
            )
          )
        `)
        .order('data_criacao', { ascending: false });

      // por padrão filtrar apenas ativos; se incluirInativos estiver true, não aplica o filtro
      if (!filters?.incluirInativos) {
        query = query.eq('situacao', 'ativo');
      }

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
