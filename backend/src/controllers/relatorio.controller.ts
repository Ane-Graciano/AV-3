import { type Response } from 'express';
import { RelatorioService } from '../services/relatorio.service';
import { type AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '@prisma/client';
import * as fs from 'fs/promises'; 
import * as path from 'path'; 

const relatorioService = new RelatorioService();

export class RelatorioController {
    
    // 1. GERAÇÃO DE RELATÓRIO (POST /aeronaves/:id/relatorio)
    async gerarRelatorio(req: AuthRequest, res: Response) {
        const aeronaveId = Number(req.params.id);

        try {
            if (isNaN(aeronaveId)) {
                return res.status(400).json({ message: 'ID da aeronave inválido.' });
            }

            const relatorio = await relatorioService.gerarRelatorio(aeronaveId);

            return res.status(201).json({
                message: 'Relatório gerado e registrado com sucesso. Arquivo salvo no servidor.',
                relatorio
            });

        } catch (error: any) {

            if (error.message.includes("peças que não estão com o status 'PRONTA'") ||
                error.message.includes('etapas de produção pendentes')) {
                return res.status(403).json({ message: error.message });
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2014')) {
                return res.status(409).json({ message: 'Relatório final já foi gerado para esta aeronave.' });
            }

            if (error.message.includes('Aeronave não encontrada')) {
                return res.status(404).json({ message: error.message });
            }

            console.error('Erro ao gerar relatório:', error);
            return res.status(500).json({ message: 'Falha interna ao gerar relatório.' });
        }
    }

    // 2. LISTAGEM DE RELATÓRIOS (GET /aeronaves/:id/relatorios)
    // async listarRelatoriosPorAeronave(req: AuthRequest, res: Response) {
    //     const aeronaveId = Number(req.params.id);

    //     if (isNaN(aeronaveId)) {
    //         return res.status(400).json({ message: 'ID da aeronave inválido.' });
    //     }

    //     try {
    //         const relatorios = await relatorioService.listarPorAeronave(aeronaveId);
    //         return res.status(200).json(relatorios);
    //     } catch (error) {
    //         console.error('Erro ao listar relatórios:', error);
    //         return res.status(500).json({ message: 'Falha interna ao listar relatórios.' });
    //     }
    // }

    async listarTodosRelatorios(req: AuthRequest, res: Response) {
        try {
            const relatorios = await relatorioService.listarTodosRelatorios();
            return res.status(200).json(relatorios);
        } catch (error) {
            console.error('Erro ao listar todos os relatórios:', error);
            return res.status(500).json({ message: 'Falha interna ao listar todos os relatórios.' });
        }
    }

    // 3. DOWNLOAD DE RELATÓRIO (GET /aeronaves/relatorio/download/:nomeArquivo)
    async downloadRelatorio(req: AuthRequest, res: Response) {
        const { nomeArquivo } = req.params;

        if (!nomeArquivo) {
            return res.status(400).json({ message: 'Nome do arquivo não fornecido.' });
        }
        
        const relatoriosDir = path.join(process.cwd(), 'relatorios');
        const filePath = path.join(relatoriosDir, nomeArquivo);

        try {
            await fs.access(filePath); 
            
            res.download(filePath, nomeArquivo, (err) => {
                if (err) {
                    console.error('Erro ao enviar arquivo:', err);
                    return res.status(500).json({ message: 'Falha ao enviar o arquivo para download.' });
                }
            });

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'Arquivo de relatório não encontrado no servidor.' });
            }
            console.error('Erro ao baixar relatório:', error);
            return res.status(500).json({ message: 'Falha interna ao processar o download.' });
        }
    }
}