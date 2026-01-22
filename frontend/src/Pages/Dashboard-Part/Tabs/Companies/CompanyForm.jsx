import React, { useState, useEffect } from "react";
import { notify } from "../../../../services/toastService";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import { Button } from "../../../../Components/Buttons/Button";

// Changed: Now receives id, onClose, and onSuccess as props instead of using URL params/navigate
const CompanyForm = ({ mode, id, onClose, onSuccess }) => {
  const { createCompany, updateCompany, getCompany, isLoading } =
    useCompanies();

  const { industries, loadIndustries, isIndustriesFetching } = useMasterData(
    {},
    "adminPortal",
  );

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    primaryContactName: "",
    primaryContactEmail: "",
    description: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Changed: Logic now depends on the 'id' prop
    if (mode === "Edit" && id) {
      const fetchCompanyData = async () => {
        try {
          const data = await getCompany(id);
          if (data) {
            setFormData({
              name: data.name || "",
              industry: data.industry || "",
              website: data.website || "",
              primaryContactName: data.primaryContactName || "",
              primaryContactEmail: data.primaryContactEmail || "",
              description: data.description || "",
              status: data.status || "active",
            });
          }
        } catch (error) {
          console.error("Error fetching company:", error);
          notify.error("Failed to fetch company details");
        }
      };
      fetchCompanyData();
    }
  }, [mode, id, getCompany]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Company name must be at least 3 characters";
    }

    if (!formData.industry) {
      newErrors.industry = "Please select an industry";
    }

    if (formData.primaryContactEmail.trim()) {
      if (!/^\S+@\S+\.\S+$/.test(formData.primaryContactEmail)) {
        newErrors.primaryContactEmail = "Invalid email format";
      }
    }

    if (formData.website.trim()) {
      let website = formData.website.trim();
      if (!website.startsWith("http://") && !website.startsWith("https://")) {
        website = "https://" + website;
      }
      try {
        const url = new URL(website);
        const hostname = url.hostname;
        const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(hostname.replace("www.", ""))) {
          newErrors.website = "Invalid website domain";
        }
      } catch {
        newErrors.website = "Invalid website URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const name = e.target ? e.target.name : "industry";
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!tenantId) {
      notify.error("Tenant information missing. Please log in again.");
      return;
    }

    const payload = { ...formData, tenantId: tenantId };

    try {
      if (mode === "Edit") {
        await updateCompany({ id, updateData: payload });
        notify.success("Company updated successfully!");
      } else {
        await createCompany({ ...payload, status: "active" });
        notify.success("Company created successfully!");
      }
      // Changed: Call onSuccess and onClose instead of navigate()
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      notify.error(
        error?.response?.data?.message ||
          `Failed to ${mode.toLowerCase()} company`,
      );
    }
  };

  const industryOptions =
    industries?.map((ind) => ({
      value: ind.IndustryName,
      label: ind.IndustryName,
    })) || [];

  if (mode === "Edit" && isLoading && !formData.name) {
    return (
      <SidebarPopup title="Update Company" onClose={onClose}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      </SidebarPopup>
    );
  }

  return (
    // <SidebarPopup
    //   title={mode === "Create" ? "Create New Company" : "Update Company"}
    //   onClose={onClose}
    // >
    //   <form onSubmit={handleSubmit} className="flex flex-col h-full" noValidate>
    //     <div className="flex-1 overflow-y-auto p-8 space-y-6">
    //       <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Company Name <span className="text-red-500">*</span>
    //           </label>
    //           <input
    //             type="text"
    //             name="name"
    //             value={formData.name}
    //             onChange={handleChange}
    //             className={`w-full h-10 px-3 py-2 border rounded-md outline-none transition-all ${
    //               errors.name
    //                 ? "border-red-500 focus:ring-1 focus:ring-red-500"
    //                 : "focus:ring-2 focus:ring-custom-blue border-gray-300"
    //             }`}
    //             placeholder="E.g. TechNova Solutions"
    //           />
    //           {errors.name && (
    //             <p className="mt-1 text-xs text-red-500 font-medium">
    //               {errors.name}
    //             </p>
    //           )}
    //         </div>

    //         <div>
    //           <DropdownWithSearchField
    //             label={
    //               <span>
    //                 Industry <span className="text-red-500">*</span>
    //               </span>
    //             }
    //             name="industry"
    //             options={industryOptions}
    //             value={formData.industry}
    //             onChange={(val) => handleChange(val)}
    //             onMenuOpen={loadIndustries}
    //             loading={isIndustriesFetching}
    //             placeholder="Select or Search Industry"
    //             error={!!errors.industry}
    //           />
    //           {errors.industry && (
    //             <p className="mt-1 text-xs text-red-500 font-medium">
    //               {errors.industry}
    //             </p>
    //           )}
    //         </div>
    //       </div>
    //       <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Website
    //           </label>
    //           <input
    //             type="url"
    //             name="website"
    //             value={formData.website}
    //             onChange={handleChange}
    //             className={`w-full h-10 px-4 py-2 border rounded-md outline-none transition-all ${
    //               errors.website
    //                 ? "border-red-500 focus:ring-1 focus:ring-red-500"
    //                 : "focus:ring-2 focus:ring-custom-blue border-gray-300"
    //             }`}
    //             placeholder="https://company.com"
    //           />
    //           {errors.website && (
    //             <p className="mt-1 text-xs text-red-500 font-medium">
    //               {errors.website}
    //             </p>
    //           )}
    //         </div>

    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Primary Contact Name <span className="text-red-500">*</span>
    //           </label>
    //           <input
    //             type="text"
    //             name="primaryContactName"
    //             value={formData.primaryContactName}
    //             onChange={handleChange}
    //             className={`w-full h-10 px-4 py-2 border rounded-md outline-none transition-all ${
    //               errors.primaryContactName
    //                 ? "border-red-500 focus:ring-1 focus:ring-red-500"
    //                 : "focus:ring-2 focus:ring-custom-blue border-gray-300"
    //             }`}
    //             placeholder="E.g. John Doe"
    //           />
    //         </div>
    //       </div>
    //       <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Primary Contact Email <span className="text-red-500">*</span>
    //           </label>
    //           <input
    //             type="email"
    //             name="primaryContactEmail"
    //             value={formData.primaryContactEmail}
    //             onChange={handleChange}
    //             className={`w-full h-10 px-4 py-2 border rounded-md outline-none transition-all ${
    //               errors.primaryContactEmail
    //                 ? "border-red-500 focus:ring-1 focus:ring-red-500"
    //                 : "focus:ring-2 focus:ring-custom-blue border-gray-300"
    //             }`}
    //             placeholder="john@company.com"
    //           />
    //           {errors.primaryContactEmail && (
    //             <p className="mt-1 text-xs text-red-500 font-medium">
    //               {errors.primaryContactEmail}
    //             </p>
    //           )}
    //         </div>
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Status
    //           </label>
    //           <div className="flex items-center gap-3">
    //             <button
    //               type="button"
    //               onClick={() =>
    //                 setFormData((prev) => ({
    //                   ...prev,
    //                   status: prev.status === "active" ? "inactive" : "active",
    //                 }))
    //               }
    //               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    //                 formData.status === "active"
    //                   ? "bg-custom-blue"
    //                   : "bg-gray-300"
    //               }`}
    //             >
    //               <span
    //                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    //                   formData.status === "active"
    //                     ? "translate-x-6"
    //                     : "translate-x-1"
    //                 }`}
    //               />
    //             </button>
    //             <span
    //               className={`text-sm font-medium ${
    //                 formData.status === "active"
    //                   ? "text-custom-blue"
    //                   : "text-gray-500"
    //               }`}
    //             >
    //               {formData.status === "active" ? "Active" : "Inactive"}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Company Description
    //         </label>
    //         <textarea
    //           name="description"
    //           value={formData.description}
    //           onChange={handleChange}
    //           rows={4}
    //           className="w-full px-4 py-2 border rounded-md outline-none transition-all focus:ring-2 focus:ring-custom-blue border-gray-300 resize-none"
    //           placeholder="Brief description about the company..."
    //         />
    //       </div>
    //     </div>

    //     <div className="p-4 mb-8 flex justify-end gap-3">
    //       <button
    //         type="button"
    //         onClick={onClose}
    //         className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
    //       >
    //         Cancel
    //       </button>

    //       <button
    //         type="submit"
    //         disabled={isLoading}
    //         className={`px-6 py-2 bg-custom-blue text-white rounded-md transition-all ${
    //           isLoading
    //             ? "opacity-50 cursor-not-allowed"
    //             : "hover:bg-opacity-90"
    //         }`}
    //       >
    //         {isLoading
    //           ? "Processing..."
    //           : mode === "Create"
    //             ? "Create Company"
    //             : "Update Company"}
    //       </button>
    //     </div>
    //   </form>
    // </SidebarPopup>
    <SidebarPopup
      title={mode === "Create" ? "Create New Company" : "Update Company"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col px-4 mb-8" noValidate>
        <div className="flex-1 space-y-4">
          {/* --- Section 1: Company Information --- */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Company Information
              </h3>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 border rounded-md outline-none transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-custom-blue border-gray-300"
                  }`}
                  placeholder="E.g. TechNova Solutions"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <DropdownWithSearchField
                  label={
                    <span>
                      Industry <span className="text-red-500">*</span>
                    </span>
                  }
                  name="industry"
                  options={industryOptions}
                  value={formData.industry}
                  onChange={(val) => handleChange(val)}
                  onMenuOpen={loadIndustries}
                  loading={isIndustriesFetching}
                  placeholder="Select Industry"
                  error={!!errors.industry}
                />
                {errors.industry && (
                  <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full h-10 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-blue outline-none"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            {/* Full Width Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-blue outline-none resize-none"
                placeholder="Brief description about the company..."
              />
            </div>
          </section>

          {/* --- Section 2: Primary Contact Details --- */}
          <section className="space-y-4 pt-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Primary Contact Details
              </h3>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={handleChange}
                  className="w-full h-10 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-blue outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="primaryContactEmail"
                  value={formData.primaryContactEmail}
                  onChange={handleChange}
                  className={`w-full h-10 px-4 border rounded-md outline-none transition-all ${
                    errors.primaryContactEmail
                      ? "border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-custom-blue"
                  }`}
                  placeholder="john@company.com"
                />
                {errors.primaryContactEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.primaryContactEmail}
                  </p>
                )}
              </div>
            </div>
          </section>
          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center gap-3 h-10">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: prev.status === "active" ? "inactive" : "active",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status === "active" ? "bg-custom-blue" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === "active" ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span
                className={`text-sm font-medium ${formData.status === "active" ? "text-custom-blue" : "text-gray-500"}`}
              >
                {formData.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* --- Section 3: Address Information --- */}
          <section className="space-y-4 pt-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Address Information
              </h3>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                placeholder="Address Line 1"
                className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
              />
              <input
                type="text"
                placeholder="Address Line 2"
                className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
              />

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  className="w-full h-10 px-4 border border-gray-300 rounded-md outline-none"
                />
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 bg-white mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="border border-gray-300 text-gray-700 rounded-md hover:bg-white transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`text-white rounded-md ${isLoading ? "opacity-50" : "hover:bg-opacity-90"}`}
            >
              {isLoading
                ? "Processing..."
                : mode === "Create"
                  ? "Create Company"
                  : "Update Company"}
            </Button>
          </div>
        </div>
      </form>
    </SidebarPopup>
  );
};

export default CompanyForm;
