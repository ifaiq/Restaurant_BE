import { Router } from 'express';
import {
  login,
  resetPasswordByEmail,
  genTenantId,
  passwordResetByToken,
} from '../controllers/auth.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import rateLimit from 'express-rate-limit';

const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
const router = Router();

router.post('/add', sensitiveAuthLimiter, async (req, res) => {
  await login(req, res);
});

router.post('/resetPasswordByEmail', sensitiveAuthLimiter, async (req, res) => {
  await resetPasswordByEmail(req, res);
});

router.get('/contact/:id', verifyTokenAndAdmin, async (req, res) => {
  await passwordResetByToken(req, res);
});

router.get('/contacts', verifyTokenAndAdmin, async (req, res) => {
  await genTenantId(req, res);
});

export default router;
