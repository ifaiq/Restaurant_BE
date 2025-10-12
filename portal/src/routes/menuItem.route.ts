import { Router } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAllRestaurantMenuItems,
} from '../controllers/menuItem.controller';
import { verifyToken, verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createMenuItem(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllMenuItems(req, res);
});

router.get('/restaurant/:restaurantId/:tableId', async (req, res) => {
  await getAllRestaurantMenuItems(req, res);
});

router.put('/:id', verifyTokenAndOwner, async (req, res) => {
  await updateMenuItem(req, res);
});

router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteMenuItem(req, res);
});

export default router;
