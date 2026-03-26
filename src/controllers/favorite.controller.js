import * as favoriteService from "../services/favorite.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { parsePagination } from "../utils/validate.js";

export async function toggleFavorite(req, res) {
  try {
    const result = await favoriteService.toggleFavorite(req.user.id, req.params.locationId);
    return successResponse(res, result, result.action === "added" ? "Added to favorites" : "Removed from favorites");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}

export async function myFavorites(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { favorites, total } = await favoriteService.getUserFavorites(req.user.id, { page, limit });
    return paginatedResponse(res, favorites, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", err?.statusCode || 500);
  }
}
