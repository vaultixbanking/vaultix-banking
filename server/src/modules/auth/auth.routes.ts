import { Router } from 'express';
import { signup, login, verifyPin, verifyEmail, resendVerification } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

// POST /api/auth/signup
router.post('/signup', upload.single('photoID'), signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/verify-pin  (protected)
router.post('/verify-pin', authenticate, verifyPin);

// GET /api/auth/verify-email/:token  (public — link from email)
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/resend-verification  (public — resend verification email)
router.post('/resend-verification', resendVerification);

export default router;