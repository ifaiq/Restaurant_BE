import { Router } from 'express';
import {
  createModifier,
  getAllModifiers,
  deleteModifier,
} from '../controllers/modifier.controller';
import { verifyToken, verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createModifier(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllModifiers(req, res);
});

router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteModifier(req, res);
});

export default router;
