import express from 'express'
import { editProfile, forgotPasswordSendOtp,  loginWithPassword, registerUser, resendForgotPasswordOtp, resendSignupOtp, resetPassword, signupVerifyOtp, verifyForgotPasswordOtp } from '../controllers/user.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';


const router=express.Router();

router.post('/signup',registerUser);
router.post('/resend-otp',resendSignupOtp);
router.post('/verify-otp',upload.single("img"),signupVerifyOtp);
router.post('/login',loginWithPassword);
router.put("/profile/edit", authMiddleware, upload.single("img"), editProfile);

router.post("/forgot-password", forgotPasswordSendOtp);
router.post("/forgot-password/resend", resendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetPassword);
// router.get("/profile",authMiddleware,getUserProfile);






export default router;