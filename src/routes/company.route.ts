import { Router } from 'express';
import {
  createCompany,
  getCompanyById,
  deleteCompany,
  updateCompany,
  getParentCompany,
  createParentCompany,
  getCompanyAnalytics,
  getCompanySuperAdmin,
  deleteParentCompany,
} from '../controllers/company.controller';
import {
  verifyTokenAndAdmin,
  verifyTokenAndSuperAdmin,
} from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get(
  '/company/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanyById(req, res);
  },
);

router.get('/parent', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getParentCompany(req, res);
});
router.get(
  '/superCompany',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanySuperAdmin(req, res);
  },
);
router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getCompanyAnalytics(req, res);
});

router.post('/company', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createCompany(req, res);
});

router.post(
  '/parentCompany',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createParentCompany(req, res);
  },
);

router.put(
  '/company/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateCompany(req, res);
  },
);

router.delete(
  '/company/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteCompany(req, res);
  },
);

router.delete(
  '/parent/:id',
  verifyTokenAndSuperAdmin,
  permissions,
  async (req, res) => {
    await deleteParentCompany(req, res);
  },
);
export default router;
