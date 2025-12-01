import { Response } from 'express';
import { FuncionarioService } from '../services/funcionario.service';
import { NivelPermissao } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth.middleware'; 

const funcionarioService = new FuncionarioService();
const JWT_SECRET = process.env.JWT_SECRET || 'av3';

export class FuncionarioController {
    // 1. POST /api/funcionarios/login (Rota Aberta)
    async login(req: AuthRequest, res: Response) {
        const { usuario, senha } = req.body;

        try {
            const funcionario = await funcionarioService.autenticar(usuario, senha);

            if (!funcionario) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            const token = jwt.sign(
                { id: funcionario.id, nivel: funcionario.nivelPermissao },
                JWT_SECRET,
                { expiresIn: '2h' } 
            );

            return res.status(200).json({ 
                token, 
                nivelPermissao: funcionario.nivelPermissao,
                funcionario: { 
                    id: funcionario.id, 
                    nome: funcionario.nome, 
                    usuario: funcionario.usuario, 
                } 
            });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ message: 'Falha interna ao tentar fazer login.' });
        }
    }

    // 2. POST /api/funcionarios (Cadastro - Protegida por ADMIN)
    async cadastrar(req: AuthRequest, res: Response) {
        try {
            const { nome, telefone, endereco, usuario, senha, nivelPermissao } = req.body;

            if (!nome || !usuario || !senha || !nivelPermissao || !telefone || !endereco) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
            }

            if (!Object.values(NivelPermissao).includes(nivelPermissao)) {
                return res.status(400).json({ message: 'Nível de permissão inválido.' });
            }

            const novoFuncionario = await funcionarioService.cadastrarFuncionario({
                nome, telefone, endereco, usuario, senha, 
                nivelPermissao: nivelPermissao as NivelPermissao
            });

            return res.status(201).json(novoFuncionario);
        } catch (error: any) {
            if (error.message.includes('código já está em uso') || error.message.includes('unique constraint')) {
                return res.status(409).json({ message: 'Nome de usuário já existe.' });
            }
            console.error('Erro ao cadastrar funcionário:', error);
            return res.status(500).json({ message: 'Falha interna ao cadastrar funcionário.' });
        }
    }


    // 3. GET /api/funcionarios (Listar Todos - Protegida por ADMIN)
    async listarTodos(req: AuthRequest, res: Response) {
        try {
            const funcionarios = await funcionarioService.listarTodosFuncionarios();
            
            return res.status(200).json(funcionarios);
        } catch (error) {
            console.error('Erro ao listar funcionários:', error);
            return res.status(500).json({ message: 'Falha interna ao listar funcionários.' });
        }
    }

    // 4. GET /api/funcionarios/:id (Buscar por ID - Protegida)
    async buscarPorId(req: AuthRequest, res: Response) {
        const { id } = req.params;
        
        // Validação de entrada
        if (isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de funcionário inválido.' });
        }

        try {
            const funcionario = await funcionarioService.buscarFuncionarioPorId(Number(id));

            if (!funcionario) {
                return res.status(404).json({ message: 'Funcionário não encontrado.' });
            }

            return res.status(200).json(funcionario);
        } catch (error) {
            console.error(`Erro ao buscar funcionário ${id}:`, error);
            return res.status(500).json({ message: 'Falha interna ao buscar funcionário.' });
        }
    }

    // 5. PUT /api/funcionarios/:id (Atualizar - Protegida por ADMIN)
    async atualizar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const dadosAtualizacao = req.body;
        
        if (isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de funcionário inválido.' });
        }

        try {
            const funcionarioAtualizado = await funcionarioService.atualizarFuncionario(Number(id), dadosAtualizacao);

            return res.status(200).json(funcionarioAtualizado);
        } catch (error: any) {
            if (error.message.includes('Funcionário não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
             if (error.message.includes('código já está em uso') || error.message.includes('unique constraint')) {
                return res.status(409).json({ message: 'Nome de usuário já existe.' });
            }
            console.error(`Erro ao atualizar funcionário ${id}:`, error);
            return res.status(500).json({ message: 'Falha interna ao atualizar funcionário.' });
        }
    }

    // 6. DELETE /api/funcionarios/:id (Deletar - Protegida por ADMIN)
    async deletar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        
        if (isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de funcionário inválido.' });
        }

        try {
            await funcionarioService.deletarFuncionario(Number(id));
            
            return res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('Funcionário não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error(`Erro ao deletar funcionário ${id}:`, error);
            return res.status(500).json({ message: 'Falha interna ao deletar funcionário.' });
        }
    }
}