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

const router = Router();

router.post('/create', verifyTokenAndAdmin, async (req, res) => {
  await createRestaurant(req, res);
});

router.post('/create-branch', verifyTokenAndAdmin, async (req, res) => {
  await createRestaurantBranch(req, res);
});

router.get('/:id', verifyToken, async (req, res) => {
  await getRestaurant(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllRestaurants(req, res);
});

router.get('/:parentId/branches', verifyToken, async (req, res) => {
  await getRestaurantBranches(req, res);
});

router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
  await updateRestaurant(req, res);
});

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteRestaurant(req, res);
});

export default router;
