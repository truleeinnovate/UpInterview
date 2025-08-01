export const validateFile = async (file, type) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const resumeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (!file) return "No file selected.";

  if (type === "image") {
    if (!imageTypes.includes(file.type)) {
      return "Only JPG, PNG, or WebP images are allowed.";
    }

    if (file.size > 100 * 1024) {
      return "File is too big. Max file size is 100KB.";
    }

    try {
      const dimensionError = await validateImageDimensions(file, 200, 200);
      if (dimensionError) return dimensionError;
    } catch {
      return "Failed to validate image dimensions.";
    }
  }

  if (type === "resume") {
    if (!resumeTypes.includes(file.type)) {
      return "Only PDF, DOC or DOCX files are allowed for resumes or cover letters.";
    }

    if (file.size > 4 * 1024 * 1024) {
      return "File is too big. Max file size is 4MB.";
    }
  }

  return null;
};

// Helper function to check image dimensions
const validateImageDimensions = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          resolve(
            `Image width and height must be ${maxWidth} x ${maxHeight} pixels.`
          );
        } else {
          resolve(null);
        }
      };

      img.onerror = () => reject("Invalid image file.");
      img.src = event.target.result;
    };

    reader.onerror = () => reject("Failed to read image file.");
    reader.readAsDataURL(file);
  });
};
