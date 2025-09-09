/* eslint-disable react/prop-types */
// v1.0.0 - Read-only view modal for subscription plan

import { X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup';



const formatDate = (dt) => {
  if (!dt) return 'N/A';
  const d = typeof dt === 'string' ? parseISO(dt) : dt;
  return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : 'N/A';
};

export default function PlanViewModal({ open, onClose, plan }) {
  const navigate = useNavigate();
  if (!open || !plan) return null;
  const monthly = plan.pricing?.find((p) => p.billingCycle === 'monthly');
  const annual = plan.pricing?.find((p) => p.billingCycle === 'annual');

  return (
     <SidebarPopup
      title="Plan Details"
      onClose={() => navigate(-1)}
    > 
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Basic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Plan ID</div>
              <div className="text-sm font-medium">{plan.planId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="text-sm font-medium">{plan.name || 'N/A'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Description</div>
              <div className="text-sm">{plan.description || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Subscription Type</div>
              <div className="text-sm font-medium">{plan.subscriptionType || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Active</div>
              <div className="text-sm font-medium">{plan.active ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Customizable</div>
              <div className="text-sm font-medium">{plan.isCustomizable ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Max Users</div>
              <div className="text-sm font-medium">{plan.maxUsers ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Trial Period</div>
              <div className="text-sm font-medium">{plan.trialPeriod ? `${plan.trialPeriod} days` : '—'}</div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Pricing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded p-3">
                <div className="text-xs text-gray-500 mb-1">Monthly</div>
                <div className="text-sm">{monthly ? `${monthly.currency} ${monthly.price}` : '—'}</div>
                {monthly && (
                  <div className="text-xs text-gray-500">Discount: {monthly.discount} ({monthly.discountType})</div>
                )}
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-gray-500 mb-1">Annual</div>
                <div className="text-sm">{annual ? `${annual.currency} ${annual.price}` : '—'}</div>
                {annual && (
                  <div className="text-xs text-gray-500">Discount: {annual.discount} ({annual.discountType})</div>
                )}
              </div>
            </div>
            {/* Show all pricing rows if present */}
            {Array.isArray(plan.pricing) && plan.pricing.length > 2 && (
              <div className="mt-2 border rounded p-2">
                <div className="text-xs text-gray-500 mb-1">Other Pricing</div>
                <div className="space-y-1 text-sm">
                  {plan.pricing.filter((p) => !['monthly', 'annual'].includes(p.billingCycle)).map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="capitalize">{p.billingCycle}</span>
                      <span>{p.currency} {p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Features</h4>
            {Array.isArray(plan.features) && plan.features.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {plan.features.map((f, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{f.name}</span>
                    {f.limit !== undefined && f.limit !== null && ` - Limit: ${f.limit}`}
                    {f.description ? ` — ${f.description}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">—</div>
            )}
          </div>

          {/* Razorpay Plan IDs */}
          {plan.razorpayPlanIds && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Razorpay Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">Monthly</div>
                  <div className="font-mono">{plan.razorpayPlanIds.monthly || '—'}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">Annual</div>
                  <div className="font-mono">{plan.razorpayPlanIds.annual || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
        </SidebarPopup>
  );
}
