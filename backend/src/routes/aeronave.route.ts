import { Router } from 'express';
import { AeronaveController } from '../controllers/aeronave.controller';
import { RelatorioController } from '../controllers/relatorio.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';
import { EtapaController } from '../controllers/etapa.controller';

const router = Router();
const aeronaveController = new AeronaveController();
const relatorioController = new RelatorioController();
const etapaController = new EtapaController();

// Listar e Detalhar (Qualquer usuário autenticado)
router.get('/', authenticate, aeronaveController.listarAeronaves);
router.get('/id/:id',
    authenticate,
    aeronaveController.obterDetalhesPorId
);
router.get('/codigo/:codigo', authenticate, aeronaveController.obterDetalhes);



// Criação de Aeronave (Engenheiro ou Admin)
router.post('/cadastrar',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    aeronaveController.criarAeronave
);

router.patch('/id/:id',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    aeronaveController.editarAeronave // <-- Novo método de edição
);

// Geração de Relatório Final (Engenheiro ou Admin)
router.post('/:id/relatorio',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]),
    relatorioController.gerarRelatorio
);

router.post('/:id/etapas',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO]), // Ou NivelPermissao.OPERADOR, se for o caso
    etapaController.cadastrarEtapa // <-- 3. Mapeamento para o método
);


// router.get(
//     '/:id/relatorios', 
//     authenticate, 
//     relatorioController.listarRelatoriosPorAeronave
// );

router.get(
    '/relatorios/todos',
    authenticate,
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    relatorioController.listarTodosRelatorios // <--- Novo Controller
);

// 3. Download do Relatório (GET /aeronaves/relatorio/download/:nomeArquivo)
// Usada para baixar o arquivo físico do servidor.
router.get(
    '/relatorio/download/:nomeArquivo',
    authenticate,    
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]),
    relatorioController.downloadRelatorio
);


export default router;