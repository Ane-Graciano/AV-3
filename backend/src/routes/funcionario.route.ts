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
    controller.listarTodos 
);

router.get('/:id',
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.buscarPorId 
);

router.put('/:id',
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.atualizar 
);

router.delete('/:id',
    authenticate, 
    authorize(NivelPermissao.ADMINISTRADOR), 
    controller.deletar 
);

export default router;