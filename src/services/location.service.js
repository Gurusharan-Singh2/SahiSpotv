import db from "../config/db.js";
import { haversineDistance, getBoundingBox } from "../utils/haversine.js";
import { withCache } from "../utils/cache.js";

const NEARBY_TTL = 60;

// ================== GET NEARBY ==================
export async function getNearbyLocations({
  lat,
  lng,
  radius = 10,
  city,
  type,
  page = 1,
  limit = 20,
}) {
  const cacheKey = `nearby:${lat}:${lng}:${radius}:${city || ""}:${type || ""}:${page}:${limit}`;

  return withCache(cacheKey, async () => {
    const box = getBoundingBox(parseFloat(lat), parseFloat(lng), parseFloat(radius));

    let query = db("parking_locations as pl")
      .where("pl.status", "approved")
      .where("pl.is_active", 1)
      .whereBetween("pl.latitude", [box.minLat, box.maxLat])
      .whereBetween("pl.longitude", [box.minLng, box.maxLng])
      .select(
        "pl.*",

        db.raw("(SELECT AVG(r.rating) FROM reviews r WHERE r.location_id = pl.id) as avg_rating"),

        db.raw(`
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', pst.id,
                'vehicle_type', pst.vehicle_type,
                'total_slots', pst.total_slots,
                'available_slots', pst.available_slots,
                'price_per_hour', pst.price_per_hour,
                'price_per_day', pst.price_per_day,
                'price_per_month', pst.price_per_month
              )
            )
            FROM parking_slot_types pst
            WHERE pst.location_id = pl.id
          ) as slot_types
        `),

        db.raw(`
          (
            SELECT GROUP_CONCAT(DISTINCT pi.image_url)
            FROM parking_images pi
            WHERE pi.location_id = pl.id
          ) as images
        `)
      );

    if (city) query = query.where("pl.city", "like", `%${city}%`);

    if (type) {
      query = query.whereExists(
        db("parking_slot_types")
          .where("location_id", db.ref("pl.id"))
          .where("vehicle_type", type)
      );
    }

    const rows = await query;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const r = parseFloat(radius);

    const filtered = rows
      .map((loc) => ({
        ...loc,
        distance_km: haversineDistance(
          userLat,
          userLng,
          parseFloat(loc.latitude),
          parseFloat(loc.longitude)
        ),
        avg_rating: loc.avg_rating
          ? parseFloat(Number(loc.avg_rating).toFixed(2))
          : null,
        images: loc.images ? loc.images.split(",") : [],
        slot_types: loc.slot_types ? JSON.parse(loc.slot_types) : [],
      }))
      .filter((loc) => loc.distance_km <= r)
      .sort((a, b) => a.distance_km - b.distance_km);

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return { locations: paginated, total };
  }, NEARBY_TTL);
}

// ================== CREATE ==================
export async function createLocation(ownerId, data) {
  return await db.transaction(async (trx) => {
    const [id] = await trx("parking_locations").insert({
      owner_id: ownerId,
      name: data.name,
      description: data.description || null,
      address: data.address,
      city: data.city,
      state: data.state,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      status: "pending",
    });

    const slotTypesData = data.slot_types.map((slot) => ({
      location_id: id,
      vehicle_type: slot.vehicle_type,
      total_slots: slot.total_slots,
      available_slots: slot.total_slots,
      price_per_hour: slot.price_per_hour || 0,
      price_per_day: slot.price_per_day || 0,
      price_per_month: slot.price_per_month || 0,
    }));

    await trx("parking_slot_types").insert(slotTypesData);

    return id;
  }).then((id) => getLocationById(id));
}

// ================== UPDATE ==================
export async function updateLocation(locationId, ownerId, data) {
  const allowed = ["name", "description", "address", "city", "state", "latitude", "longitude"];
  const updates = {};

  allowed.forEach((k) => {
    if (data[k] !== undefined) updates[k] = data[k];
  });

  const count = await db("parking_locations")
    .where({ id: locationId, owner_id: ownerId })
    .update(updates);

  if (!count) return null;

  return getLocationById(locationId);
}

// ================== DELETE ==================
export async function deleteLocation(locationId, ownerId) {
  return db("parking_locations")
    .where({ id: locationId, owner_id: ownerId })
    .delete();
}

