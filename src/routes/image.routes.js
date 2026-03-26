import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import multer from "multer";
import * as imageController from "../controllers/image.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid image type"));
    }
    cb(null, true);
  },
});

const router = Router({ mergeParams: true });

router.get("/", imageController.getImages);

router.post(
  "/",
  authMiddleware,
  allowRoles("owner", "admin", "super_admin"),
  upload.single("image"),
  imageController.uploadImage
);

router.delete(
  "/:imageId",
  authMiddleware,
  allowRoles("owner", "admin", "super_admin"),
  imageController.deleteImage
);

export default router;
