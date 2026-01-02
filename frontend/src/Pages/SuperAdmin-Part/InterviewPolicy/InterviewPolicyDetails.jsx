import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Clock,
  Percent,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Info,
} from "lucide-react";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { useInterviewPolicies } from "../../../apiHooks/useInterviewPolicies.js";

const InterviewPolicyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { getPolicy, isLoading } = useInterviewPolicies();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPolicy = async () => {
      try {
        const response = await getPolicy(id);
        setPolicy(response?.policy);
      } catch (err) {
        console.error("Failed to fetch policy", err);
      }
    };

    fetchPolicy();
  }, [id, getPolicy]);

  if (isLoading) {
    return (
      <SidebarPopup title="Interview Policy Details">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-6 w-2/3 rounded" />
            <div className="shimmer h-4 w-20 rounded-full" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="shimmer h-3 w-32 rounded" />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="shimmer h-4 w-4 rounded-full" />
                    <div className="shimmer h-3 w-28 rounded" />
                  </div>
                  <div className="shimmer h-3 w-16 rounded" />
                </div>
              ))}
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="shimmer h-3 w-32 rounded" />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="shimmer h-4 w-4 rounded-full" />
                    <div className="shimmer h-3 w-28 rounded" />
                  </div>
                  <div className="shimmer h-3 w-12 rounded" />
                </div>
              ))}
            </div>

            {/* Full Width Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden md:col-span-2">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="shimmer h-3 w-48 rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shimmer h-4 w-4 rounded-full" />
                      <div className="shimmer h-3 w-32 rounded" />
                    </div>
                    <div className="shimmer h-3 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center pt-4">
            <div className="shimmer h-3 w-64 rounded" />
          </div>
        </div>
      </SidebarPopup>
    );
  }

  // Helper to render rows
  const DetailRow = ({ icon: Icon, label, value, color = "text-gray-500" }) => (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={18} className={color} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );

  return (
    <SidebarPopup
      title="Interview Policy Details"
      id={id}
      showEdit={true}
      editPath={`/interview-policy/edit`}
      onClose={() => navigate(-1)}
    >
      <div className="p-4 space-y-6">
        {/* Header Card */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} className="text-custom-blue" />
            <h3 className="font-bold text-custom-blue uppercase text-xs tracking-wider">
              Policy Name
            </h3>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {policy?.policyName?.replace(/_/g, " ")}
          </p>
          <div>
            {<StatusBadge status={capitalizeFirstLetter(policy?.status)} />}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                General Config
              </h4>
            </div>
            <DetailRow
              icon={ShieldCheck}
              label="Category"
              value={policy?.category}
            />
            <DetailRow icon={Info} label="Type" value={policy?.type} />
            <DetailRow
              icon={Calendar}
              label="Free Reschedule"
              value={policy?.firstRescheduleFree ? "Yes" : "No"}
            />
          </div>

          {/* Pricing & Fees */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                Fees & Payouts
              </h4>
            </div>
            <DetailRow
              icon={Percent}
              label="Fee Percentage"
              value={`${policy?.feePercentage}%`}
            />
            <DetailRow
              icon={Percent}
              label="Platform Fee"
              value={`${policy?.platformFeePercentage}%`}
            />
            <DetailRow
              icon={CheckCircle2}
              label="GST Included"
              value={policy?.gstIncluded ? "Yes" : "No"}
            />
          </div>

          {/* Timing Rules */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden md:col-span-2">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                Timeline Constraints (Minutes)
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <DetailRow
                icon={Clock}
                label="Min Time Before"
                value={`${policy?.timeBeforeInterviewMin} mins`}
              />
              <DetailRow
                icon={Clock}
                label="Max Time Before"
                value={`${policy?.timeBeforeInterviewMax} mins`}
              />
            </div>
          </div>
        </div>

        {/* Footer Timestamps */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Created: {new Date(policy?.createdAt)?.toLocaleString()} | ID:{" "}
            {policy?._id}
          </p>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default InterviewPolicyDetails;
