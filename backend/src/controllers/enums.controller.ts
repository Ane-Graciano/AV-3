import { Response, Request } from 'express';
import { EnumService } from '../services/enums.service';

const enumService = new EnumService();

export class EnumController {
    
    // Rota: GET /tipoAeronave
    async listarTiposAeronave(req: Request, res: Response) {
        try {
            const tipos = await enumService.listarTiposAeronave();
            return res.status(200).json(tipos);
        } catch (error) {
            console.error('Erro ao buscar tipos de aeronave:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar tipos de aeronave.' });
        }
    }

    // Rota: GET /statusEtapa
    async listarStatusEtapa(req: Request, res: Response) {
        try {
            const status = await enumService.listarStatusEtapa();
            return res.status(200).json(status);
        } catch (error) {
            console.error('Erro ao buscar status de etapas:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar status de etapas.' });
        }
    }

    // Rota: GET /statusPeca
    async listarStatusPeca(req: Request, res: Response) {
        try {
            const status = await enumService.listarStatusPeca();
            return res.status(200).json(status);
        } catch (error) {
            console.error('Erro ao buscar status de peças:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar status de peças.' });
        }
    }

    async listarTiposPeca(req: Request, res: Response) {
        try {
            const status = await enumService.listarTiposPeca();
            return res.status(200).json(status);
        } catch (error) {
            console.error('Erro ao buscar tipo de peças:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar tipo de peças.' });
        }
    }

    async listarTiposTeste(req: Request, res: Response) {
        try {
            const status = await enumService.listarTiposTeste();
            return res.status(200).json(status);
        } catch (error) {
            console.error('Erro ao buscar tipo de testes:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar tipo de testes.' });
        }
    }

    async listarTiposResultTeste(req: Request, res: Response) {
        try {
            const status = await enumService.listarTiposResultTeste();
            return res.status(200).json(status);
        } catch (error) {
            console.error('Erro ao buscar tipo de resultado de testes:', error);
            return res.status(500).json({ message: 'Falha interna ao buscar tipo de resultado de testes.' });
        }
    }

    // Opcional: Se desejar unificar o NivelAcesso também
    // async listarNiveisAcesso(req: Request, res: Response) { /* ... */ }
}