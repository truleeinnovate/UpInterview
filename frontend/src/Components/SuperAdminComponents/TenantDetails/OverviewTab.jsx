// v1.0.0 - Ashok - fixed an  unique "key" prop at recent activity
import { formatDate } from "../../../utils/dateUtils";
import {
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Hash,
  Mail,
  MapPin,
  Percent,
  Phone,
  RefreshCcw,
  User,
  UserCog,
  Users,
} from "lucide-react";

function OverviewTab({ tenant, viewMode = "expanded" }) {
  const cardBase = "card border border-gray-200 p-4 bg-white rounded-lg";
  const textSize = viewMode === "collapsed" ? "text-sm" : "text-base";
  const gridCols =
    viewMode === "collapsed"
      ? "grid-cols-1"
      : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  const capitalizeFirstLetter = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={`space-y-6 ${textSize} pb-6`}>
      <div className={`grid ${gridCols} gap-6 px-4 mt-4`}>
        {/* Tenant Info */}
        <div className={cardBase}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tenant Details
          </h3>

          <div
            className={`grid ${
              viewMode === "collapsed"
                ? "grid-cols-2 sm:grid-cols-1"
                : "grid-cols-1"
            } gap-6 text-sm`}
          >
            {/* Name */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium">
                  {capitalizeFirstLetter(tenant?.firstName)}{" "}
                  {capitalizeFirstLetter(tenant?.lastName)}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium">{tenant?.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="font-medium">
                  {tenant?.Phone || tenant?.phone || "Not Provided"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Address</span>
                <p className="font-medium">
                  {capitalizeFirstLetter(tenant?.address) || "Not Provided"}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Type</span>
                <p className="font-medium">
                  {capitalizeFirstLetter(tenant?.type)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p className="font-medium">
                  {capitalizeFirstLetter(tenant?.status) || "N/A"}
                </p>
              </div>
            </div>

            {/* Created & Updated */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Created At</span>
                <p className="font-medium">{formatDate(tenant?.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Updated At</span>
                <p className="font-medium">{formatDate(tenant?.updatedAt)}</p>
              </div>
            </div>

            {/* Created By & Owner */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Created By</span>
                <p className="font-medium">{tenant?.createdBy || "System"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Hash className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Owner ID</span>
                <p className="font-medium">{tenant?.ownerId}</p>
              </div>
            </div>

            {/* Bandwidth & Users */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Database className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Users Bandwidth</span>
                <p className="font-medium">{tenant?.usersBandWidth} GB</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Total Users</span>
                <p className="font-medium">{tenant?.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className={cardBase}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subscription
          </h3>

          <div
            className={`grid ${
              viewMode === "collapsed"
                ? "grid-cols-2 sm:grid-cols-1"
                : "grid-cols-1"
            } gap-6 text-sm`}
          >
            {/* Plan */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Plan</span>
                <p className="font-medium">
                  {tenant?.subscriptionPlan?.name || "Not Provided"}
                </p>
              </div>
            </div>

            {/* Start & End Dates */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Start Date</span>
                <p className="font-medium">
                  {formatDate(tenant?.startDate) || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">End Date</span>
                <p className="font-medium">{formatDate(tenant?.endDate)}</p>
              </div>
            </div>

            {/* Billing Cycle & Auto Renew */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Billing Cycle</span>
                <p className="font-medium capitalize">
                  {capitalizeFirstLetter(tenant?.selectedBillingCycle)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <RefreshCcw className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Auto Renew</span>
                <p className="font-medium">
                  {tenant?.autoRenew ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Billing & Payment */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Billing Email</span>
                <p className="font-medium">
                  {tenant?.billingEmail || tenant?.email || "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CalendarDays className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Next Billing Date</span>
                <p className="font-medium">
                  {formatDate(tenant?.nextBillingDate) || "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Hash className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Last Payment ID</span>
                <p className="font-medium">{tenant?.lastPaymentId || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <UserCog className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Razorpay Customer ID</span>
                <p className="font-medium">{tenant?.razorpayCustomerId}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Razorpay Subscription</span>
                <p className="font-medium">{tenant?.razorpaySubscriptionId}</p>
              </div>
            </div>

            {/* Financial Info */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <DollarSign className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Total Amount</span>
                <p className="font-medium">
                  ₹{tenant?.totalAmount?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Percent className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Discount</span>
                <p className="font-medium">{tenant?.discount || 0}%</p>
              </div>
            </div>

            {/* Licensed Users */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Licensed Users</span>
                <p className="font-medium">
                  {tenant?.users || tenant?.totalUsers || "Not Provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={cardBase}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
          <div className="space-y-2">
            {(tenant?.subscriptionPlan?.features || []).map(
              ({ name, description, limit, _id }) => {
                const enabled = !!limit && limit > 0;
                return (
                  <div key={_id} className="flex items-center">
                    <div
                      className={`h-4 w-4 rounded-full mr-2 ${
                        enabled ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={description}
                    ></div>
                    <span
                      className={enabled ? "text-gray-900" : "text-gray-500"}
                    >
                      {name}
                      {limit !== undefined && (
                        <span className="ml-2 text-sm text-gray-500 font-semibold">
                          ({limit})
                        </span>
                      )}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Activity */}
      {/* <div className={` ${cardBase} px-4`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {(tenant?.recentActivity || []).map((activity) => (
            <div key={activity?._id} className="flex">
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                {activity?.contact?.imageData?.path ? (
                  <img
                    src={activity?.contact?.imageData.path}
                    alt={activity.user}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-600 text-xs">
                    {(activity.user || "Not Provided")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{activity?.user || "Not Provided"}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {activity?.timestamp ? formatDate(activity?.timestamp) : "Not Provided"}
                  </span>
                </div>
                <p className="text-gray-700">{activity.details || "Not Provided"}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default OverviewTab;
