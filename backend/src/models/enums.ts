// Define o formato esperado pelo frontend (SelectLinha)
export type EnumOption = {
    value: string;
    label: string;
}

/**
 * Converte um Enum em um array de objetos { value, label } para uso no frontend.
 */
const enumToArray = (enumObject: any): EnumOption[] => {
    return Object.values(enumObject).map(value => {
        const stringValue = String(value);
        return {
            value: stringValue,
            // Formata a label: "EM_ANDAMENTO" -> "Em andamento"
            label: stringValue.charAt(0) + stringValue.slice(1).toLowerCase().replace(/_/g, ' ')
        };
    });
};

// --- ENUMS ---

export enum TipoAeronave {
    COMERCIAL = 'COMERCIAL',
    MILITAR = 'MILITAR',
}
export const tiposAeronaveLista: EnumOption[] = enumToArray(TipoAeronave);

export enum StatusEtapa {
    PENDENTE = 'PENDENTE',
    ANDAMENTO = 'ANDAMENTO',
    CONCLUIDA = 'CONCLUIDA',
}
export const statusEtapaLista: EnumOption[] = enumToArray(StatusEtapa);

export enum StatusPeca {
    EM_PRODUCAO = 'EM_PRODUCAO',
    EM_TRANSPORTE = 'EM_TRANSPORTE',
    PRONTA = 'PRONTA',
}
export const statusPecaLista: EnumOption[] = enumToArray(StatusPeca);

export enum TipoPeca {
    NACIONAL = 'NACIONAL',
    IMPORTADA = 'IMPORTADA',
}
export const tipoPecaLista: EnumOption[] = enumToArray(TipoPeca);

export enum TipoTeste {
    ELETRICO = 'ELETRICO',
    HIDRAULICO = 'HIDRAULICO',
    AERODINAMICO = 'AERODINAMICO'
}
export const tipoTesteLista: EnumOption[] = enumToArray(TipoTeste);

export enum TipoResultTeste {
    APROVADO = 'APROVADO',
    REPROVADO = 'REPROVADO'
}
export const resultLista: EnumOption[] = enumToArray(TipoResultTeste);