# Quiz App - Frontend

Uma aplicação de quiz moderna e interativa desenvolvida em React, com design personalizado e experiência de usuário aprimorada.

## 🎨 Design e Personalização

### Logo e Identidade Visual
- **Logo**: Utiliza o logo oficial da aplicação (`/logo192.png` e `/logo512.png`)
- **Cores**: Paleta personalizada baseada em tons de Indigo (#6366F1, #4F46E5, #818CF8)
- **Tema**: Design dark mode moderno com gradientes sofisticados

### Componentes Principais

#### Header Component
- **Localização**: `src/components/Header.js`
- **Funcionalidades**:
  - Logo clicável que redireciona para a página inicial
  - Design responsivo
  - Efeitos de hover e animações suaves
  - Integração com todas as páginas da aplicação

#### LoadingSpinner Component
- **Localização**: `src/components/LoadingSpinner.js`
- **Características**:
  - Animação de loading personalizada com cores do tema
  - Múltiplos tamanhos (small, medium, large)
  - Texto customizável
  - Efeitos de pulse e rotação

### Páginas Atualizadas

#### Home Page
- Header com logo integrado
- Design responsivo e moderno
- Botões com gradientes personalizados
- Animações suaves

#### Dashboard
- Header com menu de usuário
- Interface limpa e organizada
- Botões de ação com design consistente

#### Login/Register
- Formulários com design moderno
- Validação visual aprimorada
- Cores e gradientes personalizados

#### Quiz
- Interface de jogo redesenhada
- Estatísticas em tempo real
- Resultados com design atrativo

## 🎯 Funcionalidades

### Sistema de Autenticação
- Login com email e senha
- Autenticação de dois fatores (2FA)
- Modo convidado
- Registro de novos usuários

### Sistema de Quiz
- Múltiplas dificuldades (Fácil, Médio, Difícil, Aleatório)
- Sistema de pontuação dinâmico
- Timer por pergunta
- Histórico de partidas

### Ranking e Perfil
- Ranking global de jogadores
- Perfil personalizado
- Estatísticas detalhadas
- Histórico de desempenho

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework principal
- **React Router**: Navegação entre páginas
- **Formik + Yup**: Validação de formulários
- **Axios**: Requisições HTTP
- **CSS3**: Estilos personalizados com variáveis CSS

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento**:
   ```bash
   npm start
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── Header.js              # Componente de cabeçalho com logo
│   ├── LoadingSpinner.js      # Componente de loading personalizado
│   ├── ConfirmModal.js        # Modal de confirmação
│   └── ProtectedRoute.js      # Rotas protegidas
├── pages/
│   ├── Home.js               # Página inicial
│   ├── Login.js              # Página de login
│   ├── Register.js           # Página de registro
│   ├── Dashboard.js          # Dashboard principal
│   ├── Quiz.js               # Interface do quiz
│   └── ...                   # Outras páginas
├── styles/
│   ├── global.css            # Estilos globais e variáveis CSS
│   ├── Header.css            # Estilos do header
│   ├── LoadingSpinner.css    # Estilos do loading
│   └── ...                   # Estilos específicos das páginas
└── Routes.js                 # Configuração de rotas
```

## 🎨 Variáveis CSS Personalizadas

```css
:root {
  /* Cores principais */
  --primary-color: #6366F1;
  --primary-hover: #4F46E5;
  --primary-light: #818CF8;
  
  /* Cores de fundo */
  --background-dark: #0F172A;
  --background-light: #1E293B;
  --background-card: #334155;
  
  /* Cores de texto */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  --gradient-secondary: linear-gradient(135deg, var(--background-light), var(--background-card));
}
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=http://localhost:3001
```

### Personalização de Cores
Para alterar as cores do tema, edite as variáveis CSS em `src/styles/global.css`.

## 📄 Licença

Este projeto está sob a licença MIT.
