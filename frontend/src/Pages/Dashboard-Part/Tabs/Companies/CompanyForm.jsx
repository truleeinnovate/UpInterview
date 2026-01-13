import React, { useState, useEffect } from "react";
import { notify } from "../../../../services/toastService";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

const CompanyForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createCompany, updateCompany, getCompany, isLoading } =
    useCompanies();

  const { industries, loadIndustries, isIndustriesFetching } = useMasterData(
    {},
    "adminPortal"
  );

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
  });

  useEffect(() => {
    if (mode === "Edit" && id) {
      const fetchCompanyData = async () => {
        try {
          const data = await getCompany(id);

          if (data) {
            setFormData({
              name: data.name || "",
              industry: data.industry || "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tenantId) {
      notify.error("Tenant information missing. Please log in again.");
      return;
    }

    const payload = {
      ...formData,
      tenantId: tenantId,
    };

    try {
      if (mode === "Edit") {
        // Use update action
        await updateCompany({ id, updateData: payload });
        notify.success("Company updated successfully!");
      } else {
        // Use create action
        await createCompany({ ...payload, status: "active" });
        notify.success("Company created successfully!");
      }
      navigate("/companies");
    } catch (error) {
      notify.error(
        error?.response?.data?.message ||
          `Failed to ${mode.toLowerCase()} company`
      );
    }
  };

  const industryOptions =
    industries?.map((ind) => ({
      value: ind.IndustryName,
      label: ind.IndustryName,
    })) || [];

  // Inside CompanyForm
  if (mode === "Edit" && isLoading && !formData.name) {
    return (
      <SidebarPopup title="Update Company" onClose={() => navigate(-1)}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      </SidebarPopup>
    );
  }

  return (
    // <SidebarPopup
    //   title={mode === "Create" ? "Create New Company" : "Update Company"}
    //   onClose={() => navigate(-1)}
    // >
    //   <div className="mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
    //     <form onSubmit={handleSubmit} className="space-y-6">
    //       {/* Company Name Field */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Company Name
    //         </label>
    //         <input
    //           type="text"
    //           name="name"
    //           required
    //           value={formData.name}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-custom-blue outline-none transition-all"
    //           placeholder="e.g. TechNova Solutions"
    //         />
    //       </div>

    //       {/* Industry Field */}
    //       <div>
    //         <DropdownWithSearchField
    //           label="Industry"
    //           name="industry"
    //           required
    //           options={industryOptions}
    //           value={formData.industry}
    //           onChange={handleChange}
    //           onMenuOpen={loadIndustries}
    //           loading={isIndustriesFetching}
    //           placeholder="Select or search industry"
    //         />
    //       </div>

    //       {/* Action Buttons */}
    //       <div className="flex gap-4 pt-4">
    //         <button
    //           type="button"
    //           onClick={() => navigate(-1)}
    //           className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           disabled={isLoading}
    //           className={`flex-1 px-4 py-2 bg-custom-blue text-white rounded-md transition-all ${
    //             isLoading
    //               ? "opacity-50 cursor-not-allowed"
    //               : "hover:bg-custom-blue"
    //           }`}
    //         >
    //           {isLoading
    //             ? mode === "Create"
    //               ? "Creating..."
    //               : "Updating..."
    //             : mode === "Create"
    //             ? "Create Company"
    //             : "Update Company"}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </SidebarPopup>
    <SidebarPopup
      title={mode === "Create" ? "Create New Company" : "Update Company"}
      onClose={() => navigate(-1)}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Company Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-custom-blue outline-none transition-all"
              placeholder="e.g. TechNova Solutions"
            />
          </div>

          {/* Industry Field */}
          <div>
            <DropdownWithSearchField
              label="Industry"
              name="industry"
              required
              options={industryOptions}
              value={formData.industry}
              onChange={handleChange}
              onMenuOpen={loadIndustries}
              loading={isIndustriesFetching}
              placeholder="Select or Search Industry"
            />
          </div>
        </div>

        {/* Fixed Footer Buttons Area */}
        <div className="p-4 mb-8 flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-4 py-2 bg-custom-blue text-white rounded-md transition-all ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-opacity-90"
            }`}
          >
            {isLoading
              ? mode === "Create"
                ? "Creating..."
                : "Updating..."
              : mode === "Create"
              ? "Create Company"
              : "Update Company"}
          </button>
        </div>
      </form>
    </SidebarPopup>
  );
};

export default CompanyForm;
