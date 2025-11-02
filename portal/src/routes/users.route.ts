import { Router } from 'express';
import {
  getAllUsers,
  deleteUser,
  updateOwner,
  updateStaff,
  createOwner,
  createStaff,
  getAllStaff,
  getUserAnalytics,
  getAdminAnalytics,
  getUserProfile,
  getUserUsageAnalytics,
  getStaffById,
  getOwnerById,
} from '../controllers/users.controller';
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOwner,
} from '../middlewares/verification';

const router = Router();

router.get('/allOwners', verifyTokenAndAdmin, async (req, res) => {
  await getAllUsers(req, res);
});

router.get('/analytics', verifyTokenAndAdmin, async (req, res) => {
  await getUserAnalytics(req, res);
});

router.get(
  '/usageAnalytics',
  verifyTokenAndAdmin,

  async (req, res) => {
    await getUserUsageAnalytics(req, res);
  },
);

router.get(
  '/adminAnalytics',
  verifyTokenAndAdmin,

  async (req, res) => {
    await getAdminAnalytics(req, res);
  },
);

router.get('/allStaff', verifyTokenAndOwner, async (req, res) => {
  await getAllStaff(req, res);
});

router.get('/staff/:id', verifyTokenAndOwner, async (req, res) => {
  await getStaffById(req, res);
});

router.get('/owner/:id', verifyTokenAndAdmin, async (req, res) => {
  await getOwnerById(req, res);
});

router.get('/profile', verifyToken, async (req, res) => {
  await getUserProfile(req, res);
});

router.put(
  '/owner/:id',
  verifyTokenAndAdmin,

  async (req, res) => {
    await updateOwner(req, res);
  },
);

router.put(
  '/staff/:id',
  verifyTokenAndOwner,

  async (req, res) => {
    await updateStaff(req, res);
  },
);

router.post('/createOwner', verifyTokenAndAdmin, async (req, res) => {
  await createOwner(req, res);
});
router.post('/createStaff', verifyTokenAndOwner, async (req, res) => {
  await createStaff(req, res);
});
router.delete(
  '/delete/:id',
  verifyTokenAndOwner,

  async (req, res) => {
    await deleteUser(req, res);
  },
);

export default router;
