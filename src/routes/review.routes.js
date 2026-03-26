import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router({ mergeParams: true });

router.get("/", reviewController.getReviews);

router.post("/", authMiddleware, reviewController.addReview);

router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

export default router;
