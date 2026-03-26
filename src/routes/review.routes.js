import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router({ mergeParams: true });

// Public: get reviews
router.get("/", reviewController.getReviews);

// Authenticated: add review
router.post("/", authMiddleware, reviewController.addReview);

// Authenticated: delete own review
router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

export default router;
