# Sistema de Produtividade (PRT)

Sistema web para gerenciamento de registros de produtividade de auditores fiscais, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação segura** - Login e cadastro de usuários
- **Gestão de PRTs** - Criação, edição e listagem de registros de produtividade
- **Cálculo automático de pontuação** - Baseado no tipo de serviço e número de fiscais
- **Relatórios em PDF** - Geração de relatórios profissionais com layout padronizado
- **Filtros avançados** - Busca por período, tipo de serviço e outras opções
- **Interface responsiva** - Design moderno e adaptável a diferentes dispositivos

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Autenticação, RLS)
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **UI Components**: Shadcn/ui + Radix UI
- **PDF**: jsPDF + jsPDF AutoTable
- **Estado**: TanStack Query

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd ProdFisco
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute as migrações disponíveis em `supabase/migrations/`
   - Configure as variáveis de ambiente (já configuradas no código)

4. **Execute o projeto**
```bash
npm run dev
```

## 🗄️ Estrutura do Banco

### Tabelas Principais

- **profiles** - Perfis dos usuários (nome, login)
- **servicos** - Tipos de serviços fiscais com pontuação base
- **registros_produtividade** - Registros de PRTs com pontuação calculada

### Políticas RLS

- Usuários só acessam seus próprios registros
- Serviços são públicos para consulta
- Perfis são criados automaticamente no cadastro

## 📊 Como Usar

1. **Cadastro/Login**
   - Acesse a página inicial e faça login ou crie uma conta
   - Confirme o email se necessário

2. **Criar Nova PRT**
   - Use o menu "Nova PRT" 
   - Preencha os dados do registro
   - A pontuação é calculada automaticamente

3. **Visualizar Registros**
   - Acesse "Lista de Produtividade"
   - Use filtros para encontrar registros específicos
   - Clique em "Imprimir" para gerar relatório PDF

4. **Editar Registros**
   - Na lista, clique no ícone de edição
   - Modifique os dados necessários
   - Salve as alterações

## 🎨 Personalização

O sistema usa um design system baseado em tokens CSS:
- Cores e gradientes definidos em `src/index.css`
- Componentes customizáveis em `src/components/ui/`
- Configuração do Tailwind em `tailwind.config.ts`

## 📁 Estrutura de Pastas

```
src/
├── components/         # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Layout.tsx      # Layout principal
│   
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── utils/              # Utilitários (PDF, etc.)
└── integrations/       # Integrações (Supabase)
```

## 🔐 Segurança

- **RLS (Row Level Security)** habilitado em todas as tabelas
- **Autenticação JWT** via Supabase
- **Políticas de acesso** restritivas por usuário
- **Validação de dados** client e server-side

### Manual
1. Build do projeto: `npm run build`
2. Deploy da pasta `dist/` no seu provedor preferido
3. Configure variáveis de ambiente do Supabase

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

