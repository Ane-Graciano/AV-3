# Projeto Aeronaves

## Descrição
Este projeto é um sistema de gerenciamento de aeronaves, incluindo cadastro de peças, etapas de manutenção, testes e geração de relatórios em PDF.  
Frontend em React + Vite, backend em Node.js + Express, com banco de dados gerenciado via Prisma.

---

## Tecnologias e Versões Principais

### Backend
- Node.js
- TypeScript ^5.9.3
- Express ^5.1.0
- Prisma ^5.19.1
- Bcrypt ^6.0.0
- JSON Web Token ^9.0.2
- Cors ^2.8.5
- Dotenv ^17.2.3
- ts-node ^10.9.2
- Nodemon ^3.0.1
- Tailwind CSS ^4.1.17 (via PostCSS)

### Frontend
- React ^19.1.1
- Vite ^7.1.7
- TypeScript ~5.9.3
- Tailwind CSS ^4.1.16
- React Router DOM ^7.9.5
- React Select ^5.10.2
- React Icons ^5.5.0
- jsPDF ^3.0.4
- html2canvas ^1.4.1
- Vite Plugin React ^5.0.4

---

## Pré-requisitos
- Node.js instalado
- npm ou yarn
- MySQL ou outro banco compatível com Prisma
- Criar um banco de dados para o projeto

---

## Configuração do ambiente

1. **Clonar o repositório**
```bash
git clone <URL_DO_REPOSITORIO>

```

## Configuração do banco de dados

Antes de rodar o projeto, abra o MySQL Workbench e execute os seguintes comandos:

```sql
CREATE DATABASE aerocode_av3;
USE aerocode_av3;

```

### 3. Criar o arquivo `.env`

Na raiz do projeto(av-3) (mesmo nível do `package.json`), crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:senha_do_banco@localhost:3306/aerocode_av3"
JWT_SECRET="av3"
```

### 4. Rodar o projeto

## Back

Antes de entrar nas pastas `back` ou `front`, rode:

```bash
npm install
```
cole esse para gerar o banco
```bash
npx prisma generate
```

```bash
npx prisma migrate dev --name init
```

---

Entre na pasta do backend e instale as dependências
```bash
cd backend
```
depois
```bash
npm install
```

---

## Front

Abra outro terminar para rodar o front
Entre na pasta do **front-end** e instale dependências:

```bash
cd frontend
```

```bash
npm install
```
