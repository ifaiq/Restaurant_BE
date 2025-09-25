import { Router } from 'express';
import { sendRefrenceEmail } from '../controllers/client.controller';
import { verifyToken } from '../middlewares/verification';

const router = Router();

router.post('/sendRefrenceEmail', verifyToken, async (req, res) => {
  await sendRefrenceEmail(req, res);
});

export default router;
