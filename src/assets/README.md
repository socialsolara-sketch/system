# Assets - Cores e Temas do Sistema

## 📁 Estrutura de Diretórios

```
assets/
├── themes/          # Temas completos (light/dark)
│   ├── light.js    # Tema claro
│   ├── dark.js     # Tema escuro
│   └── index.js    # Exportação de temas e cores dos módulos
├── colors.js       # Cores padrão do sistema
└── README.md       # Documentação
```

## 🎨 Onde Definir Cores do Sistema

### 1. **colors.js** - Cores Padrão Globais
- Define as cores base do sistema
- Cores da marca, funcionais, neutras
- Cores específicas dos componentes
- **Use para:** Definições de cores que não mudam entre temas

### 2. **themes/light.js** - Tema Claro
- Configuração completa do tema claro
- Inclui cores, espaçamentos, bordas, sombras
- **Use para:** Personalização do tema claro

### 3. **themes/dark.js** - Tema Escuro
- Configuração completa do tema escuro
- Cores adaptadas para modo escuro
- **Use para:** Personalização do tema escuro

## 🎯 Como Usar as Cores

### Importando Cores Padrão
```javascript
import { systemColors, semanticColors } from '@/assets/colors'

// Usar cor primária
const primaryColor = systemColors.brand.primary

// Usar cor semântica
const successColor = semanticColors.success
```

### Cores Específicas de Módulos
As cores de cada módulo ficam centralizadas em `themes/index.js` e são acessadas por `getModuleColors`:
```javascript
import { getModuleColors } from '@themes'

const tussColors = getModuleColors('tuss')
const dutColors = getModuleColors('dut')
// Módulos disponíveis: tuss, dut e system (fallback padrão)
```

### Usando Temas
```javascript
import { getTheme } from '@/assets/themes'

// Obter tema específico
const lightTheme = getTheme('light')
const darkTheme = getTheme('dark')

// Usar cores do tema
const primaryColor = lightTheme.colors.primary
const backgroundColor = lightTheme.colors.background
```

## 🏷️ Padrão de Nomenclatura

### Cores da Marca
- `brand.primary` - Cor principal da marca
- `brand.secondary` - Cor secundária
- `brand.accent` - Cor de destaque

### Cores Funcionais
- `functional.success` - Sucesso/verde
- `functional.warning` - Aviso/amarelo
- `functional.error` - Erro/vermelho
- `functional.info` - Informação/azul

### Cores Neutras
- `neutral.white` - Branco puro
- `neutral.black` - Preto puro
- `neutral.gray50-900` - Escala de cinzas

### Cores do Sistema
- `system.header` - Cabeçalho
- `system.sidebar` - Barra lateral
- `system.main` - Área principal
- `system.card` - Cards
- `system.input` - Inputs
- `system.button` - Botões
- `system.link` - Links

## 🔄 Switch de Temas

Para implementar switch de temas:

```javascript
import { getTheme } from '@/assets/themes'

const App = () => {
  const [theme, setTheme] = useState('light')
  const currentTheme = getTheme(theme)
  
  return (
    <div style={{ 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.textPrimary 
    }}>
      {/* Aplicação */}
    </div>
  )
}
```

## 📝 Convenções

1. **Sempre definir cores em inglês**
2. **Usar camelCase para nomes compostos**
3. **Organizar por categoria (brand, functional, neutral, system)**
4. **Manter consistência entre temas light/dark**
5. **Documentar cores não óbvias**

## 🚀 Próximos Passos

1. Implementar sistema de temas nos componentes
2. Criar hook useTheme para facilitar troca de temas
3. Adicionar suporte a temas customizados
4. Integrar com preferências do sistema/usuario
