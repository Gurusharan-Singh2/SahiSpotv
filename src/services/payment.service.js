import db from "../config/db.js";
import razorpayInstance from "../libs/razorpay.js";
import crypto from "crypto";

export async function createRazorpayOrder(userId, data) {
  const { booking_id } = data;

  return db.transaction(async (trx) => {
    const booking = await trx("bookings").where({ id: booking_id }).first();
    if (!booking) throw { statusCode: 404, message: "Booking not found" };
    if (booking.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
    if (booking.status !== "booked") {
      throw { statusCode: 400, message: `Cannot pay for a booking with status '${booking.status}'` };
    }

    const baseAmount = parseFloat(booking.total_price || 0);
    const platformFee = parseFloat(booking.platform_fee || 0);

    const amount = baseAmount + platformFee;
    const platform_fee = parseFloat(booking.platform_fee);
    const owner_amount = parseFloat(booking.owner_earnings);

    let existingPending = await trx("payments")
      .where({ booking_id, payment_status: "pending" })
      .first();

    let dbPaymentId;

    if (existingPending) {
      dbPaymentId = existingPending.id;
    } else {
      const [paymentId] = await trx("payments").insert({
        booking_id,
        user_id: userId,
        amount,
        platform_fee,
        owner_amount,
        payment_status: "pending",
        payment_method: "razorpay",
      });
      dbPaymentId = paymentId;
    }

    if (!razorpayInstance) {
      throw { statusCode: 500, message: "Razorpay is not configured on the server" };
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_booking_${booking_id}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,           // in paise (e.g. 2000)
      amountRs: razorpayOrder.amount / 100,   // in rupees (e.g. 20) — for display
      currency: razorpayOrder.currency,
      razorpay_key: process.env.RAZORPAY_KEY_ID,  // send key to frontend
      dbPaymentId
    };
  });
}

export async function verifyRazorpayPayment(userId, data) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = data;

  const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw { statusCode: 400, message: "Invalid payment signature" };
  }

  return db.transaction(async (trx) => {
    const payment = await trx("payments")
      .where({ booking_id, user_id: userId, payment_status: "pending" })
      .first();

    if (!payment) {
      throw { statusCode: 404, message: "Pending payment not found for this booking" };
    }

    await trx("payments").where({ id: payment.id }).update({
      payment_status: "paid",
      transaction_id: razorpay_payment_id
    });

    await trx("bookings").where({ id: booking_id }).update({ status: "completed" });

    await trx("platform_earnings").insert({
      booking_id,
      amount: payment.platform_fee,
    });

    return await trx("payments").where({ id: payment.id }).first();
  });
}

export async function getPaymentByBooking(bookingId) {
  return db("payments").where({ booking_id: bookingId }).first();
}

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
