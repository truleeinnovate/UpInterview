/* eslint-disable react/prop-types */
// v1.0.0 - Create/Edit Subscription Plan modal

import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup';
import { useScrollLock } from '../../../apiHooks/scrollHook/useScrollLock';

const defaultPricingRow = (cycle = 'monthly') => ({ billingCycle: cycle, price: '', discount: 0, discountType: 'flat', currency: 'USD' });
const defaultFeatureRow = () => ({ name: '', limit: '', description: '' });

export default function PlanFormModal({
  open,
  onClose,
  mode = 'create', // 'create' | 'edit'
  initialData = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    planId: '',
    name: '',
    description: '',
    subscriptionType: 'organization',
    active: true,
    isCustomizable: false,
    maxUsers: 1,
    trialPeriod: 0,
    razorpayPlanIds: { monthly: '', annual: '' },
    pricing: [defaultPricingRow('monthly'), defaultPricingRow('annual')],
    features: [defaultFeatureRow()],
  });
  const [errors, setErrors] = useState({});

  useScrollLock(true)

  useEffect(() => {
    if (open) {
      const data = initialData || {};
      setForm({
        planId: data.planId || '',
        name: data.name || '',
        description: data.description || '',
        subscriptionType: data.subscriptionType || 'organization',
        active: data.active ?? true,
        isCustomizable: data.isCustomizable ?? false,
        maxUsers: data.maxUsers ?? 1,
        trialPeriod: data.trialPeriod ?? 0,
        razorpayPlanIds: {
          monthly: data.razorpayPlanIds?.monthly || '',
          annual: data.razorpayPlanIds?.annual || '',
        },
        pricing: Array.isArray(data.pricing) && data.pricing.length > 0 ? data.pricing.map((p) => ({
          billingCycle: p.billingCycle || 'monthly',
          price: p.price ?? '',
          discount: p.discount ?? 0,
          discountType: p.discountType || 'flat',
          currency: p.currency || 'USD',
        })) : [defaultPricingRow('monthly'), defaultPricingRow('annual')],
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features.map((f) => ({
          name: f.name || '',
          limit: f.limit ?? '',
          description: f.description || '',
        })) : [defaultFeatureRow()],
      });
      setErrors({});
    }
  }, [open, initialData]);

  const title = useMemo(() => (mode === 'edit' ? 'Edit Plan' : 'Create Plan'), [mode]);

  const validate = () => {
    const e = {};
    if (!form.planId?.trim()) e.planId = 'Plan ID is required';
    if (!form.name?.trim()) e.name = 'Plan name is required';
    if (!form.subscriptionType?.trim()) e.subscriptionType = 'Type is required';

    const pricingErrors = [];
    form.pricing.forEach((p, idx) => {
      const pe = {};
      if (!p.billingCycle) pe.billingCycle = 'Billing cycle is required';
      if (p.price === '' || p.price === null || isNaN(Number(p.price))) pe.price = 'Valid price is required';
      if (!p.currency) pe.currency = 'Currency is required';
      pricingErrors[idx] = pe;
    });
    if (pricingErrors.some((pe) => Object.keys(pe).length)) e.pricing = pricingErrors;

    const featureErrors = [];
    form.features.forEach((f, idx) => {
      const fe = {};
      if (!f.name?.trim()) fe.name = 'Feature name is required';
      if (f.limit !== '' && f.limit !== null && isNaN(Number(f.limit))) fe.limit = 'Limit must be a number';
      featureErrors[idx] = fe;
    });
    if (featureErrors.some((fe) => Object.keys(fe).length)) e.features = featureErrors;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleRazorpayIdChange = (field, value) =>
    setForm((prev) => ({ ...prev, razorpayPlanIds: { ...prev.razorpayPlanIds, [field]: value } }));

  const handlePricingChange = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.pricing];
      next[idx] = { ...next[idx], [field]: field === 'price' || field === 'discount' ? (value === '' ? '' : Number(value)) : value };
      return { ...prev, pricing: next };
    });
  };
  const addPricing = () => setForm((prev) => ({ ...prev, pricing: [...prev.pricing, defaultPricingRow()] }));
  const removePricing = (idx) => setForm((prev) => ({ ...prev, pricing: prev.pricing.filter((_, i) => i !== idx) }));

  const handleFeatureChange = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[idx] = { ...next[idx], [field]: field === 'limit' ? (value === '' ? '' : Number(value)) : value };
      return { ...prev, features: next };
    });
  };
  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, defaultFeatureRow()] }));
  const removeFeature = (idx) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    // Convert empty limits to null
    payload.features = payload.features.map((f) => ({ ...f, limit: f.limit === '' ? null : f.limit }));
    await onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <SidebarPopup
            title={title}
            onClose={onClose}
    >

        <form onSubmit={submit}>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Basic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan ID<span className="text-red-500">*</span></label>
                <input value={form.planId} onChange={(e) => handleChange('planId', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                {errors.planId && <p className="text-xs text-red-600 mt-1">{errors.planId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Type<span className="text-red-500">*</span></label>
                <select value={form.subscriptionType} onChange={(e) => handleChange('subscriptionType', e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="organization">Organization</option>
                  <option value="individual">Individual</option>
                </select>
                {errors.subscriptionType && <p className="text-xs text-red-600 mt-1">{errors.subscriptionType}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="inline-flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />
                  <span className="text-sm">Active</span>
                </label>
                <label className="inline-flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={form.isCustomizable} onChange={(e) => handleChange('isCustomizable', e.target.checked)} />
                  <span className="text-sm">Customizable</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Users</label>
                <input type="number" value={form.maxUsers} onChange={(e) => handleChange('maxUsers', Number(e.target.value))} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trial Period (days)</label>
                <input type="number" value={form.trialPeriod} onChange={(e) => handleChange('trialPeriod', Number(e.target.value))} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">Pricing</h4>
                <button type="button" className="text-custom-blue text-sm inline-flex items-center gap-1" onClick={addPricing}><Plus className="w-4 h-4" /> Add</button>
              </div>
              <div className="mt-2 space-y-3">
                {form.pricing.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 border rounded p-2">
                    <div>
                      <label className="block text-xs text-gray-500">Billing Cycle</label>
                      <select value={p.billingCycle} onChange={(e) => handlePricingChange(idx, 'billingCycle', e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                      {errors.pricing?.[idx]?.billingCycle && <p className="text-xs text-red-600 mt-1">{errors.pricing[idx].billingCycle}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Price</label>
                      <input type="number" value={p.price} onChange={(e) => handlePricingChange(idx, 'price', e.target.value)} className="w-full border rounded px-2 py-1" />
                      {errors.pricing?.[idx]?.price && <p className="text-xs text-red-600 mt-1">{errors.pricing[idx].price}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Discount</label>
                      <input type="number" value={p.discount} onChange={(e) => handlePricingChange(idx, 'discount', e.target.value)} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Discount Type</label>
                      <select value={p.discountType} onChange={(e) => handlePricingChange(idx, 'discountType', e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="flat">Flat</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Currency</label>
                        <select value={p.currency} onChange={(e) => handlePricingChange(idx, 'currency', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                          <option value="EUR">EUR</option>
                        </select>
                        {errors.pricing?.[idx]?.currency && <p className="text-xs text-red-600 mt-1">{errors.pricing[idx].currency}</p>}
                      </div>
                      <button type="button" className="p-2 text-red-600 hover:bg-red-50 rounded self-end" onClick={() => removePricing(idx)}>
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
                <button type="button" className="text-custom-blue text-sm inline-flex items-center gap-1" onClick={addFeature}><Plus className="w-4 h-4" /> Add</button>
              </div>
              <div className="mt-2 space-y-3">
                {form.features.map((f, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded p-2">
                    <div>
                      <label className="block text-xs text-gray-500">Name</label>
                      <input value={f.name} onChange={(e) => handleFeatureChange(idx, 'name', e.target.value)} className="w-full border rounded px-2 py-1" />
                      {errors.features?.[idx]?.name && <p className="text-xs text-red-600 mt-1">{errors.features[idx].name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Limit</label>
                      <input type="number" value={f.limit} onChange={(e) => handleFeatureChange(idx, 'limit', e.target.value)} className="w-full border rounded px-2 py-1" />
                      {errors.features?.[idx]?.limit && <p className="text-xs text-red-600 mt-1">{errors.features[idx].limit}</p>}
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Description</label>
                        <input value={f.description} onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)} className="w-full border rounded px-2 py-1" />
                      </div>
                      <button type="button" className="p-2 text-red-600 hover:bg-red-50 rounded self-end" onClick={() => removeFeature(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Razorpay Plan IDs */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Razorpay Plan IDs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">Monthly Plan ID</label>
                  <input
                    value={form.razorpayPlanIds.monthly}
                    onChange={(e) => handleRazorpayIdChange('monthly', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="plan_xxxxx_monthly"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Annual Plan ID</label>
                  <input
                    value={form.razorpayPlanIds.annual}
                    onChange={(e) => handleRazorpayIdChange('annual', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="plan_xxxxx_annual"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
          <div className="flex justify-end gap-2 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-custom-blue/60 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/90'}`}>
              {mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
          </div>
        </form>
    </SidebarPopup>
  );
}
