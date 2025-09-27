import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getOrderByNumber,
  getAllOrders,
  getOrdersByRestaurant,
  getOrdersByTable,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/order.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';

const router = Router();

// Create order
router.post('/create', verifyToken, async (req, res) => {
  await createOrder(req, res);
});

// Get order by ID
router.get('/:id', verifyToken, async (req, res) => {
  await getOrder(req, res);
});

// Get order by order number
router.get('/number/:orderNumber', verifyToken, async (req, res) => {
  await getOrderByNumber(req, res);
});

// Get all orders
router.get('/', verifyToken, async (req, res) => {
  await getAllOrders(req, res);
});

// Get orders by restaurant
router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  await getOrdersByRestaurant(req, res);
});

// Get orders by table
router.get('/table/:tableId', verifyToken, async (req, res) => {
  await getOrdersByTable(req, res);
});

// Update order
router.put('/:id', verifyToken, async (req, res) => {
  await updateOrder(req, res);
});

// Update order status
router.patch('/:id/status', verifyToken, async (req, res) => {
  await updateOrderStatus(req, res);
});

// Update payment status
router.patch('/:id/payment', verifyToken, async (req, res) => {
  await updatePaymentStatus(req, res);
});

// Delete order
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteOrder(req, res);
});

export default router;
