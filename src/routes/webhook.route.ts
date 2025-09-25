import { Router } from 'express';
import { documentWebhook } from '../controllers/document.controller';
const router = Router();

router.post('/document', async (req, res) => {
  await documentWebhook(req, res);
});

export default router;
