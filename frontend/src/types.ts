export type aeronaves = {
    codigo: string
    modelo: string
    tipo: string
    capacidade: string
    alcance: string
    id: number    
    statusRelatorio?: 'Pendente' | 'Concluído' | string
}

export type etapa = {
    id: number
    nome: string
    prazo: string
    status: string
    funcSelecionado: string[]
    idAeronave: number
    funcionarios: { id: number; nome: string }[];
}

export type peca = {
    id: number
    nome: string
    tipo: string
    fornecedor: string
    status: string
    idAeronave: number
}

export type teste = {
    id: number
    aeronave: string
    tipo: string
    resultado: string
    data: string
    observacao?: string | null
    funcResp: string | null
    funcionarioId: number | null
    funcionario?: { 
        nome: string
    } | null
}

export type relatorio = {
  id: number;
  nomeArquivo: string;
  data: string | Date; 
  aeronaveId: number;
};

export interface RelatorioResumo {
  id: string
  titulo: string
  descricao?: string
  aeronave: aeronaves
}
