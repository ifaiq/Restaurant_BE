import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';

const router = Router();

// Create parent/standalone restaurant
router.post('/create', RestaurantController.createRestaurant);

// Create restaurant branch
router.post('/create-branch', RestaurantController.createRestaurantBranch);

// Get single restaurant
router.get('/:id', RestaurantController.getRestaurant);

// Get all parent/standalone restaurants
router.get('/', RestaurantController.getAllRestaurants);

// Get all branches of a specific restaurant
router.get('/:parentId/branches', RestaurantController.getRestaurantBranches);

// Update restaurant
router.put('/:id', RestaurantController.updateRestaurant);

// Delete restaurant
router.delete('/:id', RestaurantController.deleteRestaurant);

export default router;
