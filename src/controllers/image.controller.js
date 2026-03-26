import * as imageService from "../services/image.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────
export async function uploadImage(req, res) {
  try {
    if (!req.file) return errorResponse(res, "No image file provided", 400);

    const image = await imageService.uploadParkingImage(req.params.locationId, req.file.buffer);
    return successResponse(res, image, "Image uploaded", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── GET IMAGES ───────────────────────────────────────────────────────────────
export async function getImages(req, res) {
  try {
    const images = await imageService.getImagesByLocation(req.params.locationId);
    return successResponse(res, images);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── DELETE IMAGE ─────────────────────────────────────────────────────────────
export async function deleteImage(req, res) {
  try {
    const result = await imageService.deleteParkingImage(req.params.imageId, req.user.id);
    return successResponse(res, result, "Image deleted");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
