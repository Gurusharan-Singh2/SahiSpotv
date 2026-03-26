import db from "../config/db.js";

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
export async function addReview(userId, locationId, data) {
  const { rating, comment } = data;

  // Only allow one review per user per location
  const existing = await db("reviews").where({ user_id: userId, location_id: locationId }).first();
  if (existing) throw { statusCode: 409, message: "You have already reviewed this location" };

  const [id] = await db("reviews").insert({
    user_id: userId,
    location_id: locationId,
    rating: parseInt(rating),
    comment: comment || null,
  });

  return db("reviews").where({ id }).first();
}

// ─── GET REVIEWS BY LOCATION ──────────────────────────────────────────────────
export async function getReviewsByLocation(locationId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const rows = await db("reviews as r")
    .where("r.location_id", locationId)
    .join("users as u", "u.id", "r.user_id")
    .select("r.*", "u.name as user_name", "u.image as user_image")
    .orderBy("r.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db("reviews").where({ location_id: locationId }).count("id as total");
  const [{ avg }] = await db("reviews")
    .where({ location_id: locationId })
    .avg("rating as avg");

  return {
    reviews: rows,
    total,
    avg_rating: avg ? parseFloat(Number(avg).toFixed(2)) : null,
  };
}

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
export async function deleteReview(reviewId, userId) {
  const review = await db("reviews").where({ id: reviewId }).first();
  if (!review) throw { statusCode: 404, message: "Review not found" };
  if (review.user_id !== userId) throw { statusCode: 403, message: "Forbidden" };
  return db("reviews").where({ id: reviewId }).delete();
}
