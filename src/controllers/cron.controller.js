import { runSchedulerCycle } from "../services/reminder.scheduler.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * POST /api/v1/cron/run
 *
 * Called by Vercel Cron every minute.
 * Protected by the Authorization header bearing CRON_SECRET.
 */
export async function runCron(req, res) {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s*/i, "").trim();

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await runSchedulerCycle();
    return successResponse(res, result, "Scheduler cycle completed");
  } catch (err) {
    console.error("[Cron] Error:", err.message);
    return errorResponse(res, err.message || "Cron error", 500);
  }
}
