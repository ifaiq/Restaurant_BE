import { Router } from 'express';
import { uploadFile } from '../controllers/uploadFile.controller';
import { verifyTokenAndOwner } from '../middlewares/verification';

const router = Router();

router.post('/upload-file', verifyTokenAndOwner, async (req, res) => {
  await uploadFile(req, res);
});

export default router;
