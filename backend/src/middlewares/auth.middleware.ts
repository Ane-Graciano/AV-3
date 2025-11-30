import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { NivelPermissao } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'av3'

// Tipagem corrigida para incluir a permissão do usuário
export interface AuthRequest extends Request {
    funcionarioId?: number
    nivelPermissao?: NivelPermissao
}

// 1. Middleware de Autenticação (Mantido, funciona corretamente)
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number, nivel: NivelPermissao, iat: number, exp: number };

        req.funcionarioId = decoded.id
        req.nivelPermissao = decoded.nivel

        next()
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
}

// 2. Middleware de Autorização CORRIGIDO
// Tipo do parâmetro 'requiredLevel' agora aceita NivelPermissao OU NivelPermissao[]
export function authorize(requiredLevel: NivelPermissao | NivelPermissao[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userLevel = req.nivelPermissao;

        if (!userLevel) {
            return res.status(401).json({ message: 'Falha na autenticação. Nível de permissão não encontrado.' });
        }

        // Garante que requiredLevels é um array para simplificar a lógica de verificação
        const requiredLevelsArray = Array.isArray(requiredLevel) ? requiredLevel : [requiredLevel];

        let isAuthorized = false;

        // Itera sobre todos os níveis de permissão requeridos
        for (const reqLevel of requiredLevelsArray) {
            
            // Lógica de Hierarquia: ADMIN > ENGENHEIRO > OPERADOR
            if (userLevel === NivelPermissao.ADMINISTRADOR) {
                isAuthorized = true;
                break; // ADMIN pode tudo
            } 
            
            // Se o usuário for ENGENHEIRO, ele pode ENGENHEIRO e OPERADOR
            else if (userLevel === NivelPermissao.ENGENHEIRO && (reqLevel === NivelPermissao.ENGENHEIRO || reqLevel === NivelPermissao.OPERADOR)) {
                isAuthorized = true;
                break;
            } 
            
            // Se o usuário for OPERADOR, ele só pode OPERADOR
            else if (userLevel === NivelPermissao.OPERADOR && reqLevel === NivelPermissao.OPERADOR) {
                isAuthorized = true;
                break;
            }
        }
        
        if (isAuthorized) {
            next();
        } else {
            return res.status(403).json({ message: 'Acesso proibido. Nível de permissão insuficiente.' });
        }
    };
}