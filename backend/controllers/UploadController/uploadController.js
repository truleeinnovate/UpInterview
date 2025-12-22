// v1.0.0 - Ashok - change in delete file
const cloudinary = require("../../utils/cloudinary");
const { Candidate } = require("../../models/candidate.js");
const { Contacts } = require("../../models/Contacts");
const Tenant = require("../../models/Tenant");
const SupportUser = require("../../models/SupportUser");
const { MockInterview } = require("../../models/Mockinterview/mockinterview.js");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");

const entityModels = {
  candidate: Candidate,
  contact: Contacts,
  organization: Tenant,
  support: SupportUser,
  mockInterview: MockInterview,
};

const fieldMap = {
  candidate: {
    image: { field: "ImageData", resourceType: "image" },
    resume: { field: "resume", resourceType: "raw" },
  },
  contact: {
    image: { field: "imageData", resourceType: "image" },
    resume: { field: "resume", resourceType: "raw" },
    coverLetter: { field: "coverLetter", resourceType: "raw" },
  },
  organization: {
    logo: { field: "branding", resourceType: "image" },
  },
  support: {
    attachment: { field: "attachment", resourceType: "image" },
  },
  mockInterview: {
    resume: { field: "resume", resourceType: "raw" },
  },
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
  // Structured logging context for internalLoggingMiddleware
  res.locals.loggedByController = true;
  res.locals.processName = "Upload File";

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

        // Internal log: successful delete
        res.locals.logData = {
          tenantId: req.body?.tenantId || "",
          ownerId: req.body?.ownerId || entityId,
          processName: "Upload File",
          status: "success",
          message: `${entity} ${type} deleted from Cloudinary`,
          requestBody: { ...req.body, action: "delete" },
          responseBody: {
            entity,
            entityId,
            type,
            action: "delete",
            result: "deleted",
          },
        };

        return res.status(200).json({
          status: "success",
          message: `${entity} ${type} deleted from Cloudinary`,
          data: instance,
        });
      }
      // v1.0.0 <-----------------------------------------------------------
      // return res.status(400).json({ error: "No file found to delete" });
      return res.status(204).send();
      // v1.0.0 ----------------------------------------------------------->
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
      fileSize: file.size,
      uploadDate: new Date(),
    };

    await instance.save();

    // Internal log: successful upload
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || entityId,
      processName: "Upload File",
      status: "success",
      message: `${entity} ${type} uploaded and updated successfully`,
      requestBody: {
        ...req.body,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      responseBody: {
        entity,
        entityId,
        type,
        url: result.secure_url,
        publicId: result.public_id,
      },
    };

    return res.status(200).json({
      status: "success",
      message: `${entity} ${type} uploaded and updated successfully`,
      data: instance,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    // Internal log: error (5xx only)
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || req.body?.entityId || "",
      processName: "Upload File",
      status: "error",
      message: "Upload failed",
      requestBody: req.body,
      responseBody: {
        error: error.message,
      },
    };

    return res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = uploadHandler;

module.exports = { uploadHandler };
