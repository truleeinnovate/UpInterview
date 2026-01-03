import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { notify } from "../../../services/toastService.js";
import {
  useCreateRegionalTaxConfig,
  useRegionalTaxConfigById,
  useUpdateRegionalTaxConfig,
} from "../../../apiHooks/useTenantTaxConfig.js";

const RegionalTaxForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = mode === "Edit" && !!id;

  const { mutate: createTax, isLoading: isCreating } =
    useCreateRegionalTaxConfig();

  const { data, isLoading: isFetching } = useRegionalTaxConfigById(
    isEditMode ? id : null
  );

  const { mutate: updateTax, isLoading: isUpdating } =
    useUpdateRegionalTaxConfig();

  const [formData, setFormData] = useState({
    country: "",
    regionCode: "",
    currencyCode: "",
    currencySymbol: "",
    gstPercentage: "",
    serviceChargePercentage: "",
    isDefault: false,
    status: "Active",
  });

  useEffect(() => {
    if (!isEditMode || !data) return;

    setFormData({
      country: data.country || "",
      regionCode: data.regionCode || "",
      currencyCode: data.currency?.code || "",
      currencySymbol: data.currency?.symbol || "",
      gstPercentage: data.gst?.percentage ?? "",
      serviceChargePercentage: data.serviceCharge?.percentage ?? "",
      isDefault: data.isDefault ?? false,
      status: data.status || "Active",
    });
  }, [isEditMode, data]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      country: formData.country,
      regionCode: formData.regionCode,
      currency: {
        code: formData.currencyCode,
        symbol: formData.currencySymbol,
      },
      gst: {
        enabled: Number(formData.gstPercentage) > 0,
        percentage: Number(formData.gstPercentage) || 0,
      },
      serviceCharge: {
        enabled: Number(formData.serviceChargePercentage) > 0,
        percentage: Number(formData.serviceChargePercentage) || 0,
      },
      isDefault: formData.isDefault,
      status: formData.status,
    };

    if (isEditMode) {
      updateTax(
        { id, payload },
        {
          onSuccess: () => {
            notify.success("Regional tax updated successfully");
            navigate(-1);
          },
          onError: () => {
            notify.error("Failed to update regional tax");
          },
        }
      );
    } else {
      createTax(payload, {
        onSuccess: () => {
          notify.success("Regional tax created successfully");
          navigate(-1);
        },
        onError: () => {
          notify.error("Failed to create regional tax");
        },
      });
    }
  };

  if (isEditMode && isFetching) {
    return (
      <SidebarPopup title="Edit Regional Tax" onClose={() => navigate(-1)}>
        <div className="p-6">Loading...</div>
      </SidebarPopup>
    );
  }

  return (
    <SidebarPopup
      title={isEditMode ? "Edit Regional Tax" : "Create Regional Tax"}
      onClose={() => navigate(-1)}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="Enter Country"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Region Code */}
        <div>
          <label className="block text-sm font-medium mb-1">Region Code</label>
          <input
            type="text"
            value={formData.regionCode}
            onChange={(e) =>
              setFormData({ ...formData, regionCode: e.target.value })
            }
            placeholder="Enter Region Code"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Currency Code */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Currency Code
          </label>
          <input
            type="text"
            value={formData.currencyCode}
            onChange={(e) =>
              setFormData({ ...formData, currencyCode: e.target.value })
            }
            placeholder="Enter Currency Code"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Currency Symbol */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Currency Symbol
          </label>
          <input
            type="text"
            placeholder="₹ / $ / €"
            value={formData.currencySymbol}
            onChange={(e) =>
              setFormData({ ...formData, currencySymbol: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* GST */}
        <div>
          <label className="block text-sm font-medium mb-1">
            GST Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.gstPercentage}
            onChange={(e) =>
              setFormData({ ...formData, gstPercentage: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Service Charge */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Service Charge (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.serviceChargePercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                serviceChargePercentage: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Default */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDefault}
            className="accent-custom-blue"
            onChange={(e) =>
              setFormData({ ...formData, isDefault: e.target.checked })
            }
          />
          <label className="text-sm font-medium">Set as Default</label>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 bg-custom-blue text-white rounded disabled:opacity-50"
          >
            {isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </SidebarPopup>
  );
};

export default RegionalTaxForm;
