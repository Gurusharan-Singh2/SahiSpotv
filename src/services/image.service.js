import db from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

export async function uploadParkingImage(locationId, fileBuffer) {
  const { url, public_id } = await uploadToCloudinary(fileBuffer, `parking/${locationId}`);

  const [id] = await db("parking_images").insert({
    location_id: locationId,
    image_url: url,
  });

  return db("parking_images").where({ id }).first();
}

export async function getImagesByLocation(locationId) {
  return db("parking_images").where({ location_id: locationId }).select("*");
}

export async function deleteParkingImage(imageId, ownerId) {
  const image = await db("parking_images as pi")
    .join("parking_locations as pl", "pl.id", "pi.location_id")
    .where("pi.id", imageId)
    .select("pi.*", "pl.owner_id")
    .first();

  if (!image) throw { statusCode: 404, message: "Image not found" };
  if (image.owner_id !== ownerId) throw { statusCode: 403, message: "Forbidden" };

  const parts = image.image_url.split("/");
  const fileWithExt = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const public_id = `${folder}/${fileWithExt.split(".")[0]}`;

  try {
    await deleteFromCloudinary(public_id);
  } catch (e) {
    console.warn("Cloudinary delete failed:", e.message);
  }

  await db("parking_images").where({ id: imageId }).delete();
  return { deleted: true, imageId };
}
