import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import {
  Building2,
  Factory,
  Calendar,
  Globe,
  User,
  Mail,
  FileText,
  CheckCircle,
} from "lucide-react";

import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";

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
    <SidebarPopup
      title={capitalizeFirstLetter(company?.name) || "Company Details"}
      titleRight={
        <StatusBadge status={capitalizeFirstLetter(company?.status)} />
      }
      onClose={() => navigate(-1)}
    >
      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
            Contact
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Primary Contact Name */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Primary Contact</p>
                <p className="text-gray-700 truncate cursor-default max-w-[200px]">
                  {company?.primaryContactName
                    ? capitalizeFirstLetter(company?.primaryContactName)
                    : "N/A"}
                </p>
              </div>
            </div>
            {/* Website */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Globe className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <p className="text-gray-700 truncate cursor-default max-w-[200px]">
                  {company?.website || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                {/* Primary Contact Email */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-bg rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="text-gray-700 truncate cursor-default max-w-[200px]">
                      {company?.primaryContactEmail || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
            Metadata
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 mb-6">
            {/* Created At */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-gray-700">
                  {company?.createdAt
                    ? formatDateTime(company.createdAt)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-bg rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-normal break-all">
                {capitalizeFirstLetter(company?.description) || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default CompanyDetails;
