import { prisma } from './base.service';
import { TipoTeste, ResultadoTeste, Teste } from '@prisma/client';

export class TesteService {

    async registrarTeste(
        aeronaveCodigo: string,
        data: { tipo: TipoTeste; resultado: ResultadoTeste; funcionarioId: number, observacao?: string | null, data: Date }
    ): Promise<Teste> {

        return prisma.teste.create({
            data: {
                tipo: data.tipo,
                resultado: data.resultado,
                observacao: data.observacao,
                data: data.data,
                aeronave: {
                    connect: { codigo: aeronaveCodigo }
                },
                funcionario: {
                    connect: { id: data.funcionarioId }
                }
            }
        });
    }

    async listarTestes() {
        return prisma.teste.findMany({
            include: {
                aeronave: {
                    select: { codigo: true }
                },
                funcionario: {
                    select: { nome: true }
                }
            },
            orderBy: { id: 'desc' }
        });
    }
}
