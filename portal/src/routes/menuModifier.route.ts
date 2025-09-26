import { Router } from 'express';
import {
  createMenuModifier,
  getMenuModifier,
  getAllMenuModifiers,
  getModifiersByMenuItem,
  updateMenuModifier,
  deleteMenuModifier,
  duplicateMenuModifier,
} from '../controllers/menuModifier.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

// Create menu modifier
router.post('/create', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createMenuModifier(req, res);
});

// Get single menu modifier
router.get('/:id', verifyToken, async (req, res) => {
  await getMenuModifier(req, res);
});

// Get all menu modifiers (with optional menu item filter)
router.get('/', verifyToken, async (req, res) => {
  await getAllMenuModifiers(req, res);
});

// Get all modifiers for a specific menu item
router.get('/menu-item/:menuItemId', verifyToken, async (req, res) => {
  await getModifiersByMenuItem(req, res);
});

// Update menu modifier
router.put('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await updateMenuModifier(req, res);
});

// Delete menu modifier
router.delete('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await deleteMenuModifier(req, res);
});

// Duplicate menu modifier
router.post(
  '/duplicate/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await duplicateMenuModifier(req, res);
  },
);

export default router;
