import * as reviewService from "../services/review.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { requireFields, parsePagination } from "../utils/validate.js";

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
export async function addReview(req, res) {
  try {
    const missing = requireFields(req.body, ["rating"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    const rating = parseInt(req.body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return errorResponse(res, "rating must be an integer between 1 and 5", 400);
    }

    const review = await reviewService.addReview(req.user.id, req.params.locationId, req.body);
    return successResponse(res, review, "Review added", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── GET REVIEWS ──────────────────────────────────────────────────────────────
export async function getReviews(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await reviewService.getReviewsByLocation(req.params.locationId, { page, limit });
    return res.status(200).json({
      success: true,
      data: result.reviews,
      avg_rating: result.avg_rating,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
export async function deleteReview(req, res) {
  try {
    await reviewService.deleteReview(req.params.reviewId, req.user.id);
    return successResponse(res, null, "Review deleted");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
