import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Fetch the global platform (superadmin) wallet
export const usePlatformWallet = () => {
  const { isInitialized } = usePermissions();

  return useQuery({
    queryKey: ["platformWallet"],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/wallet/platform`,
        {
          withCredentials: true,
        }
      );

      return response?.data?.wallet || null;
    },
    enabled: isInitialized,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
