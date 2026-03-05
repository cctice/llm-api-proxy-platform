import { Router } from 'express';
import { ApiKeyController } from '../controllers/apiKey';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', ApiKeyController.createApiKey);
router.get('/', ApiKeyController.listApiKeys);
router.delete('/:keyId', ApiKeyController.deleteApiKey);
router.patch('/:keyId', ApiKeyController.updateApiKey);

export default router;
