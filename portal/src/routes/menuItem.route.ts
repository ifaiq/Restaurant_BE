import { Router } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAllRestaurantMenuItems,
} from '../controllers/menuItem.controller';
import { verifyToken, verifyTokenAndOwner } from '../middlewares/verification';
import { rateLimit } from 'express-rate-limit';

const menuItemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many menu item operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createMenuItem(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllMenuItems(req, res);
});

router.get(
  '/restaurant/:restaurantId/:tableId',
  menuItemLimiter,
  async (req, res) => {
    await getAllRestaurantMenuItems(req, res);
  },
);

router.put('/:id', verifyTokenAndOwner, async (req, res) => {
  await updateMenuItem(req, res);
});

router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteMenuItem(req, res);
});

export default router;
