import { prisma } from './base.service';
import { TipoPeca, StatusPeca, Peca } from '@prisma/client';

export class PecaService {
    async cadastrarPeca(aeronaveId: number, data: { nome: string; tipo: TipoPeca; fornecedor: string; status: StatusPeca }): Promise<Peca> {
        console.log('1. Tentando encontrar aeronave com código:', aeronaveId);

        // 1. Busque a Aeronave usando o código
        const aeronave = await prisma.aeronave.findUnique({
            where: { id: aeronaveId },
            select: { id: true } // Pegamos apenas o ID interno (melhor para a conexão)
        });

        // 2. Se a Aeronave não for encontrada, lance o erro que o Controller espera (404)
        if (!aeronave) {
            // Lançar um erro com a mensagem esperada pelo seu Controller
            throw new Error('Não existe um registro de Aeronave com esse código.');
        }

        // 3. Crie a Peça, conectando-a via ID (que é mais robusto)
        const novaPeca = await prisma.peca.create({
            data: {
                nome: data.nome,
                tipo: data.tipo,
                fornecedor: data.fornecedor,
                status: data.status,
                aeronave: {
                    connect: { id: aeronave.id } // Conecta usando o ID interno da Aeronave
                }
            }
        });

        return novaPeca;
    }

    async editarPeca(
        pecaId: number,
        data: { nome: string; tipo: TipoPeca; fornecedor: string; }
    ): Promise<Peca> {
        // O `update` lança um erro se o where não encontrar o registro
        return prisma.peca.update({
            where: { id: pecaId },
            data: {
                nome: data.nome,
                tipo: data.tipo,
                fornecedor: data.fornecedor,
            }
        });
    }

    

    // Requisito: Método de atualização de status para acompanhar a evolução
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
            // ✅ Inclui 'aeronaveId' para que o Controller possa retorná-lo
            // para o Front-end e preencher o campo de aeronave na edição.
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