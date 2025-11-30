import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware'; 
import { NivelAcessoService } from '../services/nivelAcesso.service';

const nivelAcessoService = new NivelAcessoService();

export class NivelAcessoController {
    
    async listar(req: AuthRequest, res: Response) {
        try {
            // Delega a formatação da lista ao Service
            const niveis = nivelAcessoService.listarNiveis();
            
            return res.status(200).json(niveis);
        } catch (error) {
            console.error('Erro ao buscar níveis de acesso:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar níveis de acesso.' });
        }
    }
}