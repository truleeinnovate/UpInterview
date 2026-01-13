import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { Building2, Factory, Calendar } from "lucide-react";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies";

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCompany, isLoading } = useCompanies();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        try {
          const data = await getCompany(id);
          setCompany(data);
        } catch (error) {
          console.error("Error fetching company details:", error);
        }
      };
      fetchDetails();
    }
  }, [id, getCompany]);

  if (isLoading && !company) {
    return (
      <SidebarPopup title="Company Details" onClose={() => navigate(-1)}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      </SidebarPopup>
    );
  }

  return (
    <SidebarPopup title="Company" onClose={() => navigate(-1)}>
      <div className="space-y-4 bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100 mt-8">
        <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
          Company Details
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
          {/* Company Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-bg rounded-lg">
              <Building2 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p
                className="text-gray-700 truncate cursor-default max-w-[200px]"
                title={company?.name}
              >
                {company?.name ? capitalizeFirstLetter(company?.name) : "N/A"}
              </p>
            </div>
          </div>

          {/* Industry */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-bg rounded-lg">
              <Factory className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="text-gray-700 truncate cursor-default max-w-[200px]">
                {company?.industry
                  ? capitalizeFirstLetter(company?.industry)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
          {/* Created At / Joined Date */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-bg rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="text-gray-700">
                {company?.createdAt ? formatDateTime(company.createdAt) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default CompanyDetails;
