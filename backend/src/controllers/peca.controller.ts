// src/controllers/PecaController.ts

import { Response } from 'express';
import { PecaService } from '../services/peca.service';
import { TipoPeca, StatusPeca } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const pecaService = new PecaService();

export class PecaController {
    //exige OPERADOR
    async cadastrarPeca(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const aeronaveId = Number(id);

        const { codigo, nome, tipo, fornecedor, status } = req.body;

        try {
            if (!nome || !tipo || !fornecedor) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
            }

            if (!Object.values(TipoPeca).includes(tipo) || !Object.values(StatusPeca).includes(status)) {
                return res.status(400).json({ message: 'Tipo ou Status inválido.' });
            }

            const novaPeca = await pecaService.cadastrarPeca(aeronaveId, {
                nome,
                tipo: tipo as TipoPeca,
                fornecedor,
                status: status as StatusPeca
            });

            return res.status(201).json(novaPeca);
        } catch (error: any) {
            // O Service pode lançar erro se a Aeronave não existir
            if (error.message.includes('Não existe um registro')) {
                return res.status(404).json({ message: 'Aeronave não encontrada para associação.' });
            }
            console.error('Erro ao cadastrar peça:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async editarPeca(req: AuthRequest, res: Response) {
        const pecaId = Number(req.params.id);
        const { nome, tipo, fornecedor } = req.body; // Status é atualizado em rota separada

        try {
            if (!nome || !tipo || !fornecedor) {
                return res.status(400).json({ message: 'Campos obrigatórios (nome, tipo, fornecedor) faltando.' });
            }

            // Verificação do Enum (StatusPeca não é checado aqui, pois é atualizado em rota separada)
            if (!Object.values(TipoPeca).includes(tipo)) {
                return res.status(400).json({ message: 'Tipo de peça inválido.' });
            }

            const pecaAtualizada = await pecaService.editarPeca(pecaId, {
                nome,
                tipo: tipo as TipoPeca,
                fornecedor,
            });

            return res.status(200).json(pecaAtualizada);

        } catch (error: any) {
            // Prisma lança erro se o where.id não encontrar registro
            if (error.message.includes('Record to update not found') || error.message.includes('não existe')) {
                return res.status(404).json({ message: 'Peça não encontrada.' });
            }
            console.error('Erro ao editar peça:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async buscarPecaPorId(req: AuthRequest, res: Response) {
        const pecaId = Number(req.params.id);

        try {
            const peca = await pecaService.buscarPeca(pecaId);

            if (!peca) {
                return res.status(404).json({ message: 'Peça não encontrada.' });
            }
            
            // Mapeia para o formato esperado pelo Front-end (CadPeca.tsx)
            // É essencial incluir o aeronaveId para que o select do formulário de edição seja preenchido.
            const resposta = {
                id: peca.id,
                nome: peca.nome,
                tipo: peca.tipo,
                fornecedor: peca.fornecedor,
                status: peca.status,
                // O Service precisa retornar 'aeronaveId' para que isso funcione.
                aeronaveId: peca.aeronaveId, 
            };

            return res.status(200).json(resposta);
        } catch (error) {
            console.error("Erro ao buscar peça por ID:", error);
            return res.status(500).json({ message: "Erro interno ao buscar peça." });
        }
    }

    // Rota que deve ser protegida por um middleware que exige OPERADOR
    async atualizarStatusPeca(req: AuthRequest, res: Response) {
        const pecaId = Number(req.params.id);
        const { novoStatus } = req.body;

        try {
            if (!novoStatus || !Object.values(StatusPeca).includes(novoStatus)) {
                return res.status(400).json({ message: 'Novo status inválido.' });
            }

            const pecaAtualizada = await pecaService.atualizarStatus(pecaId, novoStatus as StatusPeca);

            return res.status(200).json(pecaAtualizada);
        } catch (error: any) {
            if (error.message.includes('não existe')) {
                return res.status(404).json({ message: 'Peça não encontrada.' });
            }
            console.error('Erro ao atualizar status da peça:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async listarPecas(req: AuthRequest, res: Response) {
        try {
            const pecas = await pecaService.listarPecas();

            const resposta = pecas.map(p => ({
                id: p.id,
                aeronave: p.aeronave.codigo,
                nome: p.nome,
                tipo: p.tipo,
                fornecedor: p.fornecedor,
                status: p.status
            }));

            return res.status(200).json(resposta);
        } catch (error) {
            console.error("Erro ao listar peças:", error);
            return res.status(500).json({ message: "Erro interno ao buscar peças" });
        }
    }

}