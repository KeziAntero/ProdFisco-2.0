import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Printer, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useRegistros } from '@/hooks/useRegistros';
import { useAdminRegistros } from '@/hooks/useAdminRegistros';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateProductivityReport } from '@/utils/pdfGenerator';
import type { RegistroProdutividade } from '@/hooks/useRegistros';

type ExtendedRegistro = RegistroProdutividade & { user?: { nome?: string; login?: string; matricula?: string } };

export default function Reports() {
  const { profile } = useAuth();
  const { isAdmin } = useAdmin();
  const [mes, setMes] = useState('all');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [selected, setSelected] = useState<string[]>([]);

  const hook = isAdmin ? useAdminRegistros : useRegistros;
  const { data: registros = [], isLoading } = hook({ mes, ano });

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

  const toggleSelect = (id?: string) => {
    if (!id) return;
    setSelected((s) => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  };

  const generateForRegistro = (registro: ExtendedRegistro) => {
    // perfil a usar no PDF: para admin use dados do próprio registro quando disponíveis
  const fallbackProfile = { nome: profile?.nome || 'Usuário', login: profile?.login || 'unknown', matricula: profile?.matricula };
  const userProfile = isAdmin
    ? ({ nome: registro.user?.nome || fallbackProfile.nome, login: registro.user?.login || fallbackProfile.login, matricula: registro.user?.matricula || fallbackProfile.matricula })
    : fallbackProfile;
    try {
      generateProductivityReport(registro, userProfile);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Erro ao gerar relatório para o registro #' + registro.numero_registro);
    }
  };

  const generateSelected = () => {
  const toGenerate = registros.filter((r: ExtendedRegistro) => selected.includes(r.id));
    if (toGenerate.length === 0) return alert('Nenhum registro selecionado');
    toGenerate.forEach(reg => generateForRegistro(reg));
  };

  const generateAllFiltered = () => {
  registros.forEach((reg: ExtendedRegistro) => generateForRegistro(reg));
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Gerar relatórios de produtividade</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione mês/ano para gerar relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Mês</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
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
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setMes('all'); setAno(new Date().getFullYear().toString()); setSelected([]); }}>Limpar</Button>
            </div>
            <div className="flex items-end justify-end">
              <Button onClick={generateSelected} className="mr-2">Gerar relatórios selecionados</Button>
              <Button variant="outline" onClick={generateAllFiltered}>Gerar relatórios (filtrados)</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {registros.length === 0 ? (
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
                {registros.map((reg: ExtendedRegistro) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <input type="checkbox" checked={selected.includes(reg.id)} onChange={() => toggleSelect(reg.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{reg.user?.nome || reg.user?.login || 'Usuário'}</TableCell>
                    <TableCell>{reg.competencia}</TableCell>
                    <TableCell>{format(new Date(reg.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                    <TableCell><Badge variant="secondary">{reg.total_pontos.toFixed(2)} pts</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => generateForRegistro(reg)} title="Gerar PDF">
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
