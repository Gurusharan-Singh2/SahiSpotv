import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as paymentController from "../controllers/payment.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.get("/my", paymentController.myPayments);
router.get("/booking/:bookingId", paymentController.getPaymentByBooking);

export default router;
