/* eslint-disable react/prop-types */
// v1.0.0 - Kanban cards for subscription plans (super admin)
// v1.0.1 - Ashok - done alignments

import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  BadgePercent,
  Users,
  CalendarDays,
  XCircle,
  CheckCircle2,
  Clock,
  CircleDot,
} from "lucide-react";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { format, parseISO, isValid } from "date-fns";
import { formatDateTime } from "../../../utils/dateFormatter";

const currencyDisplay = (p) => `${p?.currency || ""} ${p?.price ?? ""}`.trim();

const formatDate = (dt) => {
  if (!dt) return "N/A";
  const d = typeof dt === "string" ? parseISO(dt) : dt;
  return isValid(d) ? format(d, "MMM dd, yyyy") : "N/A";
};

export default function PlanKanbanView({
  currentPlans = [],
  plans = [],
  loading = false,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  canEdit = false,
  canDelete = false,
}) {
  if (loading) {
    return (
      <motion.div className="w-full bg-gray-50 rounded-xl p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 animate-pulse h-60"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-[400px] bg-gray-50 rounded-xl"
    >
      <div className="flex items-center justify-between mb-3 px-6 pt-3">
        <h3 className="text-xl font-semibold text-gray-800">All Plans</h3>
        <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
          {plans?.length} Plans
        </span>
      </div>

      {currentPlans.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
          <XCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Plans Found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Try adjusting filters or create a new plan.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-15.5rem)] px-6 pb-16">
          <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
            {currentPlans.map((plan, index) => {
              const monthly = plan.pricing?.find(
                (p) => p.billingCycle === "monthly"
              );
              const annual = plan.pricing?.find(
                (p) => p.billingCycle === "annual"
              );
              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                      <h4
                        className="text-lg font-semibold text-custom-blue truncate cursor-pointer"
                        onClick={() => onView(plan)}
                      >
                        {plan.name || "N/A"}
                      </h4>
                      <div className="text-xs text-gray-500">
                        ID: {plan.planId || "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        title="View"
                        onClick={() => onView(plan)}
                        className="p-2 text-custom-blue hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button
                          title="Edit"
                          onClick={() => onEdit(plan)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          title="Delete"
                          onClick={() => onDelete(plan)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="grid grid-cols-2 text-gray-700">
                      <div className="flex items-center gap-1">
                        <BadgePercent className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Monthly</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {monthly ? currencyDisplay(monthly) : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 text-gray-700">
                      <div className="flex items-center gap-1">
                        <BadgePercent className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Annual</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {annual ? currencyDisplay(annual) : "—"}
                        </div>
                      </div>
                    </div>
                    {/* <div className="grid grid-cols-2 text-gray-700">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Max Users</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {plan.maxUsers ?? "—"}
                        </div>
                      </div>
                    </div> */}
                    {/* <div className="grid grid-cols-2 text-gray-700">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Trial</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {plan.trialPeriod ? `${plan.trialPeriod} days` : "—"}
                        </div>
                      </div>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-1">
                    <div className="mt-3 grid grid-cols-2 items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CircleDot className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">
                          Subscription Type
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                          {(plan.subscriptionType || "")
                            .charAt(0)
                            .toUpperCase() +
                            (plan.subscriptionType || "").slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 items-center">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Status</div>
                      </div>
                      <div className="flex justify-start">
                        <StatusBadge
                          status={plan.active ? "active" : "inactive"}
                          text={plan.active ? "Active" : "Inactive"}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 items-center">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">Updated At</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(plan.updatedAt)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
