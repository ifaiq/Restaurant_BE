import { Router } from 'express';
import {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
  deleteRole,
  analyticsRole,
} from '../controllers/role.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';
const router = Router();

router.post('/addRole', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createRole(req, res);
});

router.get(
  '/getAllRoles',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getAllRoles(req, res);
  },
);

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await analyticsRole(req, res);
});

router.get(
  '/getRole/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getRole(req, res);
  },
);
router.put(
  '/update/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateRole(req, res);
  },
);

router.delete(
  '/delete/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteRole(req, res);
  },
);
export default router;
