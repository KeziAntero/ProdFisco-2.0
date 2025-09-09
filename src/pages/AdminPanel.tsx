import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, Users, TrendingUp, Calendar } from 'lucide-react';
import { useAdminRegistros } from '@/hooks/useAdminRegistros';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateProductivityReport } from '@/utils/pdfGenerator';
import type { RegistroProdutividade } from '@/hooks/useRegistros';

export default function AdminPanel() {
  const { profile } = useAuth();
  const { isAdmin } = useAdmin();
  const [mes, setMes] = useState('all');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [fiscalFiltro, setFiscalFiltro] = useState('all');

  const { data: registros = [], isLoading } = useAdminRegistros({ mes, ano, incluirInativos: true });

  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const anos = Array.from({ length: 10 }, (_, i) => {
    const a = new Date().getFullYear() - 5 + i;
    return { value: a.toString(), label: a.toString() };
  });

  const fiscais = Array.from(new Set(registros.map(r => r.user_id))).map((id) => {
    const r = registros.find(x => x.user_id === id);
    return { id, nome: r?.user?.nome || 'Usuário', matricula: r?.user?.matricula || null };
  });

  const registrosFiltrados = registros.filter(r => fiscalFiltro === 'all' || r.user_id === fiscalFiltro);

  const totalRegistros = registrosFiltrados.length;
  const totalPontos = registrosFiltrados.reduce((s, r) => s + (r.total_pontos || 0), 0);
  const mediaPontos = totalRegistros > 0 ? totalPontos / totalRegistros : 0;

  const handlePrint = (registro: RegistroProdutividade) => {
    const rUser = (registro as unknown as { user?: { nome?: string; login?: string; matricula?: string } }).user;
    const userProfile = { nome: rUser?.nome || profile?.nome || 'Usuário', login: rUser?.login || profile?.login || 'unknown', matricula: rUser?.matricula || profile?.matricula };
    generateProductivityReport(registro, userProfile);
  };

  if (isLoading) return <div>Carregando dados...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="ProdFisco Logo" className="w-12 h-12" />
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Relatórios de produtividade de todos os fiscais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Registros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistros}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Pontos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPontos.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm">Média de Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaPontos.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm">Fiscais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fiscais.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Mês</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {meses.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ano</Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fiscal</Label>
              <Select value={fiscalFiltro} onValueChange={setFiscalFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fiscais</SelectItem>
                  {fiscais.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => { setMes('all'); setAno(new Date().getFullYear().toString()); setFiscalFiltro('all'); }}>Limpar Filtros</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Produtividade</CardTitle>
          <CardDescription>Mostrando {totalRegistros} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {registrosFiltrados.length === 0 ? (
            <div>Nenhum registro encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Fiscal</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosFiltrados.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell><Badge variant="outline">#{reg.numero_registro}</Badge></TableCell>
                    <TableCell className="font-medium">{reg.user?.nome || 'Usuário'}</TableCell>
                    <TableCell>{reg.competencia}</TableCell>
                    <TableCell>{format(new Date(reg.data_criacao!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                    <TableCell><Badge variant="secondary">{reg.total_pontos.toFixed(2)} pts</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handlePrint(reg)} title="Imprimir">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
