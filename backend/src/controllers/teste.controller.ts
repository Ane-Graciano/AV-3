
import { Response } from 'express';
import { TesteService } from '../services/teste.service';
import { TipoTeste, ResultadoTeste } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const testeService = new TesteService();

export class TesteController {

    async registrarTeste(req: AuthRequest, res: Response) {
        const { codigo: aeronaveCodigo } = req.params;
        const { tipo, resultado, observacao, data, funcionarioId } = req.body;

        try {
            if (!tipo || !resultado || !data) {
                return res.status(400).json({ message: 'Campos Tipo, Data e Resultado são obrigatórios.' });
            }

            if (!Object.values(TipoTeste).includes(tipo)) {
                return res.status(400).json({ message: 'Tipo de teste inválido.' });
            }

            if (!Object.values(ResultadoTeste).includes(resultado)) {
                return res.status(400).json({ message: 'Resultado de teste inválido.' });
            }

            const novoTeste = await testeService.registrarTeste(aeronaveCodigo, {
                tipo: tipo as TipoTeste,
                resultado: resultado as ResultadoTeste,
                funcionarioId,
                observacao: observacao ?? null,
                data: new Date(data)
            });

            return res.status(201).json(novoTeste);

        } catch (error: any) {
            if (error.message.includes('não existe')) {
                return res.status(404).json({ message: 'Aeronave não encontrada para registrar o teste.' });
            }

            console.error('Erro ao registrar teste:', error);
            return res.status(500).json({ message: 'Falha interna do servidor.' });
        }
    }

    async listarTestes(req: AuthRequest, res: Response) {
        try {
            const testes = await testeService.listarTestes();

            const resposta = testes.map(t => ({
                id: t.id,
                aeronave: t.aeronave.codigo,
                tipoTeste: t.tipo,
                resultado: t.resultado,
                data: t.data,                              
                observacao: t.observacao ?? "",                 
                funcResp: t.funcionario?.nome ?? "Não informado" 
            }));

            return res.status(200).json(resposta);

        } catch (error) {
            console.error("Erro ao listar testes:", error);
            return res.status(500).json({ message: "Erro interno ao buscar testes" });
        }
    }
}
