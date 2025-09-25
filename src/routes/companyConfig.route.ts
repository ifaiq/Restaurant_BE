import { Router } from 'express';
import {
  createCompanyLegalStatus,
  createCompanyType,
  deleteCompanyLegalStatus,
  deleteCompanyType,
  getCompanyLegalStatuById,
  getCompanyLegalStatus,
  getCompanyTypeById,
  getCompanyTypes,
} from '../controllers/companyConfig.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get(
  '/companytype',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanyTypes(req, res);
  },
);

router.get(
  '/companytype/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanyTypeById(req, res);
  },
);

router.post(
  '/companytype',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createCompanyType(req, res);
  },
);

router.delete(
  '/companytype/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteCompanyType(req, res);
  },
);

router.get(
  '/companylegalstatus',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanyLegalStatus(req, res);
  },
);

router.get(
  '/companylegalstatus/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getCompanyLegalStatuById(req, res);
  },
);

router.post(
  '/companylegalstatus',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await createCompanyLegalStatus(req, res);
  },
);

router.delete(
  '/companylegalstatus/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteCompanyLegalStatus(req, res);
  },
);

export default router;
