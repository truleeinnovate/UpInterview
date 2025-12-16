import axios from "axios";
import { config } from "../config"; // adjust path if needed
import { useMutation } from "@tanstack/react-query";

const updateVideoSettings = async (payload) => {
  const { data } = await axios.patch(
    `${config.REACT_APP_API_URL}/video-details/update-settings`,
    payload
  );

  return data;
};

export const useUpdateVideoSettings = () => {
  return useMutation({
    mutationFn: updateVideoSettings,
  });
};
