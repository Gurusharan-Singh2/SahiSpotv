import * as slotService from "../services/slot.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { requireFields } from "../utils/validate.js";

const VALID_TYPES = ["car", "bike", "ev"];

// ─── CREATE SINGLE SLOT ───────────────────────────────────────────────────────
export async function createSlot(req, res) {
  try {
    const missing = requireFields(req.body, ["slot_number", "type"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);
    if (!VALID_TYPES.includes(req.body.type)) {
      return errorResponse(res, `type must be one of: ${VALID_TYPES.join(", ")}`, 400);
    }

    const slot = await slotService.createSlot(req.params.locationId, req.body);
    return successResponse(res, slot, "Slot created", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── CREATE BULK SLOTS ────────────────────────────────────────────────────────
export async function createBulkSlots(req, res) {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return errorResponse(res, "slots must be a non-empty array", 400);
    }
    for (const s of slots) {
      if (!s.slot_number || !s.type) return errorResponse(res, "Each slot needs slot_number and type", 400);
      if (!VALID_TYPES.includes(s.type)) return errorResponse(res, `Invalid type '${s.type}'`, 400);
    }

    await slotService.createBulkSlots(req.params.locationId, slots);
    return successResponse(res, null, `${slots.length} slots created`, 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── GET SLOTS ────────────────────────────────────────────────────────────────
export async function getSlots(req, res) {
  try {
    const { type } = req.query;
    const slots = await slotService.getSlotsByLocation(req.params.locationId, type);
    return successResponse(res, slots);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── UPDATE SLOT ──────────────────────────────────────────────────────────────
export async function updateSlot(req, res) {
  try {
    if (req.body.type && !VALID_TYPES.includes(req.body.type)) {
      return errorResponse(res, `type must be one of: ${VALID_TYPES.join(", ")}`, 400);
    }
    const slot = await slotService.updateSlot(req.params.slotId, req.body);
    return successResponse(res, slot, "Slot updated");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

// ─── DELETE SLOT ──────────────────────────────────────────────────────────────
export async function deleteSlot(req, res) {
  try {
    await slotService.deleteSlot(req.params.slotId);
    return successResponse(res, null, "Slot deleted");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
