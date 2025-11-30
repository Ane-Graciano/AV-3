// src/controllers/RelatorioController.ts

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

            // Tratamento de erros de lógica de negócio (Status 403)
            if (error.message.includes("peças que não estão com o status 'PRONTA'") ||
                error.message.includes('etapas de produção pendentes')) {
                return res.status(403).json({ message: error.message });
            }

            // Captura de erro para violação de constraint (Status 409)
            if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2014')) {
                return res.status(409).json({ message: 'Relatório final já foi gerado para esta aeronave.' });
            }

            // Tratamento de recurso não encontrado (Status 404)
            if (error.message.includes('Aeronave não encontrada')) {
                return res.status(404).json({ message: error.message });
            }

            // Erros internos inesperados (Status 500)
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
            // Verifica se o arquivo existe
            await fs.access(filePath); 
            
            // Envia o arquivo para download
            res.download(filePath, nomeArquivo, (err) => {
                if (err) {
                    console.error('Erro ao enviar arquivo:', err);
                    // Erro no processo de envio do Express (pode ser permissão, etc.)
                    return res.status(500).json({ message: 'Falha ao enviar o arquivo para download.' });
                }
            });

        } catch (error: any) {
            // Captura erro se o arquivo não existir (ENOENT)
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'Arquivo de relatório não encontrado no servidor.' });
            }
            console.error('Erro ao baixar relatório:', error);
            return res.status(500).json({ message: 'Falha interna ao processar o download.' });
        }
    }
}