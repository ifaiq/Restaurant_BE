import { Router } from 'express';
import {
  createFeedbackForm,
  deleteFeedbackById,
  feedbackAnalytics,
  getFeedbackById,
  submitFeedback,
  viewAllFeedBacks,
  viewFeedbackForm,
} from '../controllers/feedback.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
import { permissions } from '../middlewares/permission';
const router = Router();

router.post('/addForm', verifyTokenAndAdmin, permissions, async (req, res) => {
  await createFeedbackForm(req, res);
});
router.post('/submitFeedback', verifyToken, async (req, res) => {
  await submitFeedback(req, res);
});

router.get('/viewAll', verifyTokenAndAdmin, permissions, async (req, res) => {
  await viewAllFeedBacks(req, res);
});

router.get('/form', verifyToken, async (req, res) => {
  await viewFeedbackForm(req, res);
});

router.get('/analytics', verifyTokenAndAdmin, permissions, async (req, res) => {
  await feedbackAnalytics(req, res);
});

router.get('/feedback/:id', verifyToken, async (req, res) => {
  await getFeedbackById(req, res);
});

router.delete(
  '/feedback/:id',
  verifyTokenAndAdmin,
  permissions,
  async (req, res) => {
    await deleteFeedbackById(req, res);
  },
);
export default router;
