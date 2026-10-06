import express from 'express';
import { registerUser, loginUser, googleLogin, getMe, getFarmers, switchRole } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/switch-role', protect, switchRole);
router.get('/me', protect, getMe);
router.get('/farmers', getFarmers);

export default router;
