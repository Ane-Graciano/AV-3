import { prisma } from './base.service';
import { TipoPeca, StatusPeca, Peca } from '@prisma/client';

export class PecaService {
    async cadastrarPeca(aeronaveId: number, data: { nome: string; tipo: TipoPeca; fornecedor: string; status: StatusPeca }): Promise<Peca> {
        console.log('1. Tentando encontrar aeronave com código:', aeronaveId);

        const aeronave = await prisma.aeronave.findUnique({
            where: { id: aeronaveId },
            select: { id: true } 
        });

        if (!aeronave) {
            throw new Error('Não existe um registro de Aeronave com esse código.');
        }

        const novaPeca = await prisma.peca.create({
            data: {
                nome: data.nome,
                tipo: data.tipo,
                fornecedor: data.fornecedor,
                status: data.status,
                aeronave: {
                    connect: { id: aeronave.id } 
                }
            }
        });

        return novaPeca;
    }

    async editarPeca(
        pecaId: number,
        data: { nome: string; tipo: TipoPeca; fornecedor: string; }
    ): Promise<Peca> {
        return prisma.peca.update({
            where: { id: pecaId },
            data: {
                nome: data.nome,
                tipo: data.tipo,
                fornecedor: data.fornecedor,
            }
        });
    }

    
    async atualizarStatus(pecaId: number, novoStatus: StatusPeca): Promise<Peca> {
        return prisma.peca.update({
            where: { id: pecaId },
            data: { status: novoStatus }
        });
    }

    async listarPecas() {
        return prisma.peca.findMany({
            include: {
                aeronave: {
                    select: { codigo: true }
                }
            },
            orderBy: { id: "desc" }
        });
    }

    async buscarPeca(pecaId: number): Promise<any | null> {
        return prisma.peca.findUnique({
            where: { id: pecaId },
            select: {
                id: true,
                nome: true,
                tipo: true,
                fornecedor: true,
                status: true,
                aeronaveId: true, 
            }
        });
    }
}