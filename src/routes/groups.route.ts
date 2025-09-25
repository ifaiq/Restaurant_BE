import { Router } from 'express';
import {
  deleteGroup,
  getAllGroups,
  getGroupById,
  groupAnalytics,
  updateGroup,
} from '../controllers/groups.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';
//import { permissions } from '../middlewares/permission';
const router = Router();

router.get(
  '/getAllGroups',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getAllGroups(req, res);
  },
);

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await groupAnalytics(req, res);
});

router.get(
  '/getGroup/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getGroupById(req, res);
  },
);
router.put(
  '/update/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateGroup(req, res);
  },
);

router.delete(
  '/delete/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteGroup(req, res);
  },
);
export default router;
