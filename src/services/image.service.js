import db from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────
export async function uploadParkingImage(locationId, fileBuffer) {
  const { url, public_id } = await uploadToCloudinary(fileBuffer, `parking/${locationId}`);

  const [id] = await db("parking_images").insert({
    location_id: locationId,
    image_url: url,
  });

  return db("parking_images").where({ id }).first();
}

// ─── GET IMAGES BY LOCATION ───────────────────────────────────────────────────
export async function getImagesByLocation(locationId) {
  return db("parking_images").where({ location_id: locationId }).select("*");
}

// ─── DELETE IMAGE ─────────────────────────────────────────────────────────────
export async function deleteParkingImage(imageId, ownerId) {
  const image = await db("parking_images as pi")
    .join("parking_locations as pl", "pl.id", "pi.location_id")
    .where("pi.id", imageId)
    .select("pi.*", "pl.owner_id")
    .first();

  if (!image) throw { statusCode: 404, message: "Image not found" };
  if (image.owner_id !== ownerId) throw { statusCode: 403, message: "Forbidden" };

  // Extract public_id from Cloudinary URL
  const parts = image.image_url.split("/");
  const fileWithExt = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const public_id = `${folder}/${fileWithExt.split(".")[0]}`;

  // Try to delete from Cloudinary (non-blocking on failure)
  try {
    await deleteFromCloudinary(public_id);
  } catch (e) {
    console.warn("Cloudinary delete failed:", e.message);
  }

  await db("parking_images").where({ id: imageId }).delete();
  return { deleted: true, imageId };
}
