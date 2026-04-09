import { runSchedulerCycle } from "../services/reminder.scheduler.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * GET or POST /api/v1/cron/run
 *
 * Called by cron-job.org.
 * No secret required.
 */
export async function runCron(req, res) {
  try {
    const result = await runSchedulerCycle();
    return successResponse(res, result, "Scheduler cycle completed");
  } catch (err) {
    console.error("[Cron] Error:", err.message);
    return errorResponse(res, err.message || "Cron error", 500);
  }
}
