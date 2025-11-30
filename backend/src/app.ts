import * as dotenv from 'dotenv';
dotenv.config()
import express, { Application, Request, Response } from 'express';
import { metricaMiddleware } from './middlewares/metricaMiddleware';
import { prisma } from './services/base.service'; 
import funcionarioRoutes from './routes/funcionario.route';
import aeronaveRoutes from './routes/aeronave.route';
import processoRoutes from './routes/processos.route';
import nivelAcessoRoutes from './routes/nivelAcesso.route';
import { EnumController } from './controllers/enums.controller';
import cors from 'cors';

const enumController = new EnumController();

const app: Application = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: 'http://localhost:5173', // Altere para a porta do seu frontend, se for diferente
}));

// Middleware para JSON
app.use(express.json())

// Middleware de Métricas 
app.use(metricaMiddleware)

// --- ROTAS ---
app.use('/api/funcionarios', funcionarioRoutes)
app.use('/api/aeronaves', aeronaveRoutes)
app.use('/api', processoRoutes)
app.use('/api/nivelAcesso', nivelAcessoRoutes)
app.get('/api/tipoAeronave', enumController.listarTiposAeronave);
app.get('/api/statusEtapa', enumController.listarStatusEtapa);
app.get('/api/statusPeca', enumController.listarStatusPeca);
app.get('/api/tiposPeca', enumController.listarTiposPeca);
app.get('/api/tiposTeste', enumController.listarTiposTeste);
app.get('/api/tiposResultTeste', enumController.listarTiposResultTeste);

// Rota de Teste Simples
app.get('/', (req: Request, res: Response) => {
    res.send('API da AV3 - Sistema de Gestão de Produção de Aeronaves')
});

// Inicialização do Servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // Testa a conexão com o banco de dados
    prisma.$connect()
        .then(() => {
            console.log('Conexão com o MySQL via Prisma estabelecida com sucesso.')
        })
        .catch((e: any) => {
            console.error('Falha na conexão com o banco de dados:', e);
            // Em um sistema crítico, você pode querer encerrar o app se o DB cair
            // process.exit(1); 
        });
});

// Tratamento de encerramento
process.on('SIGINT', () => {
    console.log('Servidor encerrando...')
    server.close(() => {
        prisma.$disconnect()
        console.log('Conexão com DB encerrada.')
        process.exit(0)
    })
})