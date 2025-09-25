import { Router } from 'express';
import {
  createInvoice,
  getAllInvoices,
  getinvoiceById,
  updateInvoice,
} from '../controllers/invoice.controller';
import {
  verifyTokenAndAdmin,
  verifyTokenAndSuperAdmin,
} from '../middlewares/verification';
import { permissions } from '../middlewares/permission';
const router = Router();

router.get(
  '/getAllInvoice',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getAllInvoices(req, res);
  },
);

router.post(
  '/addinvoice',
  verifyTokenAndSuperAdmin,
  permissions,
  async (req, res) => {
    await createInvoice(req, res);
  },
);

router.get(
  '/getinvoice/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getinvoiceById(req, res);
  },
);
router.put(
  '/update/:id',
  verifyTokenAndSuperAdmin,
  permissions,
  async (req, res) => {
    await updateInvoice(req, res);
  },
);

export default router;
