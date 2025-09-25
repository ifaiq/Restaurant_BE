import { Router } from 'express';
import {
  addApprovalReply,
  createApprovalFlow,
  editApprovalFlow,
  getApprovalFlow,
  updateApprovalFlow,
} from '../controllers/approval.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.post(
  '/addApproval',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createApprovalFlow(req, res);
  },
);

router.put(
  '/update/:documentId',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateApprovalFlow(req, res);
  },
);

router.put(
  '/editApproval/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await editApprovalFlow(req, res);
  },
);

router.get(
  '/view/:documentId',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getApprovalFlow(req, res);
  },
);

router.put(
  '/reply/:documentId',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await addApprovalReply(req, res);
  },
);
export default router;
