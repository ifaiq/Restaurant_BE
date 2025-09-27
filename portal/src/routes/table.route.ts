import { Router } from 'express';
import {
  createTable,
  getTable,
  getTableByQR,
  getAllTables,
  getTablesByRestaurant,
  updateTable,
  updateTableStatus,
  regenerateQRCode,
  deleteTable,
} from '../controllers/table.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';

const router = Router();

// Create table
router.post('/create', verifyTokenAndAdmin, async (req, res) => {
  await createTable(req, res);
});

// Get table by ID
router.get('/:id', verifyToken, async (req, res) => {
  await getTable(req, res);
});

// Get table by QR code (public endpoint for QR scanning)
router.get('/qr/:qrCode', async (req, res) => {
  await getTableByQR(req, res);
});

// Get all tables
router.get('/', verifyToken, async (req, res) => {
  await getAllTables(req, res);
});

// Get tables by restaurant
router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  await getTablesByRestaurant(req, res);
});

// Update table
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
  await updateTable(req, res);
});

// Update table status only
router.patch('/:id/status', verifyToken, async (req, res) => {
  await updateTableStatus(req, res);
});

// Regenerate QR code
router.post('/:id/regenerate-qr', verifyTokenAndAdmin, async (req, res) => {
  await regenerateQRCode(req, res);
});

// Delete table
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteTable(req, res);
});

export default router;
