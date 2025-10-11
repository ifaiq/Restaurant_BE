import { Router } from 'express';
import {
  createTable,
  getTable,
  getTableByQR,
  getAllTables,
  getTablesByRestaurant,
  updateTable,
  // updateTableStatus,
  // regenerateQRCode,
  deleteTable,
} from '../controllers/table.controller';
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOwner,
} from '../middlewares/verification';

const router = Router();

router.post('/create', verifyTokenAndOwner, async (req, res) => {
  await createTable(req, res);
});

router.get('/:id', verifyToken, async (req, res) => {
  await getTable(req, res);
});

router.get('/qr/:qrCode', async (req, res) => {
  await getTableByQR(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAllTables(req, res);
});

router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  await getTablesByRestaurant(req, res);
});

router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
  await updateTable(req, res);
});

// router.patch('/:id/status', verifyToken, async (req, res) => {
//   await updateTableStatus(req, res);
// });

// router.post('/:id/regenerate-qr', verifyTokenAndAdmin, async (req, res) => {
//   await regenerateQRCode(req, res);
// });

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteTable(req, res);
});

export default router;
