import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useRegionalTaxConfigById } from "../../../apiHooks/useTenantTaxConfig.js";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { formatDateTime } from "../../../utils/dateFormatter.js";

const RegionalTaxDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: taxConfig, isLoading } = useRegionalTaxConfigById(id);
  console.log("TAX CONFIG ============================> ", taxConfig);

  if (isLoading) {
    return (
      <SidebarPopup title="Regional Tax Details" onClose={() => navigate(-1)}>
        <div className="p-6 text-center text-gray-500">Loading...</div>
      </SidebarPopup>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">
        {value ?? "-"}
      </span>
    </div>
  );

  const {
    country,
    regionCode,
    currency,
    gst,
    serviceCharge,
    isDefault,
    status,
    createdAt,
    updatedAt,
  } = taxConfig;

  return (
    <SidebarPopup title="Regional Tax Details" onClose={() => navigate(-1)}>
      <div className="p-6 space-y-6">
        <section className="border p-4 rounded-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Basic Information
          </h3>
          <InfoRow label="Country" value={country} />
          <InfoRow label="Region Code" value={regionCode} />
          <InfoRow
            label="Currency"
            value={`${currency?.code} (${currency?.symbol})`}
          />
          <InfoRow label="Status" value={<StatusBadge status={status} />} />
          <InfoRow label="Default Region" value={isDefault ? "Yes" : "No"} />
        </section>

        <section className="border p-4 rounded-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Tax Configuration
          </h3>

          <InfoRow label="GST Enabled" value={gst?.enabled ? "Yes" : "No"} />
          <InfoRow
            label="GST Percentage"
            value={gst?.enabled ? `${gst?.percentage}%` : "-"}
          />

          <InfoRow
            label="Service Charge Enabled"
            value={serviceCharge?.enabled ? "Yes" : "No"}
          />
          <InfoRow
            label="Service Charge Percentage"
            value={
              serviceCharge?.enabled ? `${serviceCharge?.percentage}%` : "-"
            }
          />
        </section>

        <section className="border p-4 rounded-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
          <InfoRow label="Created At" value={formatDateTime(createdAt)} />
          <InfoRow label="Last Updated" value={formatDateTime(updatedAt)} />
        </section>
      </div>
    </SidebarPopup>
  );
};

export default RegionalTaxDetails;
