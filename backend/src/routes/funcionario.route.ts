import { Router } from 'express';
import { FuncionarioController } from '../controllers/funcionario.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();
const controller = new FuncionarioController();

router.post('/login', controller.login);

router.post('/cadastrar', 
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.cadastrar
);

router.get('/',
    authenticate, 
    authorize([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]), 
    controller.listarTodos // Método necessário no Controller
);

// [NOVA] 2. Rota para Obter um funcionário por ID (GET /funcionarios/:id)
// ESSA É A ROTA QUE FALTAVA PARA A FUNÇÃO 'pegaFunc'
router.get('/:id',
    authenticate, 
    // Permite que perfis de alto nível ou o próprio usuário acesse os dados
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.buscarPorId // Método necessário no Controller
);

// [NOVA] 4. Rota de Edição/Atualização (PUT /funcionarios/:id)
router.put('/:id',
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.atualizar // Método necessário no Controller
);

// [EXTRA] 5. Rota para Deletar (DELETE /funcionarios/:id)
router.delete('/:id',
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.deletar // Método necessário no Controller
);

export default router;