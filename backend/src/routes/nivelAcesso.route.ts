import { Router } from 'express';
import { NivelAcessoController } from '../controllers/nivelAcesso.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const controller = new NivelAcessoController();

router.get('/', authenticate, controller.listar); 

export default router;