import { Router } from 'express';
import { ProxyController } from '../controllers/proxy';

const router = Router();

router.post('/chat/completions', ProxyController.chatCompletion);
router.get('/models', ProxyController.models);

export default router;
