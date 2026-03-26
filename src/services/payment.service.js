import db from "../config/db.js";

// ─── CREATE PAYMENT ───────────────────────────────────────────────────────────
export async function createPayment(userId, data) {
  const { booking_id, payment_method = "online", transaction_id = null } = data;

  // Fetch booking in a transaction
  return db.transaction(async (trx) => {
    const booking = await trx("bookings").where({ id: booking_id }).first();
    if (!booking) throw { statusCode: 404, message: "Booking not found" };
    if (booking.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
    if (booking.status !== "booked") {
      throw { statusCode: 400, message: `Cannot pay for a booking with status '${booking.status}'` };
    }

    const amount = parseFloat(booking.total_price);
    const platform_fee = parseFloat(booking.commission);
    const owner_amount = parseFloat(booking.owner_earnings);

    // Existing incomplete payment guard
    const existingPending = await trx("payments")
      .where({ booking_id, payment_status: "pending" })
      .first();
    if (existingPending) {
      throw { statusCode: 409, message: "A pending payment already exists for this booking" };
    }

    // Insert payment record
    const [paymentId] = await trx("payments").insert({
      booking_id,
      user_id: userId,
      amount,
      platform_fee,
      owner_amount,
      payment_status: "paid",
      payment_method,
      transaction_id,
    });

    // Update booking status to completed
    await trx("bookings").where({ id: booking_id }).update({ status: "completed" });

    // Insert into platform_earnings
    await trx("platform_earnings").insert({
      booking_id,
      amount: platform_fee,
    });

    const payment = await trx("payments").where({ id: paymentId }).first();
    return payment;
  });
}

// ─── GET PAYMENT BY BOOKING ───────────────────────────────────────────────────
export async function getPaymentByBooking(bookingId) {
  return db("payments").where({ booking_id: bookingId }).first();
}

// ─── GET USER PAYMENTS ────────────────────────────────────────────────────────
export async function getUserPayments(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const rows = await db("payments as p")
    .where("p.user_id", userId)
    .join("bookings as b", "b.id", "p.booking_id")
    .join("parking_locations as pl", "pl.id", "b.location_id")
    .select("p.*", "b.start_time", "b.end_time", "pl.name as location_name")
    .orderBy("p.id", "desc")
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db("payments").where({ user_id: userId }).count("id as total");
  return { payments: rows, total };
}
