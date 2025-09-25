import { Router } from 'express';
import { uploadFile } from '../controllers/uploadFile.controller';
import { verifyTokenAndAdmin } from '../middlewares/verification';

const router = Router();

router.post('/upload-file', verifyTokenAndAdmin, async (req, res) => {
  await uploadFile(req, res);
});

export default router;
