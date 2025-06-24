const cloudinary = require("../../utils/cloudinary");
const streamifier = require("streamifier");
const path = require("path");
const { Candidate } = require("../../models/candidate");
const { Contacts } = require("../../models/Contacts");
const  Tenant  = require("../../models/Tenant");

const entityModels = {
  candidate: Candidate,
  contact: Contacts,
  organization: Tenant,
};

const fieldMap = {
  candidate: {
    image: { field: "ImageData", resourceType: "image" },
    resume: { field: "resume", resourceType: "raw" },
  },
  contact: {
    image: { field: "imageData", resourceType: "image" },
  },
  organization: {
    logo: { field: "branding", resourceType: "image" },
  },
};

// Upload to Cloudinary with stream
const uploadToCloudinary = (buffer, originalname, folder) => {
  const ext = path.extname(originalname).toLowerCase();
  const resource_type = [".pdf", ".doc", ".docx"].includes(ext)
    ? "raw"
    : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: path.basename(originalname, ext),
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

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resource_type) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
  } catch (err) {
    console.warn(`Failed to delete file`, err.message);
  }
};

const uploadHandler = async (req, res) => {
  try {
    const file = req.file;
    const { entity, entityId, type, action } = req.body;

    // Validation
    if (!entity || !entityId || !type) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    const Model = entityModels[entity];
    if (!Model) {
      return res.status(400).json({ error: "Unsupported entity" });
    }

    const fieldConfig = fieldMap[entity]?.[type];
    if (!fieldConfig) {
      return res
        .status(400)
        .json({ error: "Unsupported file type for entity" });
    }

    const { field, resourceType } = fieldConfig;

    const instance = await Model.findById(entityId);
    if (!instance) {
      return res.status(404).json({ error: `${entity} not found` });
    }

    // DELETE logic
    if (action === "delete") {
      const existingFile = instance[field];
      if (existingFile?.publicId) {
        await deleteFromCloudinary(existingFile.publicId, resourceType);
        instance[field] = null;
        await instance.save();

        return res.status(200).json({
          status: "success",
          message: `${entity} ${type} deleted from Cloudinary`,
          data: instance,
        });
      }
      return res.status(400).json({ error: "No file found to delete" });
    }

    // UPLOAD logic
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Delete previous file if exists
    const prevFile = instance[field];
    if (prevFile?.publicId) {
      await deleteFromCloudinary(prevFile.publicId, resourceType);
    }

    // Upload to Cloudinary
    const folder = `${entity}/${entityId}/${type}`;
    const result = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      folder
    );

    instance[field] = {
      filename: file.originalname,
      path: result.secure_url,
      contentType: file.mimetype,
      publicId: result.public_id,
    };

    await instance.save();

    return res.status(200).json({
      status: "success",
      message: `${entity} ${type} uploaded and updated successfully`,
      data: instance,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = uploadHandler;

module.exports = { uploadHandler };
