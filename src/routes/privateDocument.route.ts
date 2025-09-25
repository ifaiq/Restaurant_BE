import { Router } from 'express';
import {
  createPrivateDocument,
  getDocuments,
  getDocumentById,
  changeDocumentStatus,
  deleteDocument,
  updateDocument,
  publishDocument,
  attachAIFriendlyDoc,
  documentAnalytics,
  getDocumentName,
} from '../controllers/privateDocument.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get('/document', verifyTokenAndAdmin, permissions, async (req, res) => {
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
  await createPrivateDocument(req, res);
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

router.post('/getDocumentName', verifyToken, permissions, async (req, res) => {
  await getDocumentName(req, res);
});

export default router;
