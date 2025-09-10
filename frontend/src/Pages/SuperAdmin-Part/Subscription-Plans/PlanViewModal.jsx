/* eslint-disable react/prop-types */
// v1.1.0 - Polished, professional read-only view for subscription plan

import { format, parseISO, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup';



const formatDate = (dt) => {
  if (!dt) return 'N/A';
  const d = typeof dt === 'string' ? parseISO(dt) : dt;
  return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : 'N/A';
};

const formatMoney = (amount, currency) => {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  const cur = currency || '';
  return `${cur} ${num.toLocaleString()}`.trim();
};

export default function PlanViewModal({ open, onClose, plan }) {
  const navigate = useNavigate();
  if (!open || !plan) return null;

  return (
     <SidebarPopup
      title="Plan Details"
      onClose={onClose || (() => navigate(-1))}
    > 
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Header / Badges */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500">Plan</div>
                <div className="text-xl font-semibold text-gray-900">{plan.name || 'N/A'}</div>
                <div className="text-xs text-gray-500">ID: {plan.planId || 'N/A'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${plan.subscriptionType === 'organization' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {(plan.subscriptionType || 'N/A').toString().charAt(0).toUpperCase() + (plan.subscriptionType || 'N/A').toString().slice(1)}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${plan.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {plan.active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${plan.isCustomizable ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {plan.isCustomizable ? 'Customizable' : 'Fixed'}
                </span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Max Users</div>
                <div className="text-sm font-medium">{plan.maxUsers ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Trial Period</div>
                <div className="text-sm font-medium">{plan.trialPeriod ? `${plan.trialPeriod} days` : '—'}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm leading-relaxed text-gray-800">{plan.description || '—'}</div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Pricing</h4>
            {Array.isArray(plan.pricing) && plan.pricing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.pricing.map((p, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 capitalize">{p.billingCycle}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700">{p.currency || '—'}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{formatMoney(p.price, p.currency)}</div>
                    {(p.discount ?? 0) > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Discount: {p.discount}
                        {p.discountType === 'percentage' ? '%' : ''}{p.discountType === 'flat' && p.currency ? ` ${p.currency}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">—</div>
            )}
          </div>

          {/* Features */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Features</h4>
            {Array.isArray(plan.features) && plan.features.length > 0 ? (
              <ul className="space-y-2">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{f.name}</div>
                      {f.description && <div className="text-xs text-gray-500">{f.description}</div>}
                    </div>
                    {f.limit !== undefined && f.limit !== null && (
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs whitespace-nowrap">Limit: {f.limit}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">—</div>
            )}
          </div>

          {/* Razorpay Plan IDs */}
          {plan.razorpayPlanIds && (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Razorpay Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">Monthly</div>
                  <div className="font-mono break-all">{plan.razorpayPlanIds.monthly || '—'}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">Annual</div>
                  <div className="font-mono break-all">{plan.razorpayPlanIds.annual || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Metadata</h4>
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Created By</div>
                <div>{plan.createdBy || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Modified By</div>
                <div>{plan.modifiedBy || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created At</div>
                <div>{formatDate(plan.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Updated At</div>
                <div>{formatDate(plan.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
        </SidebarPopup>
  );
}
