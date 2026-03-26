import db from "../config/db.js";

export async function createSlot(locationId, data) {
  const [id] = await db("parking_slots").insert({
    location_id: locationId,
    slot_number: data.slot_number,
    type: data.type,
    is_available: 1,
  });
  return db("parking_slots").where({ id }).first();
}

export async function createBulkSlots(locationId, slots) {
  const rows = slots.map((s) => ({
    location_id: locationId,
    slot_number: s.slot_number,
    type: s.type,
    is_available: 1,
  }));
  await db("parking_slots").insert(rows);
}

export async function getSlotsByLocation(locationId, type) {
  let query = db("parking_slots").where({ location_id: locationId });
  if (type) query = query.where({ type });
  return query.select("*");
}

export async function getSlotById(slotId) {
  return db("parking_slots").where({ id: slotId }).first();
}

export async function updateSlot(slotId, data) {
  const allowed = ["slot_number", "type", "is_available"];
  const updates = {};
  allowed.forEach((k) => { if (data[k] !== undefined) updates[k] = data[k]; });
  await db("parking_slots").where({ id: slotId }).update(updates);
  return db("parking_slots").where({ id: slotId }).first();
}

export async function deleteSlot(slotId) {
  return db("parking_slots").where({ id: slotId }).delete();
}