// ================== GET ALL ==================
export async function getAllLocations({ city, page = 1, limit = 20 }) {
  let query = db("parking_locations as pl")
    .where("pl.status", "approved")
    .where("pl.is_active", 1)
    .select(
      "pl.*",

      db.raw("(SELECT AVG(r.rating) FROM reviews r WHERE r.location_id = pl.id) as avg_rating"),

      db.raw(`
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pst.id,
              'vehicle_type', pst.vehicle_type,
              'total_slots', pst.total_slots,
              'available_slots', pst.available_slots,
              'price_per_hour', pst.price_per_hour,
              'price_per_day', pst.price_per_day,
              'price_per_month', pst.price_per_month
            )
          )
          FROM parking_slot_types pst
          WHERE pst.location_id = pl.id
        ) as slot_types
      `),

      db.raw(`
        (
          SELECT GROUP_CONCAT(DISTINCT pi.image_url)
          FROM parking_images pi
          WHERE pi.location_id = pl.id
        ) as images
      `)
    );

  if (city) query = query.where("pl.city", "like", `%${city}%`);

  const [{ total }] = await db("parking_locations")
    .where("status", "approved")
    .count("id as total");

  const offset = (page - 1) * limit;
  const rows = await query.limit(limit).offset(offset);

  const parsed = rows.map((loc) => ({
    ...loc,
    images: loc.images ? loc.images.split(",") : [],
    slot_types: loc.slot_types ? JSON.parse(loc.slot_types) : [],
    avg_rating: loc.avg_rating
      ? parseFloat(Number(loc.avg_rating).toFixed(2))
      : null,
  }));

  return { locations: parsed, total };
}

// ================== GET BY ID ==================
export async function getLocationById(id) {
  const location = await db("parking_locations as pl")
    .where("pl.id", id)
    .select(
      "pl.*",

      db.raw("(SELECT AVG(r.rating) FROM reviews r WHERE r.location_id = pl.id) as avg_rating"),

      db.raw(`
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pst.id,
              'vehicle_type', pst.vehicle_type,
              'total_slots', pst.total_slots,
              'available_slots', pst.available_slots,
              'price_per_hour', pst.price_per_hour,
              'price_per_day', pst.price_per_day,
              'price_per_month', pst.price_per_month
            )
          )
          FROM parking_slot_types pst
          WHERE pst.location_id = pl.id
        ) as slot_types
      `),

      db.raw(`
        (
          SELECT GROUP_CONCAT(DISTINCT pi.image_url)
          FROM parking_images pi
          WHERE pi.location_id = pl.id
        ) as images
      `)
    )
    .first();

  if (!location) return null;

  return {
    ...location,
    images: location.images ? location.images.split(",") : [],
    slot_types: location.slot_types ? JSON.parse(location.slot_types) : [],
    avg_rating: location.avg_rating
      ? parseFloat(Number(location.avg_rating).toFixed(2))
      : null,
  };
}

// ================== GET BY OWNER ==================
export async function getLocationsByOwner(ownerId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const query = db("parking_locations as pl")
    .where("pl.owner_id", ownerId)
    .select(
      "pl.*",

      db.raw("(SELECT AVG(r.rating) FROM reviews r WHERE r.location_id = pl.id) as avg_rating"),

      db.raw(`
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pst.id,
              'vehicle_type', pst.vehicle_type,
              'total_slots', pst.total_slots,
              'available_slots', pst.available_slots,
              'price_per_hour', pst.price_per_hour,
              'price_per_day', pst.price_per_day,
              'price_per_month', pst.price_per_month
            )
          )
          FROM parking_slot_types pst
          WHERE pst.location_id = pl.id
        ) as slot_types
      `),

      db.raw(`
        (
          SELECT GROUP_CONCAT(DISTINCT pi.image_url)
          FROM parking_images pi
          WHERE pi.location_id = pl.id
        ) as images
      `)
    );

  const [{ total }] = await db("parking_locations")
    .where("owner_id", ownerId)
    .count("id as total");

  const rows = await query.limit(limit).offset(offset);

  const parsed = rows.map((loc) => ({
    ...loc,
    images: loc.images ? loc.images.split(",") : [],
    slot_types: loc.slot_types ? JSON.parse(loc.slot_types) : [],
    avg_rating: loc.avg_rating
      ? parseFloat(Number(loc.avg_rating).toFixed(2))
      : null,
  }));

  return { locations: parsed, total };
}