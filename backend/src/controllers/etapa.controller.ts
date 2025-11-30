// src/controllers/EtapaController.ts

import { Response } from 'express';
import { EtapaService } from '../services/etapa.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const etapaService = new EtapaService();

export class EtapaController {
    async cadastrarEtapa(req: AuthRequest, res: Response) {
        const aeronaveId = Number(req.params.id);
        const { nome, prazo, statusEtapa,funcionariosIds } = req.body;

        try {
            if (!nome || !prazo || !statusEtapa) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
            }

            const novaEtapa = await etapaService.cadastrarEtapa(aeronaveId, {
                nome,
                prazo: prazo,
                status: statusEtapa.toUpperCase(),
                funcionariosIds
            });

            return res.status(201).json(novaEtapa);

        } catch (error: any) {
            if (error.message.includes('Aeronave não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao cadastrar etapa:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async atualizarEtapa(req: AuthRequest, res: Response) {
        const etapaId = Number(req.params.id);
        // ✅ DESESTRUTURANDO todos os campos, incluindo funcionariosIds
        const { nome, prazo, statusEtapa, funcionariosIds } = req.body; 

        try {
            if (!nome || !prazo || !statusEtapa) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
            }

            const etapaAtualizada = await etapaService.atualizarEtapa(etapaId, {
                nome,
                prazo,
                status: statusEtapa.toUpperCase(),
                funcionariosIds, // ✅ PASSANDO PARA O SERVICE
            });

            return res.status(200).json(etapaAtualizada);
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return res.status(404).json({ message: 'Etapa não encontrada.' });
            }
            console.error('Erro ao atualizar etapa:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async listarEtapas(req: AuthRequest, res: Response) {
        try {
            const etapas = await etapaService.listarEtapas();

            console.log('Dados brutos da API:', JSON.stringify(etapas, null, 2))

            const resposta = etapas.map(e => ({
                id: e.id,
                aeronave: e.aeronave.codigo,
                nome: e.nome,
                prazo: e.prazo,
                statusEtapa: e.status,
                funcionarios: e.funcionarios.map(f => f.nome)
            }));

            return res.status(200).json(resposta);
        } catch (error) {
            console.error("Erro ao listar etapas:", error);
            return res.status(500).json({ message: "Erro interno ao buscar etapas" });
        }
    }

    async buscarEtapaPorId(req: AuthRequest, res: Response) {
        const etapaId = Number(req.params.id);

        try {
            if (isNaN(etapaId) || etapaId <= 0) {
                return res.status(400).json({ message: 'ID da etapa inválido.' });
            }

            const etapa = await etapaService.buscarEtapaPorId(etapaId);
            
            return res.status(200).json(etapa);

        } catch (error: any) {
            if (error.message.includes('Etapa não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao buscar etapa por ID:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }


    // exige OPERADOR
    async iniciarEtapa(req: AuthRequest, res: Response) {
        const etapaId = Number(req.params.id);

        try {
            const etapaIniciada = await etapaService.iniciarEtapa(etapaId);
            return res.status(200).json({ message: `Etapa ${etapaIniciada.nome} iniciada com sucesso.`, etapa: etapaIniciada });
        } catch (error: any) {
            // Regra de negócio do Service (etapa anterior pendente)
            if (error.message.includes('Não é possível iniciar esta etapa') || error.message.includes('já está em andamento')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes('não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao iniciar etapa:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    // exige OPERADOR
    async finalizarEtapa(req: AuthRequest, res: Response) {
        const etapaId = Number(req.params.id);

        try {
            const etapaConcluida = await etapaService.finalizarEtapa(etapaId);
            return res.status(200).json({ message: `Etapa ${etapaConcluida.nome} concluída com sucesso.`, etapa: etapaConcluida });
        } catch (error: any) {
            // Erros de status inválido
            if (error.message.includes('deve ser iniciada antes') || error.message.includes('já está concluída')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao finalizar etapa:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }


    async associarFuncionario(req: AuthRequest, res: Response) {
        const etapaId = Number(req.params.id);
        const funcionarioId = Number(req.body.funcionarioId);

        try {
            if (isNaN(funcionarioId) || funcionarioId <= 0) { 
                return res.status(400).json({ message: 'ID de funcionário inválido.' });
            }

            console.log(`Tentativa de associar Etapa ID: ${etapaId} com Funcionário ID: ${funcionarioId}`);

            const etapaAtualizada = await etapaService.associarFuncionario(etapaId, funcionarioId);
            return res.status(200).json({ message: 'Funcionário associado com sucesso.', etapa: etapaAtualizada });
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return res.status(404).json({ message: 'Etapa ou Funcionário não encontrados.' });
            }
            console.error('Erro ao associar funcionário:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

}