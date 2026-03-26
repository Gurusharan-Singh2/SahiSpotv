import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import * as bookingController from "../controllers/booking.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", allowRoles("user", "admin", "super_admin"), bookingController.createBooking);
router.get("/my", bookingController.myBookings);
router.get("/:id", bookingController.getBooking);

router.patch("/:id/cancel", bookingController.cancelBooking);

router.patch("/:id/complete", allowRoles("admin", "super_admin", "owner"), bookingController.completeBooking);

export default router;
