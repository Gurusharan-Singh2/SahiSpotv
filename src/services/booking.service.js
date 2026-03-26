import db from "../config/db.js";

const COMMISSION_RATE = 0.10; // 10%

/**
 * Check if a slot has any overlapping bookings.
 * A conflict exists when: new_start < existing_end AND new_end > existing_start
 */
async function hasOverlappingBooking(slotId, startTime, endTime, excludeBookingId = null) {
  let query = db("bookings")
    .where("slot_id", slotId)
    .whereIn("status", ["booked", "completed"])
    .where(function () {
      this.where("start_time", "<", endTime).where("end_time", ">", startTime);
    });

  if (excludeBookingId) query = query.whereNot("id", excludeBookingId);

  const conflict = await query.first();
  return !!conflict;
}

/**
 * Calculate pricing breakdown
 */
function calcPricing(pricePerHour, startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(1, (end - start) / (1000 * 60 * 60)); // minimum 1 hour
  const total_price = parseFloat((pricePerHour * hours).toFixed(2));
  const commission = parseFloat((total_price * COMMISSION_RATE).toFixed(2));
  const owner_earnings = parseFloat((total_price - commission).toFixed(2));
  return { total_price, commission, owner_earnings, hours };
}

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
export async function createBooking(userId, data) {
  const { slot_id, location_id, start_time, end_time, price_per_hour = 50 } = data;

  // 1. Check slot exists
  const slot = await db("parking_slots").where({ id: slot_id }).first();
  if (!slot) throw { statusCode: 404, message: "Slot not found" };

  // 2. Check slot belongs to location
  if (slot.location_id !== parseInt(location_id)) {
    throw { statusCode: 400, message: "Slot does not belong to the specified location" };
  }

  // 3. Validate time
  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start) || isNaN(end)) throw { statusCode: 400, message: "Invalid date format" };
  if (end <= start) throw { statusCode: 400, message: "end_time must be after start_time" };

  // 4. Check for overlapping bookings (real-time conflict detection)
  const conflict = await hasOverlappingBooking(slot_id, start_time, end_time);
  if (conflict) throw { statusCode: 409, message: "Slot is already booked for this time period" };

  // 5. Calculate pricing
  const { total_price, commission, owner_earnings } = calcPricing(price_per_hour, start_time, end_time);

  // 6. Create booking
  const [id] = await db("bookings").insert({
    user_id: userId,
    location_id,
    slot_id,
    start_time,
    end_time,
    total_price,
    commission,
    owner_earnings,
    status: "booked",
  });

  return db("bookings").where({ id }).first();
}

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
export async function cancelBooking(bookingId, userId) {
  const booking = await db("bookings").where({ id: bookingId }).first();
  if (!booking) throw { statusCode: 404, message: "Booking not found" };

  // Only the booking owner or an admin can cancel
  if (booking.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
  if (booking.status !== "booked") {
    throw { statusCode: 400, message: `Cannot cancel a booking with status '${booking.status}'` };
  }

  await db("bookings").where({ id: bookingId }).update({ status: "cancelled" });
  return db("bookings").where({ id: bookingId }).first();
}

// ─── COMPLETE BOOKING ─────────────────────────────────────────────────────────
export async function completeBooking(bookingId) {
  const booking = await db("bookings").where({ id: bookingId }).first();
  if (!booking) throw { statusCode: 404, message: "Booking not found" };
  if (booking.status !== "booked") {
    throw { statusCode: 400, message: "Only active bookings can be completed" };
  }

  await db("bookings").where({ id: bookingId }).update({ status: "completed" });
  return db("bookings").where({ id: bookingId }).first();
}

// ─── GET USER BOOKINGS ────────────────────────────────────────────────────────
export async function getUserBookings(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const rows = await db("bookings as b")
    .where("b.user_id", userId)
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .join("parking_slots as ps", "ps.id", "b.slot_id")
    .select("b.*", "pl.name as location_name", "pl.address", "ps.slot_number", "ps.type as slot_type")
    .orderBy("b.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db("bookings").where({ user_id: userId }).count("id as total");
  return { bookings: rows, total };
}

// ─── GET BOOKING BY ID ────────────────────────────────────────────────────────
export async function getBookingById(bookingId) {
  return db("bookings as b")
    .where("b.id", bookingId)
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .join("parking_slots as ps", "ps.id", "b.slot_id")
    .select("b.*", "pl.name as location_name", "pl.address", "ps.slot_number", "ps.type as slot_type")
    .first();
}
