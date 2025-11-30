import { prisma } from './base.service';
import { AeronaveService, type AeronaveDetalhada } from './aeronave.service';
import { type Relatorio } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const aeronaveService = new AeronaveService();

export class RelatorioService {
    async gerarRelatorio(aeronaveId: number): Promise<Relatorio> {

        const aeronaveDetalhes: AeronaveDetalhada | null =
            await aeronaveService.buscarPorIdDetalhado(aeronaveId);

        if (!aeronaveDetalhes) {
            throw new Error("Aeronave não encontrada.");
        }

        const todasEtapasConcluidas = aeronaveDetalhes.etapas.every(e => e.status === 'CONCLUIDA');

        if (!todasEtapasConcluidas) {
            throw new Error("Aeronave ainda tem etapas de produção pendentes.");
        }

        // Adicionei a verificação de status das peças aqui para consistência
        const todasPecasProntas = aeronaveDetalhes.pecas.every(p => p.status === 'PRONTA');
        if (!todasPecasProntas) {
            throw new Error("Aeronave ainda tem peças que não estão com o status 'PRONTA'.");
        }

        const conteudo = this.formatarRelatorio(aeronaveDetalhes);

        const nomeArquivo = `Relatorio_${aeronaveDetalhes.codigo}_${new Date().toISOString().split('T')[0]}.txt`;

        const relatoriosDir = path.join(process.cwd(), 'relatorios');
        await fs.mkdir(relatoriosDir, { recursive: true });

        const filePath = path.join(relatoriosDir, nomeArquivo);
        await fs.writeFile(filePath, conteudo, { encoding: 'utf8' });

        // Registro no banco
        const relatorio = await prisma.relatorio.create({
            data: {
                nomeArquivo,
                data: new Date(),
                aeronave: {
                    connect: { id: aeronaveId }
                }
            }
        });

        return relatorio;
    }

    private formatarRelatorio(aeronave: AeronaveDetalhada): string {
        console.log("ETAPA DETALHES:", JSON.stringify(aeronave.etapas, null, 2));
        const dataFormatada = new Date().toLocaleDateString('pt-BR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        let relatorio = `--- RELATÓRIO FINAL DE ENTREGA ---\n\n`;
        relatorio += `Data de Geração: ${dataFormatada}\n`;

        relatorio += `\n--- DADOS DA AERONAVE ---\n`;
        relatorio += `ID Interno: ${aeronave.id}\n`;
        relatorio += `Código: ${aeronave.codigo}\n`;
        relatorio += `Modelo: ${aeronave.modelo}\n`;
        relatorio += `Tipo: ${aeronave.tipo}\n`;
        relatorio += `Capacidade: ${aeronave.capacidade}\n`;
        relatorio += `Alcance: ${aeronave.alcance}\n`;

        relatorio += `\n--- PEÇAS UTILIZADAS (${aeronave.pecas.length}) ---\n`;
        aeronave.pecas.forEach(p => {
            relatorio += `- ${p.nome} (Fornecedor: ${p.fornecedor}, Status: ${p.status})\n`;
        });

        relatorio += `\n--- ETAPAS REALIZADAS (${aeronave.etapas.length}) ---\n`;
        aeronave.etapas.forEach(e => {
            // CORREÇÃO (BOA PRÁTICA): Garantir que e.funcionarios seja um array
            const funcionarios = (e.funcionarios ?? []).map(f => f.nome).join(', ');
            relatorio += `- ${e.nome} (Prazo: ${e.prazo}, Status: ${e.status}, Responsáveis: ${funcionarios || 'N/A'})\n`;
        });

        relatorio += `\n--- RESULTADOS DOS TESTES (${aeronave.testes.length}) ---\n`;
        aeronave.testes.forEach(t => {
            // CORREÇÃO PRINCIPAL: Usa Optional Chaining (?.) e Nullish Coalescing (??)
            // para evitar erro se t.funcionario for null/undefined.
            const tecnicoNome = t.funcionario?.nome ?? 'N/A';
            relatorio += `- ${t.tipo}: ${t.resultado} (Técnico: ${tecnicoNome})\n`;
        });

        return relatorio;
    }

    // async listarPorAeronave(aeronaveId: number) {
    //     return prisma.relatorio.findMany({
    //         where: { aeronaveId },
    //         orderBy: { data: 'desc' }
    //     });
    // }

    async listarTodosRelatorios() {
        return prisma.relatorio.findMany({
            orderBy: { data: 'desc' } // Ordena por data de geração
        });
    }
}