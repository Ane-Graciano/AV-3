// src/services/AeronaveService.ts

import { prisma } from './base.service';
import { Prisma, TipoAeronave, Aeronave } from '@prisma/client';

const aeronaveComDetalhes = Prisma.validator<Prisma.AeronaveDefaultArgs>()({
    include: {
        pecas: true,
        etapas: {
            orderBy: { nome: 'asc' },
            include: { funcionarios: true }
        },
        testes: {
            include: {
                funcionario: {
                    select: { nome: true }
                }
            }
        },
        relatorio: true
    }
})

type AeronaveUpdateData = Partial<{
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
}>;

export interface RelatorioPayload {
    aeronave: Aeronave; // O objeto aeronave completo
    dataGeracao: string;
    statusFinal: string;
    pecas: Array<{ id: number; nome: string; tipo: string; status: string }>;
    etapas: Array<{ id: number; nome: string; prazo: string; status: string; funcionarios: any }>; // 'funcionarios' é do tipo 'any' aqui, dependendo da sua definição
    testes: any[];
    // Se o cliente for obrigatório, adicione-o no payload do front-end e aqui:
    cliente?: string; 
}


export type AeronaveDetalhada = Prisma.AeronaveGetPayload<typeof aeronaveComDetalhes>;

export class AeronaveService {
    async criarAeronave(data: { codigo: string; modelo: string; tipo: TipoAeronave; capacidade: number; alcance: number }): Promise<Aeronave> {
        // O Prisma lida com a restrição de 'codigo' único automaticamente
        try {
            const novaAeronave = await prisma.aeronave.create({
                data: {
                    ...data,
                }
            });
            return novaAeronave;
        } catch (error) {
            throw new Error("Erro ao criar aeronave. Verifique se o código já existe.");
        }
    }

    async editarAeronave(id: number, data: AeronaveUpdateData): Promise<Aeronave> {
        try {
            const aeronaveAtualizada = await prisma.aeronave.update({
                where: { id },
                data,
            });
            return aeronaveAtualizada;
        } catch (error) {
            if ((error as any).code === 'P2002' && (error as any).meta?.target.includes('codigo')) {
                throw new Error("Erro ao editar aeronave. O código informado já está em uso.");
            }
            throw new Error("Erro interno ao atualizar aeronave.");
        }
    }

    async buscarDetalhes(codigo: string): Promise<AeronaveDetalhada | null> {
        return prisma.aeronave.findUnique({
            where: { codigo },
            ...aeronaveComDetalhes
        });
    }

    async buscarPorIdDetalhado(id: number): Promise<AeronaveDetalhada | null> {
        return prisma.aeronave.findUnique({
            where: { id },
            // Usa o include que já lista pecas, etapas, testes
            ...aeronaveComDetalhes
        });
    }

    // Lista todas as aeronaves cadastradas
    async listarAeronaves(): Promise<Aeronave[]> {
        return prisma.aeronave.findMany();
    }

    async buscarPorId(id: number): Promise<Aeronave | null> {
        return prisma.aeronave.findUnique({
            where: { id }, // Busca pelo campo 'id'
        });
    }

    
}