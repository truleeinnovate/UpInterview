// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { config } from "../../config";
// import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";

// // Helper to get common headers
// const getHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${Cookies.get("authToken")}`,
// });

// const authToken = Cookies.get("authToken");
// const tokenPayload = decodeJwt(authToken);
// const tenantId = tokenPayload?.tenantId;

// const BASE_URL = `${config.REACT_APP_API_URL}/tenant-companies`;

// export const useCompanies = () => {
//   // 1. CREATE Company Mutation
//   const createCompanyMutation = useMutation({
//     mutationFn: async (data) => {
//       const response = await axios.post(`${BASE_URL}/create-company`, data, {
//         headers: getHeaders(),
//       });
//       return response.data;
//     },
//   });

//   // 2. GET ALL Companies Mutation
//   const getAllCompaniesMutation = useMutation({
//     mutationFn: async () => {
//       const response = await axios.get(BASE_URL, {
//         headers: getHeaders(),
//       });
//       return response.data;
//     },
//   });

//   // 3. GET Single Company Mutation (by ID)
//   const getCompanyMutation = useMutation({
//     mutationFn: async (id) => {
//       const response = await axios.get(`${BASE_URL}/${id}`, {
//         headers: getHeaders(),
//       });
//       return response.data;
//     },
//   });

//   // 4. UPDATE Company Mutation
//   const updateCompanyMutation = useMutation({
//     mutationFn: async ({ id, updateData }) => {
//       const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
//         headers: getHeaders(),
//       });
//       return response.data;
//     },
//   });

//   // 5. DELETE Company Mutation
//   const deleteCompanyMutation = useMutation({
//     mutationFn: async (id) => {
//       const response = await axios.delete(`${BASE_URL}/${id}`, {
//         headers: getHeaders(),
//       });
//       return response.data;
//     },
//   });

//   return {
//     // Actions
//     createCompany: createCompanyMutation.mutateAsync,
//     getAllCompanies: getAllCompaniesMutation.mutateAsync,
//     getCompany: getCompanyMutation.mutateAsync,
//     updateCompany: updateCompanyMutation.mutateAsync,
//     deleteCompany: deleteCompanyMutation.mutateAsync,

//     // Loading States
//     isLoading:
//       createCompanyMutation.isPending ||
//       getAllCompaniesMutation.isPending ||
//       getCompanyMutation.isPending ||
//       updateCompanyMutation.isPending ||
//       deleteCompanyMutation.isPending,

//     // Errors
//     errors: {
//       create: createCompanyMutation.error,
//       allCompanies: getAllCompaniesMutation.error,
//       get: getCompanyMutation.error,
//       update: updateCompanyMutation.error,
//       delete: deleteCompanyMutation.error,
//     },
//   };
// };

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../../config";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("authToken")}`,
});

const BASE_URL = `${config.REACT_APP_API_URL}/tenant-companies`;

export const useCompanies = () => {
  const queryClient = useQueryClient();

  // Extract tenantId inside the hook so it is always up to date
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  // 1. CREATE Company - Now includes tenantId in the body
  const createCompanyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${BASE_URL}/create-company`,
        { ...data, tenantId }, // Automatically inject tenantId
        { headers: getHeaders() }
      );
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });

  // 2. GET ALL Companies - Now includes tenantId as a query param
  const getAllCompaniesMutation = useMutation({
    mutationFn: async (params = {}) => {
      const response = await axios.get(BASE_URL, {
        params: { tenantId, ...params }, // Matches your backend req.query.tenantId + pagination/filters
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 3. GET Single Company (Scoping to tenantId is safer)
  const getCompanyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        params: { tenantId },
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 4. UPDATE Company
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await axios.put(
        `${BASE_URL}/${id}`,
        { ...updateData, tenantId },
        { headers: getHeaders() }
      );
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });

  // 5. DELETE Company
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        params: { tenantId },
        headers: getHeaders(),
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });

  return {
    createCompany: createCompanyMutation.mutateAsync,
    getAllCompanies: getAllCompaniesMutation.mutateAsync,
    getCompany: getCompanyMutation.mutateAsync,
    updateCompany: updateCompanyMutation.mutateAsync,
    deleteCompany: deleteCompanyMutation.mutateAsync,

    isLoading:
      createCompanyMutation.isPending ||
      getAllCompaniesMutation.isPending ||
      getCompanyMutation.isPending ||
      updateCompanyMutation.isPending ||
      deleteCompanyMutation.isPending,

    errors: {
      create: createCompanyMutation.error,
      allCompanies: getAllCompaniesMutation.error,
      get: getCompanyMutation.error,
      update: updateCompanyMutation.error,
      delete: deleteCompanyMutation.error,
    },
  };
};
