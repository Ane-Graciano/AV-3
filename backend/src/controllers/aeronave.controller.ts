// src/controllers/AeronaveController.ts

import { Response } from 'express';
import { AeronaveService } from '../services/aeronave.service';
import { TipoAeronave } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const aeronaveService = new AeronaveService();

export class AeronaveController {

    // Rota que deve ser protegida por um middleware que exige ENGENHEIRO ou ADMINISTRADOR
    async criarAeronave(req: AuthRequest, res: Response) {
        try {
            const { codigo, modelo, tipo, capacidade, alcance } = req.body;

            if (!codigo || !modelo || !tipo || capacidade === undefined || alcance === undefined) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
            }

            const novaAeronave = await aeronaveService.criarAeronave({
                codigo,
                modelo,
                tipo: tipo as TipoAeronave,
                capacidade: Number(capacidade),
                alcance: Number(alcance)
            });

            return res.status(201).json(novaAeronave);

        } catch (error: any) {
            if (error.message.includes('código já está em uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao criar aeronave:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async editarAeronave(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const data = req.body; // Pega todos os dados do corpo (código, modelo, etc.)
            
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID da aeronave inválido.' });
            }

            // Garante que a capacidade e o alcance são números, se fornecidos
            if (data.capacidade !== undefined) data.capacidade = Number(data.capacidade);
            if (data.alcance !== undefined) data.alcance = Number(data.alcance);
            // O tipo (TipoAeronave) também pode ser validado aqui, mas o Prisma lida bem com a string de Enum.

            const aeronaveAtualizada = await aeronaveService.editarAeronave(id, data);
            
            return res.status(200).json(aeronaveAtualizada);

        } catch (error: any) {
            if (error.message.includes('código já está em uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao editar aeronave:', error);
            return res.status(500).json({ message: 'Falha interna do servidor ao editar aeronave.' });
        }
    }

    // Rota que deve ser protegida por um middleware de AUTENTICAÇÃO
    async obterDetalhes(req: AuthRequest, res: Response) {
        const { codigo } = req.params;
        try {
            const aeronave = await aeronaveService.buscarDetalhes(codigo);

            if (!aeronave) {
                return res.status(404).json({ message: 'Aeronave não encontrada.' });
            }

            return res.status(200).json(aeronave);
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async obterDetalhesPorId(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);

            // CORREÇÃO: Chama o método que retorna todos os detalhes (pecas, etapas, testes)
            const aeronave = await aeronaveService.buscarPorIdDetalhado(id);

            if (!aeronave) {
                return res.status(404).json({ message: "Aeronave não encontrada." });
            }

            return res.status(200).json(aeronave);
        } catch (error) {
            console.error("Erro ao buscar por ID:", error);
            return res.status(500).json({ message: "Erro interno." });
        }
    }

    // Rota que deve ser protegida por um middleware de AUTENTICAÇÃO
    async listarAeronaves(req: AuthRequest, res: Response) {
        try {
            const aeronaves = await aeronaveService.listarAeronaves();
            return res.status(200).json(aeronaves);
        } catch (error) {
            console.error('Erro ao listar aeronaves:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    // async obterDetalhesPorId(req: AuthRequest, res: Response) {
    //     try {
    //         const id = Number(req.params.id);

    //         const aeronave = await aeronaveService.buscarPorId(id);

    //         if (!aeronave) {
    //             return res.status(404).json({ message: "Aeronave não encontrada." });
    //         }

    //         return res.status(200).json(aeronave);
    //     } catch (error) {
    //         console.error("Erro ao buscar por ID:", error);
    //         return res.status(500).json({ message: "Erro interno." });
    //     }
    // }

}