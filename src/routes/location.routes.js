import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import * as locationController from "../controllers/location.controller.js";

const router = Router();

router.get("/nearby", locationController.getNearby);
router.get(
  "/my",
  authMiddleware,
  allowRoles("owner", "admin", "super_admin"),
  locationController.getMyLocations
);
router.get("/", locationController.getAll);
router.get("/search", locationController.search);
router.get("/:id", locationController.getOne);

router.post("/", authMiddleware, allowRoles("owner", "admin", "super_admin"), locationController.create);
router.put("/:id", authMiddleware, allowRoles("owner", "admin", "super_admin"), locationController.update);
router.delete("/:id", authMiddleware, allowRoles("owner", "admin", "super_admin"), locationController.remove);

export default router;
