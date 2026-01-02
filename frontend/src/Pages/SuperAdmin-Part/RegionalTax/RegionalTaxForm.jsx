import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
// import { useRegionalTaxes } from "../../../apiHooks/useRegionalTaxes.js";
import { notify } from "../../../services/toastService.js";

const RegionalTaxForm = ({ onClose, mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  //   const { getRegionalTax, updateRegionalTax } = useRegionalTaxes();

  const [formData, setFormData] = useState({
    country: "",
    regionCode: "",
    currencyCode: "",
    gstPercentage: "",
    serviceChargePercentage: "",
    isDefault: false,
    status: "Active",
  });

  useEffect(() => {
    if (mode === "Edit" && id) {
      const fetchRegionalTax = async () => {
        try {
          //   const res = await getRegionalTax(id);
          //   const data = res?.regionalTax;
          const data = {};

          if (data) {
            setFormData({
              country: data.country || "",
              regionCode: data.regionCode || "",
              currencyCode: data.currency?.code || "",
              gstPercentage: data.gst?.percentage ?? "",
              serviceChargePercentage: data.serviceCharge?.percentage ?? "",
              isDefault: data.isDefault ?? false,
              status: data.status || "Active",
            });
          }
        } catch (error) {
          notify.error("Failed to fetch regional tax");
          onClose?.();
        }
      };

      fetchRegionalTax();
    }
  }, [mode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        country: formData.country,
        regionCode: formData.regionCode,
        currency: {
          code: formData.currencyCode,
        },
        gst: {
          percentage: Number(formData.gstPercentage),
        },
        serviceCharge: {
          percentage: Number(formData.serviceChargePercentage),
        },
        isDefault: formData.isDefault,
        status: formData.status,
      };

      if (mode === "Edit" && id) {
        // await updateRegionalTax({ id, updateData: payload });
        notify.success("Regional tax updated successfully");
      } else {
        // await updateRegionalTax(payload);
        notify.success("Regional tax created successfully");
      }

      navigate(-1);
    } catch (error) {
      notify.error("Failed to save regional tax");
    }
  };

  return (
    <SidebarPopup
      title={mode === "Edit" ? "Edit Regional Tax" : "Create Regional Tax"}
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
            placeholder="INR"
            value={formData.currencyCode}
            onChange={(e) =>
              setFormData({ ...formData, currencyCode: e.target.value })
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

        {/* Default Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDefault}
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
            className="px-4 py-2 bg-custom-blue text-white rounded"
          >
            {mode === "Edit" ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </SidebarPopup>
  );
};

export default RegionalTaxForm;
