import { Router } from 'express';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getAllTicketsSuperAdmin,
  getTicket,
  updateTicket,
} from '../controllers/ticket.controller';
import {
  verifyTokenAndAdmin,
  verifyTokenAndSuperAdmin,
} from '../middlewares/verification';
// import { permissions } from '../middlewares/permission';
const router = Router();

router.get('/getAllTickets', verifyTokenAndAdmin, async (req, res) => {
  await getAllTickets(req, res);
});

router.get('/getTicketsAdmin', verifyTokenAndSuperAdmin, async (req, res) => {
  await getAllTicketsSuperAdmin(req, res);
});

router.post('/create', verifyTokenAndAdmin, async (req, res) => {
  await createTicket(req, res);
});

router.put('/update/:id', verifyTokenAndAdmin, async (req, res) => {
  await updateTicket(req, res);
});

router.get('/getTicket/:id', verifyTokenAndAdmin, async (req, res) => {
  await getTicket(req, res);
});

router.delete('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
  await deleteTicket(req, res);
});

export default router;
