/* eslint-disable react/prop-types */
// v1.0.0 - Create/Edit Subscription Plan modal

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { InputField, DescriptionField } from "../../../Components/FormFields";
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";

const defaultPricingRow = (cycle = "monthly") => ({
  billingCycle: cycle,
  price: "",
  discount: 0,
  discountType: "flat",
  currency: "USD",
});
const defaultFeatureRow = () => ({ name: "", limit: "", description: "" });

export default function PlanFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    planId: "",
    name: "",
    description: "",
    subscriptionType: "organization",
    active: true,
    isCustomizable: false,
    maxUsers: 1,
    trialPeriod: 0,
    razorpayPlanIds: { monthly: "", annual: "" },
    pricing: [defaultPricingRow("monthly"), defaultPricingRow("annual")],
    features: [defaultFeatureRow()],
  });
  const [errors, setErrors] = useState({});

  useScrollLock(true);

  useEffect(() => {
    if (open) {
      const data = initialData || {};
      setForm({
        planId: data.planId || "",
        name: data.name || "",
        description: data.description || "",
        subscriptionType: data.subscriptionType || "organization",
        active: data.active ?? true,
        isCustomizable: data.isCustomizable ?? false,
        maxUsers: data.maxUsers ?? 1,
        trialPeriod: data.trialPeriod ?? 0,
        razorpayPlanIds: {
          monthly: data.razorpayPlanIds?.monthly || "",
          annual: data.razorpayPlanIds?.annual || "",
        },
        pricing:
          Array.isArray(data.pricing) && data.pricing.length > 0
            ? data.pricing.map((p) => ({
                billingCycle: p.billingCycle || "monthly",
                price: p.price ?? "",
                discount: p.discount ?? 0,
                discountType: p.discountType || "flat",
                currency: p.currency || "USD",
              }))
            : [defaultPricingRow("monthly"), defaultPricingRow("annual")],
        features:
          Array.isArray(data.features) && data.features.length > 0
            ? data.features.map((f) => ({
                name: f.name || "",
                limit: f.limit ?? "",
                description: f.description || "",
              }))
            : [defaultFeatureRow()],
      });
      setErrors({});
    }
  }, [open, initialData]);

  const title = useMemo(
    () => (mode === "edit" ? "Edit Plan" : "Create Plan"),
    [mode],
  );

  const validate = () => {
    const e = {};
    if (!form.planId?.trim()) e.planId = "Plan ID is required";
    if (!form.name?.trim()) e.name = "Plan name is required";
    if (!form.subscriptionType?.trim()) e.subscriptionType = "Type is required";

    const pricingErrors = [];
    form.pricing.forEach((p, idx) => {
      const pe = {};
      if (!p.billingCycle) pe.billingCycle = "Billing cycle is required";
      if (p.price === "" || p.price === null || isNaN(Number(p.price)))
        pe.price = "Valid price is required";
      if (!p.currency) pe.currency = "Currency is required";
      pricingErrors[idx] = pe;
    });
    if (pricingErrors.some((pe) => Object.keys(pe).length))
      e.pricing = pricingErrors;

    const featureErrors = [];
    form.features.forEach((f, idx) => {
      const fe = {};
      if (!f.name?.trim()) fe.name = "Feature name is required";
      if (f.limit !== "" && f.limit !== null && isNaN(Number(f.limit)))
        fe.limit = "Limit must be a number";
      featureErrors[idx] = fe;
    });
    if (featureErrors.some((fe) => Object.keys(fe).length))
      e.features = featureErrors;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const handleRazorpayIdChange = (field, value) =>
    setForm((prev) => ({
      ...prev,
      razorpayPlanIds: { ...prev.razorpayPlanIds, [field]: value },
    }));

  const handlePricingChange = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.pricing];
      next[idx] = {
        ...next[idx],
        [field]:
          field === "price" || field === "discount"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };
      return { ...prev, pricing: next };
    });
  };
  const addPricing = () =>
    setForm((prev) => ({
      ...prev,
      pricing: [...prev.pricing, defaultPricingRow()],
    }));
  const removePricing = (idx) =>
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== idx),
    }));

  const handleFeatureChange = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[idx] = {
        ...next[idx],
        [field]:
          field === "limit" ? (value === "" ? "" : Number(value)) : value,
      };
      return { ...prev, features: next };
    });
  };
  const addFeature = () =>
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, defaultFeatureRow()],
    }));
  const removeFeature = (idx) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    // Convert empty limits to null
    payload.features = payload.features.map((f) => ({
      ...f,
      limit: f.limit === "" ? null : f.limit,
    }));
    await onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <SidebarPopup title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField
                name="planId"
                label="Plan ID"
                required
                placeholder="Eg: PlanName-000"
                value={form.planId}
                onChange={(e) => handleChange("planId", e.target.value)}
                error={errors.planId}
              />
            </div>
            <div>
              <InputField
                name="name"
                label="Name"
                required
                placeholder="Enter Plan Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
              />
            </div>
            <div className="md:col-span-2">
              <DescriptionField
                name="description"
                label="Description"
                placeholder="This plan is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Type
              </label>
              <DropdownSelect
                isSearchable={false}
                options={[
                  { value: "organization", label: "Organization" },
                  { value: "individual", label: "Individual" },
                ]}
                hasError={!!errors.subscriptionType}
                value={
                  [
                    { value: "organization", label: "Organization" },
                    { value: "individual", label: "Individual" },
                  ].find((o) => o.value === form.subscriptionType) || null
                }
                onChange={(opt) =>
                  handleChange("subscriptionType", opt?.value || "")
                }
                classNamePrefix="rs"
              />
              {errors.subscriptionType && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.subscriptionType}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 mt-6">
                <input
                  className="accent-custom-blue"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => handleChange("active", e.target.checked)}
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="inline-flex items-center gap-2 mt-6">
                <input
                  className="accent-custom-blue"
                  type="checkbox"
                  checked={form.isCustomizable}
                  onChange={(e) =>
                    handleChange("isCustomizable", e.target.checked)
                  }
                />
                <span className="text-sm">Customizable</span>
              </label>
            </div>
            <div>
              <InputField
                name="maxUsers"
                label="Max Users"
                type="number"
                min={1}
                step={1}
                value={form.maxUsers}
                onChange={(e) =>
                  handleChange("maxUsers", Number(e.target.value))
                }
              />
            </div>
            <div>
              <InputField
                name="trialPeriod"
                label="Trial Period (days)"
                type="number"
                min={0}
                step={1}
                value={form.trialPeriod}
                onChange={(e) =>
                  handleChange("trialPeriod", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">Pricing</h4>
              <button
                type="button"
                className="text-custom-blue text-sm inline-flex items-center gap-1"
                onClick={addPricing}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="mt-2 space-y-3">
              {form.pricing.map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 border rounded p-2"
                >
                  <div>
                    <label className="block text-xs text-gray-500 pb-2">
                      Billing Cycle
                    </label>
                    <DropdownSelect
                      isSearchable={false}
                      options={[
                        { value: "monthly", label: "Monthly" },
                        { value: "quarterly", label: "Quarterly" },
                        { value: "annual", label: "Annual" },
                      ]}
                      hasError={!!errors.pricing?.[idx]?.billingCycle}
                      value={
                        [
                          { value: "monthly", label: "Monthly" },
                          { value: "quarterly", label: "Quarterly" },
                          { value: "annual", label: "Annual" },
                        ].find((o) => o.value === p.billingCycle) || null
                      }
                      onChange={(opt) =>
                        handlePricingChange(
                          idx,
                          "billingCycle",
                          opt?.value || "",
                        )
                      }
                      classNamePrefix="rs"
                    />
                    {errors.pricing?.[idx]?.billingCycle && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.pricing[idx].billingCycle}
                      </p>
                    )}
                  </div>
                  <div>
                    <InputField
                      name={`price_${idx}`}
                      label="Price"
                      type="number"
                      value={p.price}
                      onChange={(e) =>
                        handlePricingChange(idx, "price", e.target.value)
                      }
                      error={errors.pricing?.[idx]?.price}
                      className="!py-1 !px-2"
                    />
                  </div>
                  <div>
                    <InputField
                      name={`discount_${idx}`}
                      label="Discount"
                      type="number"
                      value={p.discount}
                      onChange={(e) =>
                        handlePricingChange(idx, "discount", e.target.value)
                      }
                      className="!py-1 !px-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      Discount Type
                    </label>
                    <DropdownSelect
                      isSearchable={false}
                      options={[
                        { value: "flat", label: "Flat" },
                        { value: "percentage", label: "Percentage" },
                      ]}
                      value={
                        [
                          { value: "flat", label: "Flat" },
                          { value: "percentage", label: "Percentage" },
                        ].find((o) => o.value === p.discountType) || null
                      }
                      onChange={(opt) =>
                        handlePricingChange(
                          idx,
                          "discountType",
                          opt?.value || "",
                        )
                      }
                      classNamePrefix="rs"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">
                        Currency
                      </label>
                      <DropdownSelect
                        isSearchable={false}
                        options={[
                          { value: "USD", label: "USD" },
                          { value: "INR", label: "INR" },
                          { value: "EUR", label: "EUR" },
                        ]}
                        hasError={!!errors.pricing?.[idx]?.currency}
                        value={
                          [
                            { value: "USD", label: "USD" },
                            { value: "INR", label: "INR" },
                            { value: "EUR", label: "EUR" },
                          ].find((o) => o.value === p.currency) || null
                        }
                        onChange={(opt) =>
                          handlePricingChange(idx, "currency", opt?.value || "")
                        }
                        classNamePrefix="rs"
                      />
                      {errors.pricing?.[idx]?.currency && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.pricing[idx].currency}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="p-2 text-red-600 hover:bg-red-50 rounded self-end"
                      onClick={() => removePricing(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">Features</h4>
              <button
                type="button"
                className="text-custom-blue text-sm inline-flex items-center gap-1"
                onClick={addFeature}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="mt-2 space-y-3">
              {form.features.map((f, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded p-2"
                >
                  <div>
                    <InputField
                      name={`feature_name_${idx}`}
                      label="Name"
                      value={f.name}
                      onChange={(e) =>
                        handleFeatureChange(idx, "name", e.target.value)
                      }
                      error={errors.features?.[idx]?.name}
                      className="!py-1 !px-2"
                    />
                  </div>
                  <div>
                    <InputField
                      name={`feature_limit_${idx}`}
                      label="Limit"
                      type="number"
                      value={f.limit}
                      onChange={(e) =>
                        handleFeatureChange(idx, "limit", e.target.value)
                      }
                      error={errors.features?.[idx]?.limit}
                      className="!py-1 !px-2"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <InputField
                        name={`feature_description_${idx}`}
                        label="Description"
                        value={f.description}
                        onChange={(e) =>
                          handleFeatureChange(
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                        className="!py-1 !px-2"
                      />
                    </div>
                    <button
                      type="button"
                      className="p-2 text-red-600 hover:bg-red-50 rounded self-end"
                      onClick={() => removeFeature(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Razorpay Plan IDs */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Razorpay Plan IDs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <InputField
                  name="razorpay_monthly"
                  label="Monthly Plan ID"
                  value={form.razorpayPlanIds.monthly}
                  onChange={(e) =>
                    handleRazorpayIdChange("monthly", e.target.value)
                  }
                  placeholder="plan_xxxxx_monthly"
                />
              </div>
              <div>
                <InputField
                  name="razorpay_annual"
                  label="Annual Plan ID"
                  value={form.razorpayPlanIds.annual}
                  onChange={(e) =>
                    handleRazorpayIdChange("annual", e.target.value)
                  }
                  placeholder="plan_xxxxx_annual"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? "bg-custom-blue/60 cursor-not-allowed" : "bg-custom-blue hover:bg-custom-blue/90"}`}
            >
              {mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </SidebarPopup>
  );
}
