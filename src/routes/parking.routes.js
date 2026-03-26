import { Router } from "express";
import locationRoutes from "./location.routes.js";
import slotRoutes from "./slot.routes.js";
import bookingRoutes from "./booking.routes.js";
import paymentRoutes from "./payment.routes.js";
import reviewRoutes from "./review.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import imageRoutes from "./image.routes.js";

const router = Router();

router.use("/locations", locationRoutes);

router.use("/locations/:locationId/slots", slotRoutes);
router.use("/locations/:locationId/images", imageRoutes);
router.use("/locations/:locationId/reviews", reviewRoutes);

router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/favorites", favoriteRoutes);

export default router;
