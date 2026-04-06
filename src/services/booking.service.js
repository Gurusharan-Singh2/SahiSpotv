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
  const { location_id, slot_type_id, start_time, end_time, duration_type, total_hours } = data;

  return await db.transaction(async (trx) => {
    // 1. Fetch available_slots using `.forUpdate()` to enforce row-level safety during concurrency 
    const slotType = await trx("parking_slot_types")
      .where({ id: slot_type_id, location_id })
      .first()
      .forUpdate(); 

    if (!slotType) throw { statusCode: 404, message: "Slot type not found for this location" };
    if (slotType.available_slots <= 0) throw { statusCode: 400, message: "No available slots for this vehicle type" };

    // 2. Dynamic Pricing calculation
    let total_price = 0;
    if (duration_type === "hour") total_price = slotType.price_per_hour * total_hours;
    else if (duration_type === "day") total_price = slotType.price_per_day;
    else if (duration_type === "month") total_price = slotType.price_per_month;
    
    const platform_fee = parseFloat((total_price * 0.10).toFixed(2));
    const owner_earnings = parseFloat((total_price - platform_fee).toFixed(2));

    // 3. Insert specific booking instance
    const [bookingId] = await trx("bookings").insert({
      user_id: userId,
      location_id,
      slot_type_id,
      vehicle_type: slotType.vehicle_type, 
      duration_type,
      total_hours,
      start_time,
      end_time,
      total_price,
      platform_fee,       
      owner_earnings,
      payment_status: "pending", 
      status: "booked"
    });

    // 4. Decrease available slots securely
    await trx("parking_slot_types")
      .where({ id: slot_type_id })
      .decrement("available_slots", 1);

    return trx("bookings").where({ id: bookingId }).first();
  });
}

export async function cancelBooking(bookingId, userId) {
  return await db.transaction(async (trx) => {
    // Lock booking execution to prevent double cancelling
    const booking = await trx("bookings").where({ id: bookingId }).first().forUpdate();
    
    if (!booking) throw { statusCode: 404, message: "Booking not found" };
    if (booking.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
    
    // Idempotency check 
    if (booking.status !== "booked") {
      throw { statusCode: 400, message: `Cannot cancel a booking with status '${booking.status}'` };
    }

    // 1. Update Booking state
    await trx("bookings").where({ id: bookingId }).update({ status: "cancelled" });

    // 2. Safely increase available slots for that type
    await trx("parking_slot_types")
      .where({ id: booking.slot_type_id })
      .increment("available_slots", 1);

    return trx("bookings").where({ id: bookingId }).first();
  });
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
    .join("parking_slot_types as pst", "pst.id", "b.slot_type_id")
    .select(
      "b.*", 
      "pl.name as location_name", 
      "pl.address", 
      "pst.vehicle_type", 
      "pst.price_per_hour",
      "pst.price_per_day",
      "pst.price_per_month"
    )
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
    .join("parking_slot_types as pst", "pst.id", "b.slot_type_id")
    .select(
      "b.*", 
      "pl.name as location_name", 
      "pl.address", 
      "pst.vehicle_type"
    )
    .first();
}
