import { Router, Request, Response } from 'express';
import { sseService } from '../services/sse.service';
const router = Router();

router.get('/events/published', (req: Request, res: Response) => {
  const clientId = req.ip + ':' + Date.now();
  sseService.addClient(clientId, res);
});

export default router;
