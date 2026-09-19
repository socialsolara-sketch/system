
# System Frontend

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **CSS Modules** - Estilização

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── assets/          # Cores globais, temas light/dark e cores dos módulos
│   ├── modules/         # Módulos de negócio exibidos pelo System (por hora: DUT e TUSS)
│   │   ├── index.js     # Registro dos módulos: alimenta a navbar, o Dashboard e as rotas
│   │   ├── tuss/views/  # Telas do módulo TUSS
│   │   └── dut/views/   # Telas do módulo DUT
│   ├── shared/          # Código compartilhado da aplicação
│   │   ├── context/     # Estado compartilhado de tema
│   │   └── layout/      # SystemLayout: o próprio System (navbar, rodapé, tema)
│   │       └── views/   # Telas do próprio System (Home, Dashboard e Configurações)
│   │
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Entry point
│
├── public/              # Arquivos públicos
├── index.html           # HTML template
├── vite.config.js       # Configuração do Vite
├── package.json         # Dependências
└── README.md            # Documentação
```

## 🛠️ Configuração

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
# Navegue para a pasta frontend
cd frontend

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Configure as variáveis de ambiente no arquivo .env
```

### Variáveis de Ambiente

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🚀 Comandos

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Lint (se configurado)
npm run lint
```

## 📦 Módulos

### TUSS (Terminologia Unificada da Saúde Suplementar)
- Rotas: `/tuss`, `/tuss/:id`, `/tuss/novo`, `/tuss/editar/:id`
- Funcionalidades: CRUD de registros TUSS

### DUT (Diretrizes de Utilização - ANS)
- Rotas: `/dut`, `/dut/:id`, `/dut/novo`, `/dut/editar/:id`
- Funcionalidades: CRUD de documentos DUT

## System (aplicação e layout)

O System **não é um módulo**: é a aplicação em si e o layout onde os módulos são exibidos. Navbar, rodapé, contexto de tema e o `<Outlet />` que renderiza as telas vivem em `src/shared/layout/SystemLayout.jsx`.

A pasta `modules` contém **apenas os módulos de negócio** — por hora `dut` e `tuss` — cada um com suas telas em `modules/<nome>/views`.

- Layout (o System): `src/shared/layout/SystemLayout.jsx`.
- Telas do próprio System: `src/shared/layout/views/` (Home, Dashboard e Configurações).
- Módulos exibidos pelo System: `src/modules/tuss/views/` e `src/modules/dut/views/`.
- Rotas globais: `/` (Home), `/dashboard` (visão geral dos módulos) e `/configuracoes`.
- Não existe pasta `pages` e não existe `modules/system`: o System é o layout, não um módulo.
- As URLs antigas `/system` e `/system/configuracoes` redirecionam para `/configuracoes`.
- Cores por módulo: `getModuleColors('<nome>')` em `src/assets/themes/index.js`.
- Temas light/dark: `src/assets/themes/`.
- Navbar: `src/shared/layout/Navbar.jsx` (barra superior + sidebar). O ícone hambúrguer abre a **sidebar lateral em overlay** com os módulos registrados; ao clicar em um módulo, a rota muda e o conteúdo é renderizado dentro do System (`<Outlet />` do `SystemLayout`). A sidebar fecha com o backdrop, com o ✕, com `Esc` ou ao escolher um módulo.
- Para um módulo aparecer na navbar e no Dashboard, basta registrá-lo em `src/modules/index.js` (id, label, path e summaryLabel).

## 🧩 Componentes Compartilhados

- `Button` - Botões com variantes (primary, secondary, success, danger, outline)
- `Card` - Containers com header e body
- `Input` - Inputs com validação
- `Modal` - Modais reutilizáveis
- `Loading` - Indicadores de carregamento
- `Alert` - Alertas de sucesso/erro/aviso
- `Header` - Cabeçalho principal
- `Sidebar` - Barra lateral de navegação

## 🔧 Serviços

### API Service
Serviço global para comunicação com backend:
- `get(endpoint)` - Requisições GET
- `post(endpoint, data)` - Requisições POST
- `put(endpoint, data)` - Requisições PUT
- `delete(endpoint)` - Requisições DELETE

### Utils
- `formatDate()` - Formatação de datas
- `formatCurrency()` - Formatação de moeda
- `formatCPF()` - Formatação de CPF
- `formatCNPJ()` - Formatação de CNPJ
- `validateEmail()` - Validação de email
- `validateCPF()` - Validação de CPF
- `validateCNPJ()` - Validação de CNPJ

## 🎨 Estilização

O projeto usa CSS com variáveis CSS para consistência:

```css
--primary-color: #2563eb
--secondary-color: #64748b
--success-color: #22c55e
--danger-color: #ef4444
--warning-color: #f59e0b
```

## 📝 Adicionando Novos Módulos

1. Crie a pasta de telas em `src/modules/<nome>/views/` — é onde ficam as telas do módulo (como TUSS e DUT). Não crie a pasta `pages`, nem `modules/system`: o System é o layout, não um módulo.
2. Registre o módulo em `src/modules/index.js` (`id`, `label`, `path`, `summaryLabel`, `description`): com isso ele já aparece na navbar e no Dashboard do System.
3. Registre as cores do módulo em `moduleColors` e use `getModuleColors('<nome>')` nas telas (`src/assets/themes/index.js`).
4. Registre as rotas do módulo como filhas de SystemLayout em `src/App.jsx`.

## 🔀 Alias de Importação

Configurei aliases no `vite.config.js` para facilitar imports:

```javascript
import Component from '@layout/Card'          // src/shared/layout
import { useTheme } from '@shared/context/ThemeContext' // src/shared
import { modules } from '@modules'            // src/modules
import { getModuleColors } from '@themes'     // src/assets/themes
import { systemColors } from '@assets/colors' // src/assets
```

Aliases disponíveis: `@`, `@modules`, `@assets`, `@themes`, `@layout`, `@shared`.

## 📄 Licença

Este projeto é parte do sistema System.
