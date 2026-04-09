import { Router } from "express";
import { runCron } from "../controllers/cron.controller.js";

const router = Router();

/**
 * POST or GET /api/v1/cron/run
 * For cron-job.org: Use a GET request with ?secret=YOUR_CRON_SECRET
 * For Vercel Cron: Vercel sends POST with Authorization: Bearer <CRON_SECRET>
 */
router.post("/run", runCron);
router.get("/run", runCron);

export default router;
