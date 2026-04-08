import express from "express";
import {
  adminLogin,
  adminLogout,
  getAllUser,
  getPendingParkingLocations,
  approveParking,
  rejectParking,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

router.get("/allUser", adminAuth, getAllUser);
router.get("/parking/pending", adminAuth, getPendingParkingLocations);
router.patch("/parking/:locationId/approve", adminAuth, approveParking);
router.patch("/parking/:locationId/reject", adminAuth, rejectParking);

export default router;
