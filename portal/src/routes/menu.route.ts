import { Router } from 'express';
import {
  createMenu,
  getMenu,
  getAllMenus,
  getMenusByRestaurant,
  updateMenu,
  deleteMenu,
  getMenuWithModifiers,
} from '../controllers/menu.controller';
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOwner,
} from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createMenu(req, res);
});

router.get('/:id', verifyToken, async (req, res) => {
  await getMenu(req, res);
});

router.get('/:id/with-modifiers', verifyToken, async (req, res) => {
  await getMenuWithModifiers(req, res);
});

router.get('/', verifyTokenAndAdmin, async (req, res) => {
  await getAllMenus(req, res);
});

router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  await getMenusByRestaurant(req, res);
});

router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
  await updateMenu(req, res);
});

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteMenu(req, res);
});

export default router;
