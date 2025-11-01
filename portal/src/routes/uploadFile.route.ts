import { Router } from 'express';
import { uploadFile } from '../controllers/uploadFile.controller';
import { verifyTokenAndEdit } from '../middlewares/verification';

const router = Router();

router.post('/upload-file', verifyTokenAndEdit, async (req, res) => {
  await uploadFile(req, res);
});

export default router;
