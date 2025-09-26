import { Router } from 'express';
import {
  createMenuModifier,
  getMenuModifier,
  getAllMenuModifiers,
  getModifiersByMenuItem,
  updateMenuModifier,
  deleteMenuModifier,
} from '../controllers/menuModifier.controller';
import { verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

// Create menu modifier
router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createMenuModifier(req, res);
});

// Get single menu modifier
router.get('/:id', async (req, res) => {
  await getMenuModifier(req, res);
});

// Get all menu modifiers (with optional menu item filter)
router.get('/', async (req, res) => {
  await getAllMenuModifiers(req, res);
});

// Get all modifiers for a specific menu item
router.get('/menu-item/:menuItemId', async (req, res) => {
  await getModifiersByMenuItem(req, res);
});

// Update menu modifier
router.put('/:id', verifyTokenAndOwner, async (req, res) => {
  await updateMenuModifier(req, res);
});

// Delete menu modifier
router.delete('/:id', verifyTokenAndOwner, async (req, res) => {
  await deleteMenuModifier(req, res);
});

export default router;
