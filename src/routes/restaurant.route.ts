import { Router } from 'express';
import {
  createRestaurant,
  createRestaurantBranch,
  getRestaurant,
  getAllRestaurants,
  getRestaurantBranches,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurant.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

// Create parent/standalone restaurant
router.post('/create', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createRestaurant(req, res);
});

// Create restaurant branch
router.post(
  '/create-branch',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createRestaurantBranch(req, res);
  },
);

// Get single restaurant
router.get('/:id', verifyToken, async (req, res) => {
  await getRestaurant(req, res);
});

// Get all parent/standalone restaurants
router.get('/', verifyToken, async (req, res) => {
  await getAllRestaurants(req, res);
});

// Get all branches of a specific restaurant
router.get('/:parentId/branches', verifyToken, async (req, res) => {
  await getRestaurantBranches(req, res);
});

// Update restaurant
router.put('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await updateRestaurant(req, res);
});

// Delete restaurant
router.delete('/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await deleteRestaurant(req, res);
});

export default router;
