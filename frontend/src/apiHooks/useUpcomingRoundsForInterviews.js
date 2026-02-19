// hooks/useUpcomingRoundsForInterviewer.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { subMinutes, isAfter, isBefore } from "date-fns";
import { config } from "../config";
import Cookies from "js-cookie";


export const useUpcomingRoundsForInterviewer = () => {
    return useQuery({
        queryKey: ["upcoming-rounds-interviewer"],
        queryFn: async () => {
            const authToken = Cookies.get("authToken") ?? "";

            const { data } = await axios.get(
                `${config.REACT_APP_API_URL}/interview/upcoming-rounds`, // adjust path if needed
                {
                    headers: authToken
                        ? {
                            Authorization: `Bearer ${authToken}`,
                        }
                        : undefined,
                    withCredentials: true, // keep this if you're using cookies/session
                }
            );

            // Return the actual data array (adjust if your backend wraps it differently)
            return data.data || data; // common patterns: data.data, data.results, data
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000,
        select: (rounds) =>
            rounds.map((round) => {
                if (!round.dateTime) return round;

                const [startStr, endStr] = round.dateTime.split(" - ").map((s) => s.trim());
                const start = new Date(startStr);
                const end = endStr ? new Date(endStr) : null;

                const now = new Date();
                const canJoin =
                    !isNaN(start.getTime()) &&
                    isAfter(now, subMinutes(start, 15)) &&
                    (!end || isBefore(now, end));

                return { ...round, _canJoin: canJoin };
            }),
        // Optional: handle errors or empty state
        onError: (err) => {
            console.error("Failed to fetch upcoming rounds:", err);
            // You can show toast/notification here if needed
        },
    });
};