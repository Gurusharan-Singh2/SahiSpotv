import multer from "multer";

import { isValidImageType } from "../../libs/s3.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    const ok = file?.mimetype && isValidImageType(file.mimetype);
    if (!ok) {
      return cb(new Error("Invalid image type"));
    }
    return cb(null, true);
  },
});

