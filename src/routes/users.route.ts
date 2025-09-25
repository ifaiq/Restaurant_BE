import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  createUser,
  getAllStaff,
  getUserAnalytics,
  getAdminAnalytics,
  getUserProfile,
  getUserUsageAnalytics,
  updateAllUsersDocViewable,
} from '../controllers/users.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';

const router = Router();

router.get('/allUsers', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getAllUsers(req, res);
});

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getUserAnalytics(req, res);
});

router.get(
  '/usageAnalytics',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getUserUsageAnalytics(req, res);
  },
);

router.get(
  '/adminAnalytics',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await getAdminAnalytics(req, res);
  },
);

router.get('/allStaff', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getAllStaff(req, res);
});

router.get('/user/:id', verifyTokenAndAdmin, permissions, async (req, res) => {
  await getUserById(req, res);
});

router.put('/docsView', verifyTokenAndAdmin, permissions, async (req, res) => {
  await updateAllUsersDocViewable(req, res);
});

router.get('/profile', verifyToken, async (req, res) => {
  await getUserProfile(req, res);
});

router.put(
  '/update/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await updateUser(req, res);
  },
);

// router.put(
//   '/status/:id',
//   verifyTokenAndAdmin,
//   permissions,
//   async (req, res) => {
//     await changeUserStatus(req, res);
//   },
// );

router.post('/addUser', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createUser(req, res);
});
router.delete(
  '/delete/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteUser(req, res);
  },
);

export default router;
