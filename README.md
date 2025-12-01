# Projeto Aeronaves

## Descrição
Sistema de gerenciamento de aeronaves, incluindo cadastro de peças, etapas de manutenção, testes e geração de relatórios em PDF.  
Frontend em React + Vite, backend em Node.js + Express, com banco de dados MySQL gerenciado via Prisma.

---

## Tecnologias e Versões Principais

### Backend
- Node.js 20.x (recomendado para compatibilidade com Vite)
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
- Vite ^7.2.4
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
- Node.js 20.x ou superior
- npm ou yarn
- MySQL ou outro banco compatível com Prisma
- NVM (Node Version Manager) recomendado para WSL/Linux
- Criar um banco de dados para o projeto

---

## Configuração do ambiente

### 1. Clonar o repositório

```bash
git clone https://github.com/Ane-Graciano/AV-3
cd AV-3
```

## Configuração do banco de dados

Antes de rodar o projeto, abra o MySQL Workbench e execute os seguintes comandos:

```sql
CREATE DATABASE aerocode_av3;
USE aerocode_av3;
```


### 3. Criar o arquivo `.env`


Na raiz do backend, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:senha_do_banco@localhost:3306/aerocode_av3"
JWT_SECRET="av3"
```

para Linux/WSL

```bash
CREATE USER 'av3user'@'localhost' IDENTIFIED BY 'av3senha';
GRANT ALL PRIVILEGES ON aerocode_av3.* TO 'av3user'@'localhost';
FLUSH PRIVILEGES;
```

```env
DATABASE_URL="mysql://av3user:av3senha@localhost:3306/aerocode_av3"
JWT_SECRET="av3"
```

na raiz do frontend, criar um .env também
```
VITE_API_URL=http://localhost:3000/api
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

Gere o primeiro usuario no banco(workbanch) com o codigo
```bash
insert into funcionario(nome ,telefone , endereco, usuario ,senha  ,nivelPermissao) values('ana','11111111','teste','teste.admin','$2b$10$MDL2GVoovZ6Ijvdf2eALu.DeMTegZd7k/BCQ5Mny76x3wQrXqBAGe','ADMINISTRADOR');
```
ou
```bash
insert into Funcionario(nome ,telefone , endereco, usuario ,senha  ,nivelPermissao) values('ana','11111111','teste','teste.admin','$2b$10$MDL2GVoovZ6Ijvdf2eALu.DeMTegZd7k/BCQ5Mny76x3wQrXqBAGe','ADMINISTRADOR');
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

###logar 
usuairio
```bash
teste.admin
```

senha
```bah
123456
```
