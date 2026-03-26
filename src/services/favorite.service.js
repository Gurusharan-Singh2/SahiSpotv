import db from "../config/db.js";

// ─── TOGGLE FAVORITE ──────────────────────────────────────────────────────────
export async function toggleFavorite(userId, locationId) {
  const existing = await db("favorites").where({ user_id: userId, location_id: locationId }).first();

  if (existing) {
    await db("favorites").where({ id: existing.id }).delete();
    return { action: "removed", locationId };
  }

  // Verify location exists
  const location = await db("parking_locations").where({ id: locationId }).first();
  if (!location) throw { statusCode: 404, message: "Location not found" };

  const [id] = await db("favorites").insert({ user_id: userId, location_id: locationId });
  return { action: "added", locationId, id };
}

// ─── GET USER FAVORITES ───────────────────────────────────────────────────────
export async function getUserFavorites(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const rows = await db("favorites as f")
    .where("f.user_id", userId)
    .join("parking_locations as pl", "pl.id", "f.location_id")
    .leftJoin(db.raw("(SELECT location_id, AVG(rating) as avg_rating FROM reviews GROUP BY location_id) as rev_agg ON rev_agg.location_id = pl.id"))
    .select("f.id as favorite_id", "pl.*", "rev_agg.avg_rating")
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db("favorites").where({ user_id: userId }).count("id as total");
  return { favorites: rows, total };
}
