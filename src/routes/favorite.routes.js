import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as favoriteController from "../controllers/favorite.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/", favoriteController.myFavorites);
router.post("/:locationId", favoriteController.toggleFavorite);

export default router;
