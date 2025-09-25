import { Router } from 'express';
import {
  createDocumentType,
  getDocumentTypeById,
  getDocumentTypes,
  updateDocumentType,
  deleteDocumentType,
} from '../controllers/documentType.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get(
  '/documenttype',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getDocumentTypes(req, res);
  },
);

router.get(
  '/documenttype/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getDocumentTypeById(req, res);
  },
);

router.post(
  '/documenttype',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createDocumentType(req, res);
  },
);

router.put(
  '/documenttype/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateDocumentType(req, res);
  },
);

router.delete(
  '/documenttype/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteDocumentType(req, res);
  },
);

export default router;
