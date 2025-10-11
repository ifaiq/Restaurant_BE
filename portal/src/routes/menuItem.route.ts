import { Router } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItem.controller';
import { verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createMenuItem(req, res);
});

router.put('/:id', verifyTokenAndOwner, async (req, res) => {
  await updateMenuItem(req, res);
});

router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteMenuItem(req, res);
});

export default router;
