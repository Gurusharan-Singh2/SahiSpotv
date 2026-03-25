import db from "../../config/db.js";

export const createParking = async (data, userId, imageUrls) => {
  return await db.transaction(async (trx) => {
    const [locationId] = await trx("parking_locations").insert({
      user_id: userId,
      name: data.name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      price_per_hour: data.price_per_hour,
      total_slots: data.total_slots,
      available_slots: data.total_slots,
    });

    if (imageUrls?.length) {
      const images = imageUrls.map((url) => ({
        location_id: locationId,
        image_url: url,
      }));
      await trx("parking_images").insert(images);
    }

    return locationId;
  });
};

