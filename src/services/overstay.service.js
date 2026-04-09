import db from "../config/db.js";
import { sendEmail } from "../utils/Email.js";
import { generateOverstayAlertTemplate } from "../utils/TemplateGenerator.js";

const GRACE_PERIOD_MINUTES = 15;
const OVERSTAY_MULTIPLIER = 2; // 2× the hourly rate

/**
 * Formats a Date to a human-readable string (IST-friendly)
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Main function: scan all active bookings for overstays and apply charges.
 * Called every 60 seconds by the reminder scheduler.
 */
export async function checkAndApplyOverstay() {
  const now = new Date();

  // Fetch all booked sessions whose end_time has passed (grace period already elapsed)
  const graceCutoff = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60 * 1000);

  const overstayedBookings = await db("bookings as b")
    .join("parking_slot_types as pst", "pst.id", "b.slot_type_id")
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .join("users as u", "u.id", "b.user_id")
    .where("b.status", "booked")
    .where("b.end_time", "<=", graceCutoff)
    .select(
      "b.id",
      "b.end_time",
      "b.overstay_started_at",
      "b.overstay_charge",
      "b.total_price",
      "b.owner_earnings",
      "b.platform_fee",
      "b.overstay_notified",
      "pst.price_per_hour",
      "pl.name as location_name",
      "u.email as user_email",
      "u.name as user_name"
    );

  for (const booking of overstayedBookings) {
    const graceEndTime = new Date(
      new Date(booking.end_time).getTime() + GRACE_PERIOD_MINUTES * 60 * 1000
    );

    // Calculate overstay duration in hours (rounded up, minimum 1h billing unit)
    const overstayMs = now.getTime() - graceEndTime.getTime();
    const overstayHours = Math.ceil(overstayMs / (1000 * 60 * 60));

    const pricePerHour = parseFloat(booking.price_per_hour || 0);
    const overstayRatePerHour = parseFloat((pricePerHour * OVERSTAY_MULTIPLIER).toFixed(2));
    const newOverstayCharge = parseFloat((overstayRatePerHour * overstayHours).toFixed(2));

    // Recalculate total (original total_price minus previous overstay + new overstay)
    const previousOverstay = parseFloat(booking.overstay_charge || 0);
    const baseTotal = parseFloat(booking.total_price || 0) - previousOverstay;
    const newTotal = parseFloat((baseTotal + newOverstayCharge).toFixed(2));
    const newPlatformFee = parseFloat((newTotal * 0.10).toFixed(2));
    const newOwnerEarnings = parseFloat((newTotal - newPlatformFee).toFixed(2));

    const updateData = {
      overstay_charge: newOverstayCharge,
      total_price: newTotal,
      platform_fee: newPlatformFee,
      owner_earnings: newOwnerEarnings,
    };

    // Mark overstay start time only once
    if (!booking.overstay_started_at) {
      updateData.overstay_started_at = graceEndTime;
    }

    await db("bookings").where({ id: booking.id }).update(updateData);

    // Send overstay email only once (first time overstay is detected)
    if (!booking.overstay_notified && booking.user_email) {
      const html = generateOverstayAlertTemplate(
        booking.user_name || "Valued Customer",
        booking.location_name,
        newOverstayCharge.toFixed(2),
        formatDateTime(graceEndTime)
      );

      await sendEmail({
        email: booking.user_email,
        subject: "⚠️ Overstay Penalty Started — SahiSpot",
        message: html,
      });

      await db("bookings").where({ id: booking.id }).update({ overstay_notified: 1 });
    }
  }

  return overstayedBookings.length;
}
