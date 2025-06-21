export const validateFile = (file, type) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const resumeTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  if (type === "profilePic") {
    if (!imageTypes.includes(file.type)) return "Only JPEG, PNG, WebP allowed.";
    if (file.size > 2 * 1024 * 1024) return "Image must be under 2MB.";
  }

  if (type === "resume") {
    if (!resumeTypes.includes(file.type)) return "Only PDF, DOC, DOCX allowed.";
    if (file.size > 10 * 1024 * 1024) return "Resume must be under 10MB.";
  }

  return null;
};
