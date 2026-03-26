import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import multer from "multer";
import * as imageController from "../controllers/image.controller.js";

// Use memory storage so buffer is available for Cloudinary streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid image type"));
    }
    cb(null, true);
  },
});

const router = Router({ mergeParams: true });

// Public: get images for a location
router.get("/", imageController.getImages);

// Owner: upload image
router.post(
  "/",
  authMiddleware,
  allowRoles("owner", "admin", "super_admin"),
  upload.single("image"),
  imageController.uploadImage
);

// Owner: delete image
router.delete(
  "/:imageId",
  authMiddleware,
  allowRoles("owner", "admin", "super_admin"),
  imageController.deleteImage
);

export default router;
