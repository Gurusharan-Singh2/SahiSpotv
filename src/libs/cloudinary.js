import { v2 as cloudinary } from "cloudinary";

// Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Image
export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "users/profile",
        transformation: [
          { width: 500, height: 500, crop: "fill" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

// Delete Image
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    const parts = imageUrl.split("/");
    const publicIdWithFolder = parts.slice(-2).join("/");
    const publicId = publicIdWithFolder.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};