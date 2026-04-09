import db from "../config/db.js";
import { sendEmail } from "../utils/Email.js";
import { generateParkingReminderTemplate } from "../utils/TemplateGenerator.js";
import { checkAndApplyOverstay } from "./overstay.service.js";

/**
 * Formats a Date to human-readable string (IST)
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Core cycle function — runs reminders + overstay checks.
 *
 * This is exported so it can be called:
 *  - By the Vercel Cron HTTP endpoint (production)
 *  - By setInterval locally (development)
 */
export async function runSchedulerCycle() {
  const now = new Date();
  const stats = { reminders30: 0, reminders10: 0, overstays: 0 };

  // ── 30-minute reminder window: booking ends in 20–40 min ──────────────────
  const window30Start = new Date(now.getTime() + 20 * 60 * 1000);
  const window30End   = new Date(now.getTime() + 40 * 60 * 1000);

  const remind30 = await db("bookings as b")
    .join("users as u", "u.id", "b.user_id")
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .where("b.status", "booked")
    .where("b.reminder_30_sent", 0)
    .whereBetween("b.end_time", [window30Start, window30End])
    .select(
      "b.id",
      "b.end_time",
      "pl.name as location_name",
      "u.email as user_email",
      "u.name as user_name"
    );

  for (const booking of remind30) {
    const minutesLeft = Math.round(
      (new Date(booking.end_time).getTime() - now.getTime()) / 60_000
    );

    if (booking.user_email) {
      const html = generateParkingReminderTemplate(
        booking.user_name || "Valued Customer",
        booking.location_name,
        formatDateTime(booking.end_time),
        minutesLeft
      );

      await sendEmail({
        email: booking.user_email,
        subject: `⏰ Your parking ends in ~30 minutes — ${booking.location_name}`,
        message: html,
      });
    }

    await db("bookings").where({ id: booking.id }).update({ reminder_30_sent: 1 });
    console.log(`[Scheduler] 30-min reminder sent for booking #${booking.id}`);
    stats.reminders30++;
  }

  // ── 10-minute reminder window: booking ends in 5–15 min ───────────────────
  const window10Start = new Date(now.getTime() + 5  * 60 * 1000);
  const window10End   = new Date(now.getTime() + 15 * 60 * 1000);

  const remind10 = await db("bookings as b")
    .join("users as u", "u.id", "b.user_id")
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .where("b.status", "booked")
    .where("b.reminder_10_sent", 0)
    .whereBetween("b.end_time", [window10Start, window10End])
    .select(
      "b.id",
      "b.end_time",
      "pl.name as location_name",
      "u.email as user_email",
      "u.name as user_name"
    );

  for (const booking of remind10) {
    const minutesLeft = Math.round(
      (new Date(booking.end_time).getTime() - now.getTime()) / 60_000
    );

    if (booking.user_email) {
      const html = generateParkingReminderTemplate(
        booking.user_name || "Valued Customer",
        booking.location_name,
        formatDateTime(booking.end_time),
        minutesLeft
      );

      await sendEmail({
        email: booking.user_email,
        subject: `🚨 Only ${minutesLeft} mins left! Extend now — ${booking.location_name}`,
        message: html,
      });
    }

    await db("bookings").where({ id: booking.id }).update({ reminder_10_sent: 1 });
    console.log(`[Scheduler] 10-min reminder sent for booking #${booking.id}`);
    stats.reminders10++;
  }

  // ── Overstay check & penalty application ─────────────────────────────────
  stats.overstays = await checkAndApplyOverstay();
  if (stats.overstays > 0) {
    console.log(`[Scheduler] Applied overstay charges to ${stats.overstays} booking(s)`);
  }

  return stats;
}

/**
 * Start a local development scheduler using setInterval.
 * Only call this outside Vercel (i.e., NODE_ENV !== 'production').
 */
export function startReminderScheduler() {
  if (process.env.VERCEL) {
    // On Vercel, do NOT use setInterval — use Vercel Cron instead.
    console.log("[Scheduler] Running on Vercel — using Cron Job endpoint instead of setInterval ✅");
    return;
  }

  console.log("[Scheduler] Local dev mode — starting setInterval scheduler every 60s ✅");
  runSchedulerCycle(); // run once immediately
  setInterval(runSchedulerCycle, 60_000);
}
