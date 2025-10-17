import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  createOwner,
  createStaff,
  getAllStaff,
  getUserAnalytics,
  getAdminAnalytics,
  getUserProfile,
  getUserUsageAnalytics,
} from '../controllers/users.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';

const router = Router();

router.get('/allUsers', verifyTokenAndAdmin, async (req, res) => {
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

router.get('/allStaff', verifyTokenAndAdmin, async (req, res) => {
  await getAllStaff(req, res);
});

router.get('/user/:id', verifyTokenAndAdmin, async (req, res) => {
  await getUserById(req, res);
});

router.get('/profile', verifyToken, async (req, res) => {
  await getUserProfile(req, res);
});

router.put(
  '/update/:id',
  verifyTokenAndAdmin,

  async (req, res) => {
    await updateUser(req, res);
  },
);

// router.put(
//   '/status/:id',
//   verifyTokenAndAdmin,
//
//   async (req, res) => {
//     await changeUserStatus(req, res);
//   },
// );

router.post('/createOwner', verifyTokenAndAdmin, async (req, res) => {
  await createOwner(req, res);
});
router.post('/createStaff', verifyTokenAndAdmin, async (req, res) => {
  await createStaff(req, res);
});
router.delete(
  '/delete/:id',
  verifyTokenAndAdmin,

  async (req, res) => {
    await deleteUser(req, res);
  },
);

export default router;
