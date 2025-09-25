import { Router } from 'express';
import {
  createOpenAi,
  getOpenAi,
  deleteOpenAi,
  updateOpenAi,
} from '../controllers/openAi.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';

const router = Router();

router.post('/key', verifyTokenAndAdmin, async (req, res) => {
  await createOpenAi(req, res);
});

router.get('/key', verifyTokenAndAdmin, async (req, res) => {
  await getOpenAi(req, res);
});

router.put('/key', verifyTokenAndAdmin, async (req, res) => {
  await updateOpenAi(req, res);
});

router.delete('/key', verifyTokenAndAdmin, async (req, res) => {
  await deleteOpenAi(req, res);
});

export default router;
