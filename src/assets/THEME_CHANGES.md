# Atualização de Cores do Sistema - Base TOTVS

## Resumo das Mudanças

As cores do sistema foram atualizadas para seguir o design system da TOTVS, focado em sistemas de saúde. As alterações foram aplicadas aos temas claro (light) e escuro (dark), bem como nas cores globais do sistema.

## Cores Principais TOTVS

### Azul da Marca (Brand Colors)
- **Primary**: `#0079B8` - Azul TOTVS principal
- **Primary Light**: `#3DADFA` - Azul claro
- **Primary Lighter**: `#AFD3FA` - Azul muito claro
- **Primary Lightest**: `#E3EEFB` - Azul extremamente claro
- **Primary Dark**: `#00659A` - Azul escuro
- **Primary Darker**: `#004064` - Azul muito escuro
- **Primary Darkest**: `#051F31` - Azul profundo

### Cores Neutras (Light Theme)
- **Background**: `#fbfbfb` - Fundo principal
- **Background Secondary**: `#EEEEEE` - Fundo secundário
- **Background Tertiary**: `#D9D9D9` - Fundo terciário
- **Text Primary**: `#000000` - Texto principal
- **Text Secondary**: `#A1A1A1` - Texto secundário
- **Text Tertiary**: `#C1C1C1` - Texto terciário
- **Text Disabled**: `#D1D1D1` - Texto desabilitado

### Cores Neutras (Dark Theme)
- **Background**: `#1C1C1C` - Fundo principal escuro
- **Background Secondary**: `#202020` - Fundo secundário escuro
- **Background Tertiary**: `#2B2B2B` - Fundo terciário escuro
- **Text Primary**: `#F2F2F2` - Texto principal claro
- **Text Secondary**: `#D9D9D9` - Texto secundário claro
- **Text Tertiary**: `#A1A1A1` - Texto terciário claro
- **Text Disabled**: `#5A5A5A` - Texto desabilitado escuro

## Arquivos Modificados

1. **`src/assets/colors.js`**
   - Atualizado com cores da marca TOTVS
   - Cores neutras ajustadas para seguir o padrão TOTVS
   - Cores de texto e fundo atualizadas

2. **`src/assets/themes/light.js`**
   - Cores primárias substituídas pelas cores TOTVS
   - Cores de fundo e texto atualizadas
   - Cores de borda ajustadas

3. **`src/assets/themes/dark.js`**
   - Cores primárias mantidas como TOTVS (consistência)
   - Cores de fundo escuro atualizadas para padrão TOTVS
   - Cores de texto claro ajustadas

4. **`src/assets/themes/index.js`**
   - Cores dos módulos centralizadas em `moduleColors` com o helper `getModuleColors(moduleName)`
   - TUSS e System usam azul TOTVS; DUT mantém o verde da sua identidade visual
   - Cores de accent, header e tableHeader ajustadas

5. **Views dos módulos (`src/modules/tuss/views` e `src/modules/dut/views`)**
   - Passaram a consumir `getModuleColors('tuss')` e `getModuleColors('dut')`
   - Os arquivos locais `modules/tuss/theme.js` e `modules/dut/theme.js` foram removidos

7. **`src/shared/layout/Navbar.jsx`**
   - Botão de tema atualizado com cores TOTVS
   - Texto do botão ajustado para melhor contraste

## Funcionalidade de Troca de Tema

O sistema inclui agora um botão de troca de tema na navbar:
- **☀️ Claro** - Altera para o tema claro
- **🌙 Escuro** - Altera para o tema escuro

O botão usa as cores da marca TOTVS para manter consistência visual.

## Benefícios

1. **Identidade Visual Consistente**: Interface alinhada com sistemas de saúde profissionais
2. **Acessibilidade**: Cores selecionadas com bom contraste
3. **Profissionalismo**: Paleta de cores amplamente testada em ambientes de produção
4. **Escalabilidade**: Sistema de cores bem estruturado para expansão futura

## Referência

As cores foram baseadas no design system oficial da TOTVS, conforme documentação:
- Frameworksp - Definição de Cores por Tema
- Manual de Marca TOTVS
