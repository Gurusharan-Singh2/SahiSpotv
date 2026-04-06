import * as bookingService from "../services/booking.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { requireFields, parsePagination } from "../utils/validate.js";

export async function createBooking(req, res) {
  try {
    const missing = requireFields(req.body, ["location_id", "slot_type_id", "start_time", "end_time", "duration_type", "total_hours"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    const validDurations = ["hour", "day", "month"];
    if (!validDurations.includes(req.body.duration_type)) {
      return errorResponse(res, "duration_type must be hour, day, or month", 400);
    }

    const booking = await bookingService.createBooking(req.user.id, req.body);
    return successResponse(res, booking, "Booking created", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function cancelBooking(req, res) {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
    return successResponse(res, booking, "Booking cancelled");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function completeBooking(req, res) {
  try {
    const booking = await bookingService.completeBooking(req.params.id);
    return successResponse(res, booking, "Booking completed");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function myBookings(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { bookings, total } = await bookingService.getUserBookings(req.user.id, { page, limit });
    return paginatedResponse(res, bookings, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function getBooking(req, res) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.user_id !== req.user.id && !["admin", "super_admin"].includes(req.user.role)) {
      return errorResponse(res, "Forbidden", 403);
    }
    return successResponse(res, booking);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
