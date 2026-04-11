import express from "express";
import {
  adminLogin,
  adminLogout,
  getAllUser,
  getPendingParkingLocations,
  approveParking,
  rejectParking,
  getAllBookings,
  getAllParkingLocations,
  suspendUser,
  suspendParkingLocation
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

router.get("/allUser", adminAuth, getAllUser);
router.patch("/users/:userId/suspend", adminAuth, suspendUser);

router.get("/parking/pending", adminAuth, getPendingParkingLocations);
router.get("/parking/all", adminAuth, getAllParkingLocations);
router.patch("/parking/:locationId/approve", adminAuth, approveParking);
router.patch("/parking/:locationId/reject", adminAuth, rejectParking);
router.patch("/parking/:locationId/suspend", adminAuth, suspendParkingLocation);

router.get("/bookings", adminAuth, getAllBookings);

export default router;
