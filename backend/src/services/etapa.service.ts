// src/services/EtapaService.ts

import { prisma } from './base.service';
import { Etapa, StatusEtapa } from '@prisma/client';

interface CadastrarEtapaData {
    nome: string;
    prazo: string;
    status: StatusEtapa;
    funcionariosIds: number[]
}

export interface AtualizarEtapaData {
    nome: string;
    prazo: string;
    status: StatusEtapa;
    funcionariosIds: number[];
}

export class EtapaService {

    async cadastrarEtapa(aeronaveId: number, data: CadastrarEtapaData): Promise<Etapa> {
        // 1. Validar se a Aeronave existe
        const aeronave = await prisma.aeronave.findUnique({
            where: { id: aeronaveId },
            select: { id: true }
        });

        if (!aeronave) {
            throw new Error('Aeronave não encontrada para associação.');
        }

        // Mapear os IDs de funcionários para o formato esperado pelo Prisma
        const funcionariosParaConectar = data.funcionariosIds.map(id => ({ id }));

        // 2. Criar a nova Etapa e vincular a Aeronave e os Funcionários
        const novaEtapa = await prisma.etapa.create({
            data: {
                nome: data.nome,
                prazo: data.prazo,
                status: data.status,
                aeronave: {
                    connect: { id: aeronave.id }
                },
                funcionarios: {
                    connect: funcionariosParaConectar
                }
            }
        });

        return novaEtapa;
    }

    async atualizarEtapa(etapaId: number, data: AtualizarEtapaData): Promise<Etapa> {
        const etapaExistente = await prisma.etapa.findUnique({
            where: { id: etapaId },
            select: { id: true }
        });

        if (!etapaExistente) {
            throw new Error('Etapa não encontrada para atualização.');
        }

        const funcionariosParaAtualizar = data.funcionariosIds.map(id => ({ id }));

        return prisma.etapa.update({
            where: { id: etapaId },
            data: {
                nome: data.nome,
                prazo: data.prazo,
                status: data.status,
                funcionarios: {
                    set: funcionariosParaAtualizar
                }
            },
            include: {
                funcionarios: { select: { nome: true } }
            }
        });
    }

    async listarEtapas() {
        return prisma.etapa.findMany({
            include: {
                aeronave: {
                    select: { codigo: true }
                },
                funcionarios: {
                    select: { nome: true }
                }
            },
            orderBy: { id: "desc" }
        });
    }


    async iniciarEtapa(etapaId: number): Promise<Etapa> {
        const etapa = await prisma.etapa.findUnique({
            where: { id: etapaId },
            include: { aeronave: { include: { etapas: true } } }
        })

        if (!etapa || !etapa.aeronave) {
            throw new Error("Etapa não encontrada ou não associada a uma aeronave.")
        }

        // Apenas se a anterior estiver CONCLUIDA
        const todasEtapas = etapa.aeronave.etapas.sort((a, b) => a.id - b.id)
        const indiceAtual = todasEtapas.findIndex(e => e.id === etapaId)

        if (indiceAtual > 0) {
            const etapaAnterior = todasEtapas[indiceAtual - 1]
            if (etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
                throw new Error(`Não é possível iniciar esta etapa. A etapa anterior '${etapaAnterior.nome}' não está concluída.`)
            }
        }

        if (etapa.status === StatusEtapa.ANDAMENTO) {
            throw new Error("Etapa já está em andamento.")
        }

        return prisma.etapa.update({
            where: { id: etapaId },
            data: { status: StatusEtapa.ANDAMENTO }
        });
    }

    async finalizarEtapa(etapaId: number): Promise<Etapa> {
        const etapa = await prisma.etapa.findUnique({ where: { id: etapaId } })

        if (!etapa) {
            throw new Error("Etapa não encontrada.")
        }

        if (etapa.status === StatusEtapa.PENDENTE) {
            throw new Error("Etapa deve ser iniciada antes de ser concluída.")
        }
        if (etapa.status === StatusEtapa.CONCLUIDA) {
            throw new Error("Etapa já está concluída.")
        }

        return prisma.etapa.update({
            where: { id: etapaId },
            data: { status: StatusEtapa.CONCLUIDA }
        })
    }

    async associarFuncionario(etapaId: number, funcionarioId: number): Promise<Etapa> {

        const etapaExistente = await prisma.etapa.findUnique({
            where: { id: etapaId },
            select: { id: true }
        });
        if (!etapaExistente) {
            throw new Error('Etapa não encontrada. Associação cancelada.');
        }

        const funcionario = await prisma.funcionario.findUnique({
            where: { id: funcionarioId },
            select: { id: true, nome: true }
        });

        if (!funcionario) {
            throw new Error('Funcionário não encontrado. Associação cancelada.');
        }

        try {
            return prisma.etapa.update({
                where: { id: etapaId },
                data: {
                    funcionarios: {
                        connect: { id: funcionarioId }
                    }
                },
                include: { funcionarios: true }
            });
        } catch (error) {
            throw new Error('Erro de persistência no banco de dados durante a associação.');
        }
    }

    async buscarEtapaPorId(etapaId: number) {
        const etapa = await prisma.etapa.findUnique({
            where: { id: etapaId },
            include: {
                aeronave: { select: { codigo: true } },
                funcionarios: { select: { nome: true } }
            }
        });

        if (!etapa) {
            throw new Error('Etapa não encontrada.');
        }

        return {
            id: etapa.id,
            aeronave: etapa.aeronave.codigo,
            nome: etapa.nome,
            prazo: etapa.prazo,
            statusEtapa: etapa.status,
            funcionarios: etapa.funcionarios.map(f => ({ nome: f.nome })) 
        };
    }
}