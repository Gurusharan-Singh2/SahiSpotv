import db from "../config/db.js";

const COMMISSION_RATE = 0.10;

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

function calcPricing(pricePerHour, startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
  const total_price = parseFloat((pricePerHour * hours).toFixed(2));
  const commission = parseFloat((total_price * COMMISSION_RATE).toFixed(2));
  const owner_earnings = parseFloat((total_price - commission).toFixed(2));
  return { total_price, commission, owner_earnings, hours };
}

export async function createBooking(userId, data) {
  const { slot_id, location_id, start_time, end_time, price_per_hour = 50 } = data;

  const slot = await db("parking_slots").where({ id: slot_id }).first();
  if (!slot) throw { statusCode: 404, message: "Slot not found" };

  if (slot.location_id !== parseInt(location_id)) {
    throw { statusCode: 400, message: "Slot does not belong to the specified location" };
  }

  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start) || isNaN(end)) throw { statusCode: 400, message: "Invalid date format" };
  if (end <= start) throw { statusCode: 400, message: "end_time must be after start_time" };

  const conflict = await hasOverlappingBooking(slot_id, start_time, end_time);
  if (conflict) throw { statusCode: 409, message: "Slot is already booked for this time period" };

  const { total_price, commission, owner_earnings } = calcPricing(price_per_hour, start_time, end_time);

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

export async function cancelBooking(bookingId, userId) {
  const booking = await db("bookings").where({ id: bookingId }).first();
  if (!booking) throw { statusCode: 404, message: "Booking not found" };

  if (booking.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
  if (booking.status !== "booked") {
    throw { statusCode: 400, message: `Cannot cancel a booking with status '${booking.status}'` };
  }

  await db("bookings").where({ id: bookingId }).update({ status: "cancelled" });
  return db("bookings").where({ id: bookingId }).first();
}

export async function completeBooking(bookingId) {
  const booking = await db("bookings").where({ id: bookingId }).first();
  if (!booking) throw { statusCode: 404, message: "Booking not found" };
  if (booking.status !== "booked") {
    throw { statusCode: 400, message: "Only active bookings can be completed" };
  }

  await db("bookings").where({ id: bookingId }).update({ status: "completed" });
  return db("bookings").where({ id: bookingId }).first();
}

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

export async function getBookingById(bookingId) {
  return db("bookings as b")
    .where("b.id", bookingId)
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .join("parking_slots as ps", "ps.id", "b.slot_id")
    .select("b.*", "pl.name as location_name", "pl.address", "ps.slot_number", "ps.type as slot_type")
    .first();
}
