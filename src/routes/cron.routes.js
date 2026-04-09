import { Router } from "express";
import { runCron } from "../controllers/cron.controller.js";

const router = Router();

/**
 * POST /api/v1/cron/run
 * Called every minute by Vercel Cron Jobs.
 * Secured by Authorization: Bearer <CRON_SECRET>
 */
router.post("/run", runCron);

export default router;
