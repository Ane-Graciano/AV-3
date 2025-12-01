import { PrismaClient, Funcionario, NivelPermissao } from '@prisma/client';
import * as bcrypt from 'bcrypt'; 
import { prisma } from './base.service'; 


type CreateFuncionarioData = Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>;

type UpdateFuncionarioData = Partial<Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>>;

type FuncionarioSemSenha = Omit<Funcionario, 'senha'>;

export class FuncionarioService {
    
    async cadastrarFuncionario(data: CreateFuncionarioData): Promise<FuncionarioSemSenha> {
        
        const hashedSenha = await bcrypt.hash(data.senha, 10);

        try {
            return await prisma.funcionario.create({
                data: {
                    ...data,
                    senha: hashedSenha,
                },
                select: {
                    id: true,
                    nome: true,
                    telefone: true,
                    endereco: true,
                    usuario: true,
                    nivelPermissao: true,
                }
            });
        } catch (error: any) {
            if (error.code === 'P2002') { 
                throw new Error('Nome de usuário já está em uso.');
            }
            throw error;
        }
    }

    async autenticar(usuario: string, senha: string): Promise<FuncionarioSemSenha | null> {
        const funcionario = await prisma.funcionario.findUnique({
            where: { usuario }
        })

        if (!funcionario) {
            return null
        }

        const senhaValida = await bcrypt.compare(senha, funcionario.senha)

        if (senhaValida) {
            const { senha: _, ...funcionarioSemSenha } = funcionario
            return funcionarioSemSenha
        }

        return null
    }

    async listarTodosFuncionarios(): Promise<FuncionarioSemSenha[]> {
        return prisma.funcionario.findMany({
            select: {
                id: true,
                nome: true,
                telefone: true,
                endereco: true,
                usuario: true,
                nivelPermissao: true,
            }
        });
    }

    async buscarFuncionarioPorId(id: number): Promise<FuncionarioSemSenha | null> {
        return prisma.funcionario.findUnique({ 
            where: { id },
            select: {
                id: true,
                nome: true,
                telefone: true,
                endereco: true,
                usuario: true,
                nivelPermissao: true,
            }
        });
    }

    async atualizarFuncionario(id: number, data: UpdateFuncionarioData): Promise<FuncionarioSemSenha> {
        
        if (data.senha) {
            data.senha = await bcrypt.hash(data.senha, 10);
        }

        try {
            return await prisma.funcionario.update({
                where: { id },
                data: data,
                select: {
                    id: true,
                    nome: true,
                    telefone: true,
                    endereco: true,
                    usuario: true,
                    nivelPermissao: true,
                }
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error('Funcionário não encontrado para atualização.');
            }
            if (error.code === 'P2002') { 
                throw new Error('Nome de usuário já está em uso.');
            }
            throw error;
        }
    }

    async deletarFuncionario(id: number): Promise<void> {
        try {
            await prisma.funcionario.delete({
                where: { id }
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error('Funcionário não encontrado para deleção.');
            }
            throw error;
        }
    }
}