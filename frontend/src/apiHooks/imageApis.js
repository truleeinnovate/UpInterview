import axios from "axios";
import { config } from "../config";

export const uploadFile = async (file, type, entity, entityId) => {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("entity", entity);
  formData.append("entityId", entityId);

  // Upload new file
  if (file instanceof File) {
    formData.append("file", file);

    await axios.post(`${config.REACT_APP_API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Delete file if null
  else if (file === null) {
    formData.append("action", "delete");

    await axios.post(`${config.REACT_APP_API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};
