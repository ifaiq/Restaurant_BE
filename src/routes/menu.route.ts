import { Router } from 'express';
import {
  createMenu,
  getMenu,
  getAllMenus,
  getMenusByRestaurant,
  updateMenu,
  deleteMenu,
} from '../controllers/menu.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.post('/create', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createMenu(req, res);
});

router.get('/:id', verifyToken, async (req, res) => {
  await getMenu(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllMenus(req, res);
});

router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  await getMenusByRestaurant(req, res);
});

router.put('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await updateMenu(req, res);
});

router.delete('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await deleteMenu(req, res);
});

export default router;
