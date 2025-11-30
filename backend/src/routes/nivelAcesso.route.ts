// backend/routes/nivelAcesso.route.ts
import { Router } from 'express';
import { NivelAcessoController } from '../controllers/nivelAcesso.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const controller = new NivelAcessoController();

// A rota só precisa de autenticação, não de nível específico (todos podem ver os níveis)
router.get('/', authenticate, controller.listar); 

export default router;