import { Router } from 'express';
import {
  getAllSupportTickets,
  getSupportTicket,
  createSupportTicket,
  getRatingReport,
  createRating,
  getRating,
  getAllRatings,
  unanswered_queries,
} from '../controllers/userSupport.controller';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verification';
// import { permissions } from '../middlewares/permission';
const router = Router();

router.get('/getAllTickets', verifyTokenAndAdmin, async (req, res) => {
  await getAllSupportTickets(req, res);
});

router.post('/create', verifyToken, async (req, res) => {
  await createSupportTicket(req, res);
});

router.get('/support/:id', verifyTokenAndAdmin, async (req, res) => {
  await getSupportTicket(req, res);
});

router.get('/rating', verifyTokenAndAdmin, async (req, res) => {
  await getRatingReport(req, res);
});

router.get('/ratingById/:id', verifyTokenAndAdmin, async (req, res) => {
  await getRating(req, res);
});

router.get('/getAllRatings', verifyTokenAndAdmin, async (req, res) => {
  await getAllRatings(req, res);
});

router.post('/rating', verifyToken, async (req, res) => {
  await createRating(req, res);
});

router.get('/unanswerd', verifyToken, async (req, res) => {
  await unanswered_queries(req, res);
});
export default router;
