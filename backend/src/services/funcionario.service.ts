// src/services/FuncionarioService.ts

import { PrismaClient, Funcionario, NivelPermissao } from '@prisma/client';
import * as bcrypt from 'bcrypt'; 
// Assumindo que o prisma foi inicializado e exportado aqui
import { prisma } from './base.service'; 


// Define o tipo de dados para criação (sem o ID)
type CreateFuncionarioData = Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>;

// Define o tipo de dados para atualização (todos opcionais)
type UpdateFuncionarioData = Partial<Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>>;

// Define o tipo de retorno, omitindo a senha
type FuncionarioSemSenha = Omit<Funcionario, 'senha'>;

export class FuncionarioService {
    
    // POST /api/funcionarios
    async cadastrarFuncionario(data: CreateFuncionarioData): Promise<FuncionarioSemSenha> {
        // 1. Garante que a senha seja hashed antes de salvar
        const hashedSenha = await bcrypt.hash(data.senha, 10);

        try {
            return await prisma.funcionario.create({
                data: {
                    ...data,
                    senha: hashedSenha,
                },
                // Retorna o objeto sem a senha
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
            // Lança um erro customizado para o Controller tratar
            if (error.code === 'P2002') { 
                throw new Error('Nome de usuário já está em uso.');
            }
            throw error;
        }
    }

    // POST /api/funcionarios/login
    async autenticar(usuario: string, senha: string): Promise<FuncionarioSemSenha | null> {
        const funcionario = await prisma.funcionario.findUnique({
            where: { usuario }
        })

        if (!funcionario) {
            return null
        }

        const senhaValida = await bcrypt.compare(senha, funcionario.senha)

        if (senhaValida) {
            // Retorna o objeto sem o campo 'senha'
            const { senha: _, ...funcionarioSemSenha } = funcionario
            return funcionarioSemSenha
        }

        return null
    }
    
    // --- NOVOS MÉTODOS DE CRUD ---

    // GET /api/funcionarios
    async listarTodosFuncionarios(): Promise<FuncionarioSemSenha[]> {
        return prisma.funcionario.findMany({
            // Exclui a senha de todos os resultados
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

    // GET /api/funcionarios/:id
    async buscarFuncionarioPorId(id: number): Promise<FuncionarioSemSenha | null> {
        return prisma.funcionario.findUnique({ 
            where: { id },
            // Exclui a senha do resultado
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

    // PUT /api/funcionarios/:id
    async atualizarFuncionario(id: number, data: UpdateFuncionarioData): Promise<FuncionarioSemSenha> {
        
        if (data.senha) {
            // 1. Se a senha for enviada, gera o novo hash
            data.senha = await bcrypt.hash(data.senha, 10);
        }

        try {
            return await prisma.funcionario.update({
                where: { id },
                data: data,
                // Retorna o objeto atualizado sem a senha
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
                 // Erro de registro não encontrado
                throw new Error('Funcionário não encontrado para atualização.');
            }
            if (error.code === 'P2002') { 
                throw new Error('Nome de usuário já está em uso.');
            }
            throw error;
        }
    }

    // DELETE /api/funcionarios/:id
    async deletarFuncionario(id: number): Promise<void> {
        try {
            await prisma.funcionario.delete({
                where: { id }
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                // Erro de registro não encontrado
                throw new Error('Funcionário não encontrado para deleção.');
            }
            throw error;
        }
    }
}