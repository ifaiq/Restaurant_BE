import { Router } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAllRestaurantMenuItems,
  createMenuItemFromExcel,
} from '../controllers/menuItem.controller';
import { verifyToken, verifyTokenAndOwner } from '../middlewares/verification';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';

const menuItemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many menu item operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer();

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

router.post(
  '/import-excel/:id',
  upload.single('file'),
  verifyTokenAndOwner,
  async (req, res) => {
    await createMenuItemFromExcel(req, res);
  },
);

export default router;
