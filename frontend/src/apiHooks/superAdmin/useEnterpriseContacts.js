import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { config } from "../../config";

export const useEnterpriseContacts = (queryParams = {}) => {
  const [enterpriseContacts, setEnterpriseContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentApiPage, setCurrentApiPage] = useState(0);

  // Store stable reference to queryParams (excluding page/limit which we control)
  const { page, limit, ...filterParams } = queryParams;
  const filterParamsRef = useRef(JSON.stringify(filterParams));

  const fetchContacts = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (pageNum === 0) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", (pageNum + 1).toString());
      params.append("limit", "20");

      // Add filter params
      const currentFilters = JSON.parse(filterParamsRef.current);
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "object" && !Array.isArray(value)) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue) {
                params.append(`${key}.${subKey}`, subValue);
              }
            });
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/upinterviewEnterpriseContact?${params.toString()}`
      );

      const { contacts, total } = response.data;

      if (Array.isArray(contacts)) {
        const formattedData = contacts.map((contact) => ({
          id: contact._id,
          _id: contact._id,
          companyName: contact.companyName || "N/A",
          contactPerson:
            [contact.firstName, contact.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || "N/A",
          email: contact.workEmail || "N/A",
          phone: contact.phone || "N/A",
          jobTitle: contact.jobTitle || "N/A",
          companySize: contact.companySize || "N/A",
          status: (contact.status || "new").toLowerCase(),
          createdAt: contact.createdAt
            ? new Date(contact.createdAt).toISOString()
            : new Date().toISOString(),
          name:
            [contact.firstName, contact.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || "N/A",
          company: contact.companyName || "N/A",
          message: contact.additionalDetails || "",
        }));

        if (append) {
          setEnterpriseContacts((prev) => [...prev, ...formattedData]);
        } else {
          setEnterpriseContacts(formattedData);
        }
        setTotalCount(total || 0);
        setHasMore(formattedData.length >= 20);
      } else {
        if (!append) {
          setEnterpriseContacts([]);
          setTotalCount(0);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching enterprise contacts:", err);
      setError(err.message || "Failed to fetch enterprise contacts");
      if (!append) {
        setEnterpriseContacts([]);
        setTotalCount(0);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Reset and fetch when filter params change
  useEffect(() => {
    const newFilterStr = JSON.stringify(filterParams);
    filterParamsRef.current = newFilterStr;
    setCurrentApiPage(0);
    fetchContacts(0, false);
  }, [JSON.stringify(filterParams)]);

  const fetchNextPage = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = currentApiPage + 1;
      setCurrentApiPage(nextPage);
      fetchContacts(nextPage, true);
    }
  }, [hasMore, isLoadingMore, currentApiPage, fetchContacts]);

  return {
    enterpriseContacts,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchNextPage,
    refetch: () => {
      setCurrentApiPage(0);
      fetchContacts(0, false);
    },
  };
};

export default useEnterpriseContacts;
