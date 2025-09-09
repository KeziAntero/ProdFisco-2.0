import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';

type Profile = { user_id: string; nome: string; login: string; matricula?: string | null };

export default function AdminUsers() {
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newMatricula, setNewMatricula] = useState('');

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, nome, login, matricula')
        .order('login', { ascending: true });
      return data || [];
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; nome?: string; matricula?: string }) => {
      const { email, password, nome, matricula } = payload;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, matricula } }
      });
      if (authError) throw authError;
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ user_id: authData.user.id, nome: nome || email, login: email, matricula: matricula || null });
        if (profileError) throw profileError;
      }
      return authData;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] })
  });

  const sendResetPassword = async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      alert('E-mail de redefinição enviado para ' + email);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar e-mail de redefinição');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Você não tem permissão para acessar esta página.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Crie usuários, veja a lista de perfis e envie redefinição de senha.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar contas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label>Nova conta</Label>
              <div className="space-y-2">
                <Input placeholder="E-mail" value={newEmail} onChange={(e) => setNewEmail((e.target as HTMLInputElement).value)} />
                <Input placeholder="Senha" type="password" value={newPassword} onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)} />
                <Input placeholder="Nome" value={newNome} onChange={(e) => setNewNome((e.target as HTMLInputElement).value)} />
                <Input placeholder="Matrícula" value={newMatricula} onChange={(e) => setNewMatricula((e.target as HTMLInputElement).value)} />
                <Button
                  onClick={() => {
                    if (!newEmail || !newPassword) return alert('E-mail e senha são obrigatórios');
                    createUserMutation.mutate({ email: newEmail, password: newPassword, nome: newNome, matricula: newMatricula });
                    setNewEmail(''); setNewPassword(''); setNewNome(''); setNewMatricula('');
                  }}
                >
                  Criar Usuário
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Lista de usuários</Label>
              {loadingProfiles ? (
                <div>Carregando usuários...</div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Login</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((p: Profile) => (
                        <TableRow key={p.user_id}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>{p.login}</TableCell>
                          <TableCell>{p.matricula || '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => sendResetPassword(p.login)}>Redefinir senha</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
