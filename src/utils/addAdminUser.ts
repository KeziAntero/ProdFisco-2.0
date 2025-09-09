import { supabase } from '@/integrations/supabase/client';

export async function addAdminUser() {
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'adm@fiscal.com',
      password: 'admin123',
      options: {
        data: {
          nome: 'Administrador',
          matricula: '0101',
        },
      },
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          nome: 'Administrador',
          login: 'adm@fiscal.com',
          matricula: '0101',
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        return { success: false, error: profileError.message };
      }

      console.log('Usuário administrador criado com sucesso!');
      return { success: true, user: authData.user };
    }

    return { success: false, error: 'Usuário não foi criado' };
  } catch (error: any) {
    console.error('Erro geral:', error);
    return { success: false, error: error.message };
  }
}

// Função para executar via console do navegador
(window as any).addAdminUser = addAdminUser;
