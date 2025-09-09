import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RegistroProdutividade } from '@/hooks/useRegistros';

interface UserProfile {
  nome: string;
  login: string;
  matricula?: string;
}

export function generateProductivityReport(
  registro: RegistroProdutividade,
  userProfile: UserProfile
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Configurar fonte
  doc.setFont('helvetica');
  
  // Cabeçalho - Nome da Prefeitura
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PREFEITURA MUNICIPAL DE NOVA CRUZ', pageWidth / 2, 20, { align: 'center' });
  doc.text('SECRETARIA MUNICIPAL DE TRIBUTAÇÃO E ARRECADAÇÃO', pageWidth / 2, 28, { align: 'center' });
  
  // Título do Relatório
  doc.setFontSize(14);
  doc.text('RELATÓRIO DE PRODUTIVIDADE', pageWidth / 2, 40, { align: 'center' });
  
  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);
  
  // Informações do Fiscal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fiscal: ${userProfile.nome}`, 20, 55);
  // Mostrar apenas a matrícula; não usar o e-mail como fallback.
  // Se não houver matrícula registrada, exibir um traço para indicar ausência.
  doc.text(`Matrícula: ${userProfile.matricula ?? '\u2014'}`, 20, 62);
  
  // Informações da Competência e Data
  const dataEmissao = format(new Date(), 'dd/MMM/yyyy', { locale: ptBR });
  doc.text(`Competência: ${registro.competencia}`, pageWidth - 80, 55);
  doc.text(`Data de emissão: ${dataEmissao}`, pageWidth - 80, 62);
  
  // Preparar dados da tabela
  const tableData = registro.itens_servico?.map((item, index) => [
    index + 1, // No. Item
    item.id_documento,
    item.servico?.descricao || 'Serviço não encontrado',
    item.quantidade || 1,
    item.qtd_fiscais,
    item.pontuacao_calculada.toFixed(2),
    item.pontuacao_calculada.toFixed(2), // Pontuação Total (mesmo valor)
    item.observacoes || ''
  ]) || [];
  
  // Criar tabela
  autoTable(doc, {
    startY: 75,
    head: [[
      'No.\nItem',
      'Id do documento',
      'Tipo de serviço',
      'Qtd',
      'Qtd fiscais',
      'Pontuação parcial',
      'Pontuação Total',
      'Observações'
    ]],
    body: tableData,
    tableWidth: pageWidth - 40,
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 }, // No. Item
      1: { halign: 'center', cellWidth: 40 }, // Id do documento
      2: { halign: 'left', cellWidth: 'auto' }, // Tipo de serviço (auto)
      3: { halign: 'center', cellWidth: 12 }, // Qtd
      4: { halign: 'center', cellWidth: 18 }, // Qtd fiscais
      5: { halign: 'center', cellWidth: 28 }, // Pontuação parcial
      6: { halign: 'center', cellWidth: 28 }, // Pontuação Total
      7: { halign: 'left', cellWidth: 'auto' }, // Observações (auto)
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });
  
  // Total geral
  // Acessar lastAutoTable com tipagem segura (evitar `any` para satisfazer lint/TS)
  const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  const finalY = (lastAutoTable?.finalY ?? (doc.internal.pageSize.height - 80)) + 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GERAL DE PONTOS: ${registro.total_pontos.toFixed(2)}`, pageWidth - 60, finalY, { align: 'right' });
  
  // Observações se existirem (com paginação automática)
  if (registro.anotacoes) {
    const marginX = 20;
    const bottomMargin = 30;
    let cursorY = finalY + 15;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFont('helvetica', 'bold');
    // Se não houver espaço suficiente na página atual, criar nova página
    if (cursorY + 10 > pageHeight - bottomMargin) {
      doc.addPage();
      cursorY = 20; // posição inicial na nova página
    }
    doc.text('Observações:', marginX, cursorY);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');
    // Quebrar texto das observações em linhas que caibam na largura da página
    const splitText = doc.splitTextToSize(registro.anotacoes, pageWidth - marginX * 2);
    const lineHeight = 7; // valor seguro para espaçamento entre linhas

    for (const line of splitText) {
      if (cursorY + lineHeight > pageHeight - bottomMargin) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    }
  }
  
  // Paginação e rodapé
  // Tipagem local para acessar APIs de paginação do jsPDF sem `any`
  type DocWithPagination = {
    internal?: { getNumberOfPages?: () => number };
    getNumberOfPages?: () => number;
    setPage?: (n: number) => void;
  };

  const docWithPagination = doc as unknown as DocWithPagination;
  const totalPages = docWithPagination.internal?.getNumberOfPages?.() ?? docWithPagination.getNumberOfPages?.() ?? 1;

  // Adicionar numeração de páginas no canto inferior direito de cada página
  const pageCountY = doc.internal.pageSize.height - 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  for (let i = 1; i <= totalPages; i++) {
    if (docWithPagination.setPage) docWithPagination.setPage(i);
  // Mostrar nome do fiscal seguido da paginação, truncando se necessário para caber
  doc.setFontSize(8);
  const pageSuffix = ` — Página ${i} / ${totalPages}`;
  let nomeFiscal = (userProfile.nome || '').trim();
  let pageLabel = `${nomeFiscal}${pageSuffix}`;
  const availableWidth = pageWidth - 40; // margem total disponível

  // Se o rótulo for maior que a largura disponível, truncar o nome com reticências
  if (doc.getTextWidth(pageLabel) > availableWidth) {
    // reduzir o nome até caber
    while (nomeFiscal.length > 0) {
      nomeFiscal = nomeFiscal.slice(0, -1);
      pageLabel = `${nomeFiscal}...${pageSuffix}`;
      if (doc.getTextWidth(pageLabel) <= availableWidth) break;
    }
    // se não couber nem com nome vazio, exibir apenas a paginação
    if (doc.getTextWidth(pageLabel) > availableWidth) {
      pageLabel = `Página ${i} / ${totalPages}`;
    }
  }

  doc.text(pageLabel, pageWidth - 20, pageCountY, { align: 'right' });
  }

  // Imprimir rodapé de geração apenas na última página
  const lastPage = totalPages;
  if (docWithPagination.setPage) docWithPagination.setPage(lastPage);
  const rodapeY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
    pageWidth / 2,
    rodapeY,
    { align: 'center' }
  );

  // Se houver observações, também imprimir um trecho final delas na parte inferior da última página
  if (registro.anotacoes) {
    const marginX = 20;
    const lineHeight = 7;
    const splitText = doc.splitTextToSize(registro.anotacoes, pageWidth - marginX * 2);
    const maxLinesAtBottom = 6;
    const lastLines = splitText.slice(-maxLinesAtBottom);
    // calcular posição inicial para que o bloco fique acima do rodapé
    let bottomStartY = rodapeY - 8 - lastLines.length * lineHeight;
    // não sobrepor o cabeçalho ou o conteúdo principal
    const minY = 60;
    if (bottomStartY < minY) bottomStartY = Math.max(minY, finalY + 10);

    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', marginX, bottomStartY);
    let y = bottomStartY + 6;
    doc.setFont('helvetica', 'normal');
    for (const line of lastLines) {
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  }
  
  // Gerar e fazer download do PDF
  const fileName = `relatorio_produtividade_${registro.competencia?.replace('/', '_')}_${registro.numero_registro}.pdf`;
  doc.save(fileName);
}