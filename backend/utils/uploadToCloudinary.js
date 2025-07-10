const streamifier = require("streamifier");
const path = require("path");
const cloudinary = require("./cloudinary");

const sanitizeFilename = (filename) => {
  return filename
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-zA-Z0-9-_]/g, ""); // Remove non-alphanumeric (except - and _)
};

const uploadToCloudinary = (buffer, originalname, folder) => {
  const ext = path.extname(originalname).toLowerCase(); // e.g. .pdf
  const baseName = path.basename(originalname, ext); // e.g. Resume File
  const sanitizedBaseName = sanitizeFilename(baseName); // e.g. Resume-File
  const publicIdWithExtension = `${sanitizedBaseName}${ext}`; // e.g. Resume-File.pdf

  const resource_type = [".pdf", ".doc", ".docx"].includes(ext)
    ? "raw"
    : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: publicIdWithExtension, // extension included
        type: "upload",
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
