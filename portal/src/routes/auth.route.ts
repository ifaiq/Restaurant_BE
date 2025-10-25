import { Router } from 'express';
import {
  login,
  resetPassword,
  register,
  forgetPassword,
  resetPasswordByEmail,
  genTenantId,
  forgetKeyPassword,
  passwordResetByToken,
} from '../controllers/auth.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import rateLimit from 'express-rate-limit';

const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
const router = Router();

router.post('/register', verifyTokenAndAdmin, async (req, res) => {
  await register(req, res);
});

router.post('/registerAdmin', async (req, res) => {
  await register(req, res);
});

router.post('/login', sensitiveAuthLimiter, async (req, res) => {
  await login(req, res);
});

router.post('/forgetPassword', sensitiveAuthLimiter, async (req, res) => {
  await forgetPassword(req, res);
});

router.post('/forgetKeyPassword', sensitiveAuthLimiter, async (req, res) => {
  await forgetKeyPassword(req, res);
});

router.post('/resetPassword', sensitiveAuthLimiter, async (req, res) => {
  await resetPassword(req, res);
});

router.post('/resetPasswordByEmail', sensitiveAuthLimiter, async (req, res) => {
  await resetPasswordByEmail(req, res);
});

router.put('/tokenPassword', verifyToken, async (req, res) => {
  await passwordResetByToken(req, res);
});

router.post('/generator', async (req, res) => {
  await genTenantId(req, res);
});

export default router;
