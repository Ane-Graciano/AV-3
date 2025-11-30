import { Router } from 'express';
import { EtapaController } from '../controllers/etapa.controller';
import { PecaController } from '../controllers/peca.controller';
import { TesteController } from '../controllers/teste.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();
const etapaController = new EtapaController();
const pecaController = new PecaController();
const testeController = new TesteController();

// --- Rotas de PEÇAS (Operador/Engenheiro) ---
// Note que as peças são relacionadas a uma Aeronave
router.post('/aeronaves/:id/pecas',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    pecaController.cadastrarPeca
);
router.put('/pecas/:id',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]), 
    pecaController.editarPeca
);
router.get(
    '/pecas/:id',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    pecaController.buscarPecaPorId 
);
router.patch('/pecas/:id/status',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    pecaController.atualizarStatusPeca
);
router.get(
    '/pecas',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]), // ou ENGENHEIRO, se quiser
    pecaController.listarPecas
);



// --- Rotas de ETAPAS  ---
router.get(
    '/etapas',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    etapaController.listarEtapas
);
router.get(
    '/etapas/:id',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    etapaController.buscarEtapaPorId // Chama o novo método do controller
);

router.put('/etapas/:id',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    etapaController.atualizarEtapa
);

router.patch('/etapas/:id/iniciar',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    etapaController.iniciarEtapa
);
router.patch('/etapas/:id/finalizar',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    etapaController.finalizarEtapa
);
router.patch('/etapas/:id/associar-funcionario',
    authenticate,
    authorize(NivelPermissao.ADMINISTRADOR),
    etapaController.associarFuncionario
);


// --- Rotas de TESTES (Engenheiro) ---
router.post('/aeronaves/:codigo/testes',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    testeController.registrarTeste
);

router.get(
    '/testes',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    testeController.listarTestes
);


export default router;