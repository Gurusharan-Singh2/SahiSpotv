import * as paymentService from "../services/payment.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { requireFields, parsePagination } from "../utils/validate.js";

export async function createOrder(req, res) {
  try {
    const missing = requireFields(req.body, ["booking_id"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    const orderData = await paymentService.createRazorpayOrder(req.user.id, req.body);
    return successResponse(res, orderData, "Razorpay order created", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function verifyPayment(req, res) {
  try {
    const missing = requireFields(req.body, ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "booking_id"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    const payment = await paymentService.verifyRazorpayPayment(req.user.id, req.body);
    return successResponse(res, payment, "Payment verified successfully", 200);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function failPayment(req, res) {
  try {
    const missing = requireFields(req.body, ["booking_id"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    const payment = await paymentService.markPaymentFailed(req.user.id, req.body);
    return successResponse(res, payment, "Payment marked as failed and slot restored", 200);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function getPaymentByBooking(req, res) {
  try {
    const payment = await paymentService.getPaymentByBooking(req.params.bookingId);
    if (!payment) return errorResponse(res, "Payment not found", 404);
    return successResponse(res, payment);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function myPayments(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { payments, total } = await paymentService.getUserPayments(req.user.id, { page, limit });
    return paginatedResponse(res, payments, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
