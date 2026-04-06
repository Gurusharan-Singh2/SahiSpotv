import express from "express";
import {
  adminLogin,
  adminLogout,
  createAdminByAdmin,
  getAllAdmins,
  deleteAdmin,
  createAdmin,
  getAllUser,
  editAdmin,
  getPendingParkingLocations,
  approveParking,
  rejectParking,
} from "../controllers/admin.controller.js";
import { adminAuth, superAdminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

router.post("/create-api", createAdmin);
router.post("/create", superAdminAuth, createAdminByAdmin);
router.get("/list", adminAuth, getAllAdmins);
router.delete("/:adminId", superAdminAuth, deleteAdmin);
router.put("/:adminId", superAdminAuth, editAdmin)
router.get("/allUser", adminAuth, getAllUser)
router.get("/parking/pending", adminAuth, getPendingParkingLocations);
router.patch("/parking/:locationId/approve", adminAuth, approveParking);
router.patch("/parking/:locationId/reject", adminAuth, rejectParking);
export default router;
