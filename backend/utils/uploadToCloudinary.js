// utils/cloudinaryUpload.js
const streamifier = require("streamifier");
const path = require("path");
const cloudinary = require("./cloudinary");

const sanitizeFilename = (filename) => {
  // Remove leading/trailing spaces and replace multiple spaces with a single dash
  return filename
    .trim()
    .replace(/\s+/g, "-") // replace all space(s) with -
    .replace(/[^a-zA-Z0-9-_]/g, ""); // remove all non-alphanumeric except - and _
};

const uploadToCloudinary = (buffer, originalname, folder) => {
  const ext = path.extname(originalname).toLowerCase();
  const resource_type = [".pdf", ".doc", ".docx"].includes(ext)
    ? "raw"
    : "image";

  const baseName = path.basename(originalname, ext);
  const sanitizedPublicId = sanitizeFilename(baseName);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: sanitizedPublicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
