import * as locationService from "../services/location.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { requireFields, isValidLatLng, parsePagination } from "../utils/validate.js";

export async function getNearby(req, res) {
  try {
    const { lat, lng, radius = 10, city, type } = req.query;
    const { page, limit } = parsePagination(req.query);

    if (!lat || !lng) return errorResponse(res, "lat and lng are required", 400);
    if (!isValidLatLng(lat, lng)) return errorResponse(res, "Invalid lat/lng values", 400);

    const { locations, total } = await locationService.getNearbyLocations({
      lat, lng, radius, city, type, page, limit,
    });

    return paginatedResponse(res, locations, total, page, limit, "Nearby parking locations");
  } catch (err) {
    const code = err?.statusCode || 500;
    return errorResponse(res, err.message || "Server error", code);
  }
}

export async function getAll(req, res) {
  try {
    const { city } = req.query;
    const { page, limit } = parsePagination(req.query);
    const { locations, total } = await locationService.getAllLocations({ city, page, limit });
    return paginatedResponse(res, locations, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function getOne(req, res) {
  try {
    const location = await locationService.getLocationById(req.params.id);
    if (!location) return errorResponse(res, "Location not found", 404);
    return successResponse(res, location);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function create(req, res) {
  try {
    const missing = requireFields(req.body, ["name", "address", "city", "state", "latitude", "longitude", "slot_types"]);
    if (missing.length) return errorResponse(res, `Missing fields: ${missing.join(", ")}`, 400);

    if (!Array.isArray(req.body.slot_types) || req.body.slot_types.length === 0) {
      return errorResponse(res, "slot_types must be a non-empty array", 400);
    }

    const validVehicleTypes = ["car", "bike", "truck", "ev"];
    for (const slot of req.body.slot_types) {
      if (!validVehicleTypes.includes(slot.vehicle_type)) {
        return errorResponse(res, `Invalid vehicle_type: ${slot.vehicle_type}`, 400);
      }
    }

    if (!isValidLatLng(req.body.latitude, req.body.longitude)) {
      return errorResponse(res, "Invalid latitude or longitude", 400);
    }

    const location = await locationService.createLocation(req.user.id, req.body);
    return successResponse(res, location, "Location created and pending approval", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function update(req, res) {
  try {
    const updated = await locationService.updateLocation(req.params.id, req.user.id, req.body);
    if (!updated) return errorResponse(res, "Location not found or not authorised", 404);
    return successResponse(res, updated, "Location updated");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function remove(req, res) {
  try {
    const count = await locationService.deleteLocation(req.params.id, req.user.id);
    if (!count) return errorResponse(res, "Location not found or not authorised", 404);
    return successResponse(res, null, "Location deleted");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
