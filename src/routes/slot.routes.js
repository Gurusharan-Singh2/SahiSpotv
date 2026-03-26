import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import * as slotController from "../controllers/slot.controller.js";

const router = Router({ mergeParams: true }); // mergeParams for :locationId

// Public
router.get("/", slotController.getSlots);

// Owner only
router.post("/", authMiddleware, allowRoles("owner", "admin", "super_admin"), slotController.createSlot);
router.post("/bulk", authMiddleware, allowRoles("owner", "admin", "super_admin"), slotController.createBulkSlots);
router.put("/:slotId", authMiddleware, allowRoles("owner", "admin", "super_admin"), slotController.updateSlot);
router.delete("/:slotId", authMiddleware, allowRoles("owner", "admin", "super_admin"), slotController.deleteSlot);

export default router;
