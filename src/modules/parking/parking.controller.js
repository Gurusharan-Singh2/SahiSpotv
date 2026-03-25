// import * as parkingService from "./parking.service.js";
// import { uploadToTebi } from "../../libs/s3.js";

// export const addParking = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const {
//       name,
//       city,
//       latitude,
//       longitude,
//       price_per_hour,
//       total_slots,
//     } = req.body || {};

//     const missing = [];
//     if (!name) missing.push("name");
//     if (!city) missing.push("city");
//     if (latitude === undefined || latitude === null) missing.push("latitude");
//     if (longitude === undefined || longitude === null) missing.push("longitude");
//     if (price_per_hour === undefined || price_per_hour === null) missing.push("price_per_hour");
//     if (total_slots === undefined || total_slots === null) missing.push("total_slots");

//     if (missing.length) {
//       return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
//     }

//     const lat = Number(latitude);
//     const lon = Number(longitude);
//     const pricePerHour = Number(price_per_hour);
//     const total = Number(total_slots);

//     if (![lat, lon, pricePerHour, total].every((n) => Number.isFinite(n))) {
//       return res.status(400).json({ message: "Invalid numeric fields" });
//     }

//     const files = req.files || [];

//     // Upload images first, then store their returned URLs in DB.
//     const imageUrls = files.length
//       ? await Promise.all(
//           files.map((file) =>
//             uploadToTebi(file.buffer, file.originalname, file.mimetype)
//           )
//         )
//       : [];

//     const id = await parkingService.createParking(
//       {
//         name,
//         city,
//         latitude: lat,
//         longitude: lon,
//         price_per_hour: pricePerHour,
//         total_slots: total,
//       },
//       req.user.id,
//       imageUrls
//     );

//     return res.json({ success: true, id, images: imageUrls });
//   } catch (err) {
//     const message = err?.message || "Internal Server Error";
//     const status = message.includes("Invalid image type") ? 400 : 500;
//     return res.status(status).json({ error: message });
//   }
// };

