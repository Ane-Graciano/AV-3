import {
    tiposAeronaveLista,
    statusEtapaLista,
    statusPecaLista,
    tipoPecaLista,
    EnumOption,
    tipoTesteLista,
    resultLista
} from '../models/enums';

export class EnumService {
    
    // Método para listar Tipos de Aeronave
    listarTiposAeronave(): EnumOption[] {
        return tiposAeronaveLista;
    }

    // Método para listar Status de Etapa
    listarStatusEtapa(): EnumOption[] {
        return statusEtapaLista;
    }
    
    // Método para listar Status de Peça
    listarStatusPeca(): EnumOption[] {
        return statusPecaLista;
    }

    listarTiposPeca(): EnumOption[] {
        return tipoPecaLista;
    }

    listarTiposTeste(): EnumOption[] {
        return tipoTesteLista;
    }
    
    listarTiposResultTeste(): EnumOption[] {
        return resultLista;
    }
    
}