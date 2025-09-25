import { Router } from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  changeDocumentStatus,
  deleteDocument,
  updateDocument,
  publishDocument,
  attachAIFriendlyDoc,
  documentAnalytics,
  getDocumentName,
  uploadListDocument,
} from '../controllers/document.controller';
import { verifyTokenAndAdmin, verifyToken } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get('/document', verifyToken, permissions, async (req, res) => {
  await getDocuments(req, res);
});

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await documentAnalytics(req, res);
});

router.get(
  '/document/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getDocumentById(req, res);
  },
);

router.post('/document', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createDocument(req, res);
});

router.put(
  '/document/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateDocument(req, res);
  },
);

router.put(
  '/document/statusDocument/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await changeDocumentStatus(req, res);
  },
);

router.delete(
  '/document/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteDocument(req, res);
  },
);

router.put(
  '/document/:id/publish',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await publishDocument(req, res);
  },
);

router.post(
  '/document/:id/attach',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await attachAIFriendlyDoc(req, res);
  },
);

router.get('/getDocumentName', verifyToken, async (req, res) => {
  await getDocumentName(req, res);
});

router.get(
  '/uploadList',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await uploadListDocument(req, res);
  },
);

export default router;
