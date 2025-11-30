import { NivelPermissao } from '@prisma/client';

interface NivelAcessoFormatado {
    id: number;
    label: string;
    value: NivelPermissao;
}

export class NivelAcessoService {
    listarNiveis(): NivelAcessoFormatado[] {
        const niveis = Object.values(NivelPermissao);

        return niveis.map((nivel, index) => ({
            id: index + 1,
            value: nivel,
            label: nivel, 
        }));
    }
}