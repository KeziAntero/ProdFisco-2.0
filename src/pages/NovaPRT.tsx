import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit, Check, X } from 'lucide-react';
import { useServicos } from '@/hooks/useServicos';
import { useCreateRegistro, ItemServico } from '@/hooks/useRegistros';

interface FormItem {
  tempId: string;
  servico_id: string;
  id_documento: string;
  qtd_fiscais: number;
  quantidade?: number;
  pontuacao_calculada: number;
  observacoes?: string;
}

export default function NovaPRT() {
  const navigate = useNavigate();
  const [competencia, setCompetencia] = useState('');
  const [anotacoes, setAnotacoes] = useState('');
  const [itens, setItens] = useState<FormItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [novoItem, setNovoItem] = useState<FormItem>({
    tempId: '',
    servico_id: '',
    id_documento: '',
    qtd_fiscais: 1,
    quantidade: 1,
    pontuacao_calculada: 0,
    observacoes: '',
  });

  const { data: servicos, isLoading: loadingServicos } = useServicos();
  const createRegistro = useCreateRegistro();

  // Gerar competência atual por padrão
  useEffect(() => {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const ano = String(now.getFullYear());
    setCompetencia(`${mes}/${ano}`);
  }, []);

  // Novo cálculo corrigido
  const calcularPontuacao = (
    servicoId: string,
    qtdFiscais: number,
    quantidade: number = 1
  ) => {
    const servico = servicos?.find(s => s.id === servicoId);
    if (!servico) return 0;
    return Number(((servico.pontuacao_base / qtdFiscais) * quantidade).toFixed(2));
  };

  const handleServicoChange = (servicoId: string) => {
    const pontuacao = calcularPontuacao(
      servicoId,
      novoItem.qtd_fiscais,
      novoItem.quantidade ?? 1
    );
    setNovoItem(prev => ({
      ...prev,
      servico_id: servicoId,
      pontuacao_calculada: pontuacao,
    }));
  };

  const handleQtdFiscaisChange = (qtd: number) => {
    const pontuacao = calcularPontuacao(
      novoItem.servico_id,
      qtd,
      novoItem.quantidade ?? 1
    );
    setNovoItem(prev => ({
      ...prev,
      qtd_fiscais: qtd,
      pontuacao_calculada: pontuacao,
    }));
  };

  const handleQuantidadeChange = (quantidade: number | undefined) => {
    const pontuacao = calcularPontuacao(
      novoItem.servico_id,
      novoItem.qtd_fiscais,
      quantidade ?? 1
    );
    setNovoItem(prev => ({
      ...prev,
      quantidade,
      pontuacao_calculada: pontuacao,
    }));
  };

  const adicionarItem = () => {
    if (!novoItem.servico_id || !novoItem.id_documento) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const item: FormItem = {
      ...novoItem,
      tempId: Date.now().toString(),
    };

    setItens(prev => [...prev, item]);
    setNovoItem({
      tempId: '',
      servico_id: '',
      id_documento: '',
      qtd_fiscais: 1,
      quantidade: 1,
      pontuacao_calculada: 0,
      observacoes: '',
    });
  };

  const removerItem = (tempId: string) => {
    setItens(prev => prev.filter(item => item.tempId !== tempId));
  };

  const iniciarEdicao = (item: FormItem) => {
    setEditingItem(item.tempId);
    setNovoItem(item);
  };

  const cancelarEdicao = () => {
    setEditingItem(null);
    setNovoItem({
      tempId: '',
      servico_id: '',
      id_documento: '',
      qtd_fiscais: 1,
      quantidade: 1,
      pontuacao_calculada: 0,
      observacoes: '',
    });
  };

  const salvarEdicao = () => {
    if (!novoItem.servico_id || !novoItem.id_documento) {
      return;
    }

    setItens(prev => prev.map(item => 
      item.tempId === editingItem ? novoItem : item
    ));
    
    cancelarEdicao();
  };

  const totalPontos = itens.reduce((sum, item) => sum + item.pontuacao_calculada, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um item de serviço');
      return;
    }

    const itensServico: ItemServico[] = itens.map(item => ({
      servico_id: item.servico_id,
      id_documento: item.id_documento,
      qtd_fiscais: item.qtd_fiscais,
      quantidade: item.quantidade,
      pontuacao_calculada: item.pontuacao_calculada,
      observacoes: item.observacoes,
    }));

    try {
      await createRegistro.mutateAsync({
        competencia,
        total_pontos: totalPontos,
        situacao: 'ativo',
        anotacoes,
        itens: itensServico,
      });
      
      navigate('/lista');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  if (loadingServicos) {
    return <div>Carregando serviços...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="ProdFisco Logo" className="w-12 h-12" />
        <div>
          <h1 className="text-3xl font-bold">Criar nova PRT</h1>
          <p className="text-muted-foreground">Registro de Produtividade Fiscal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="competencia">Competência</Label>
                <Input
                  id="competencia"
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  placeholder="MM/AAAA"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="anotacoes">Anotações</Label>
              <Textarea
                id="anotacoes"
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                placeholder="Observações gerais sobre este registro..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Serviço</CardTitle>
            <CardDescription>Complete os campos abaixo para adicionar um item de serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="id_documento">ID Documento *</Label>
                <Input
                  id="id_documento"
                  value={novoItem.id_documento}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, id_documento: e.target.value }))}
                  placeholder="ID do documento"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5">
                <Label>Tipo de Serviço *</Label>
                <Select value={novoItem.servico_id} onValueChange={handleServicoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {servicos?.filter(servico => servico.id && servico.id.trim() !== '').map((servico) => (
                      <SelectItem key={servico.id} value={servico.id}>
                        {servico.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <Label htmlFor="qtd_fiscais">Qtd. Fiscais *</Label>
                <Input
                  id="qtd_fiscais"
                  type="number"
                  min="1"
                  value={novoItem.qtd_fiscais}
                  onChange={(e) => handleQtdFiscaisChange(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={novoItem.quantidade || ''}
                  onChange={(e) => handleQuantidadeChange(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={novoItem.observacoes || ''}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre este item"
                />
              </div>

              <div>
                <Label>Pontuação Calculada</Label>
                <Input
                  value={novoItem.pontuacao_calculada.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <Button type="button" onClick={adicionarItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>

        {itens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens Adicionados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>ID Documento</TableHead>
                    <TableHead>Qtd. Fiscais</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item) => {
                    const servico = servicos?.find(s => s.id === item.servico_id);
                    const isEditing = editingItem === item.tempId;
                    
                    return (
                      <TableRow key={item.tempId}>
                        <TableCell>
                          {isEditing ? (
                            <Select value={novoItem.servico_id} onValueChange={handleServicoChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o serviço" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicos?.filter(servico => servico.id && servico.id.trim() !== '').map((servico) => (
                                  <SelectItem key={servico.id} value={servico.id}>
                                    {servico.descricao}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            servico?.descricao
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={novoItem.id_documento}
                              onChange={(e) => setNovoItem(prev => ({ ...prev, id_documento: e.target.value }))}
                              placeholder="ID do documento"
                            />
                          ) : (
                            item.id_documento
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              value={novoItem.qtd_fiscais}
                              onChange={(e) => handleQtdFiscaisChange(Number(e.target.value))}
                            />
                          ) : (
                            item.qtd_fiscais
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={novoItem.quantidade || ''}
                              onChange={(e) => handleQuantidadeChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Quantidade"
                            />
                          ) : (
                            item.quantidade || '-'
                          )}
                        </TableCell>
                        <TableCell>{item.pontuacao_calculada.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={salvarEdicao}
                                  title="Salvar"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelarEdicao}
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => iniciarEdicao(item)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerItem(item.tempId)}
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total de Pontos:</span>
                  <span>{totalPontos.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/lista')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createRegistro.isPending}>
            {createRegistro.isPending ? 'Salvando...' : 'Salvar PRT'}
          </Button>
        </div>
      </form>
    </div>
  );
}
