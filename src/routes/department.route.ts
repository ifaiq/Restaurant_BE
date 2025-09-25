import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getChildDepartments,
  getDepartmentsByCompany,
  departmentAnalytics,
} from '../controllers/department.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get(
  '/department',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getDepartments(req, res);
  },
);
router.get(
  '/departmentCompany/:companyId',
  verifyTokenAndAdmin,
  async (req, res) => {
    await getDepartmentsByCompany(req, res);
  },
);

router.get(
  '/department/:departmentId',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getChildDepartments(req, res);
  },
);

router.get(
  '/departmentById/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getDepartmentById(req, res);
  },
);

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await departmentAnalytics(req, res);
});

router.post(
  '/department',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createDepartment(req, res);
  },
);

router.put(
  '/department/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateDepartment(req, res);
  },
);

router.delete(
  '/department/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteDepartment(req, res);
  },
);

export default router;
