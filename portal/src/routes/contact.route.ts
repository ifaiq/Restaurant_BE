import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  markAsUnread,
  deleteContact,
  getContactStats,
} from '../controllers/contact.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';
import rateLimit from 'express-rate-limit';

const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 contact form submissions per windowMs
  message: 'Too many contact form submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/', contactFormLimiter, async (req, res) => {
  await createContact(req, res);
});

router.get('/', verifyTokenAndAdmin, async (req, res) => {
  await getAllContacts(req, res);
});

router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
  await getContactStats(req, res);
});

router.get('/:id', verifyTokenAndAdmin, async (req, res) => {
  await getContactById(req, res);
});

router.patch(
  '/:id/read',
  verifyTokenAndAdmin,

  async (req, res) => {
    await markAsRead(req, res);
  },
);

router.patch(
  '/:id/unread',
  verifyTokenAndAdmin,

  async (req, res) => {
    await markAsUnread(req, res);
  },
);

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteContact(req, res);
});

export default router;
