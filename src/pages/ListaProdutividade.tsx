import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Printer, Edit, Trash2 } from 'lucide-react';
import { useRegistros, useDeleteRegistro } from '@/hooks/useRegistros';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateProductivityReport } from '@/utils/pdfGenerator';

export default function ListaProdutividade() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [mes, setMes] = useState('all');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  
  const { data: registros, isLoading } = useRegistros({ mes, ano });
  const deleteRegistro = useDeleteRegistro();

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
    const ano = new Date().getFullYear() - 5 + i;
    return { value: ano.toString(), label: ano.toString() };
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      await deleteRegistro.mutateAsync(id);
    }
  };

  const handlePrint = (registro: any) => {
    if (!profile) {
      alert('Perfil do usuário não encontrado!');
      return;
    }
    
    try {
      generateProductivityReport(registro, profile);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF!');
    }
  };

  if (isLoading) {
    return <div>Carregando registros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="ProdFisco Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">Lista de Produtividade</h1>
            <p className="text-muted-foreground">Histórico de registros de produtividade</p>
          </div>
        </div>
        <Button onClick={() => navigate('/nova-prt')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova PRT
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Mês</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {meses.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ano</Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {anos.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros Encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          {registros && registros.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Total de Pontos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>{registro.numero_registro}</TableCell>
                    <TableCell>{registro.competencia}</TableCell>
                    <TableCell>
                      {format(new Date(registro.data_criacao!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{registro.total_pontos.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(registro)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/editar-prt/${registro.id}`)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(registro.id!)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}