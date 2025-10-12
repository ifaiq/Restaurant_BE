import { Router } from 'express';
import {
  createCategory,
  getCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { verifyToken, verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createCategory(req, res);
});

router.get('/:id', verifyToken, async (req, res) => {
  await getCategory(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllCategories(req, res);
});

router.put('/:id', verifyTokenAndOwner, async (req, res) => {
  await updateCategory(req, res);
});

router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteCategory(req, res);
});

export default router;
