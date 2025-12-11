// v1.0.0 - Ashok - fixed an  unique "key" prop at recent activity
// v1.0.1 - Ashok - Added some more fields and displayed based on type of tenant and color circle for features
// v1.0.2 - Ashok - commented ownerId because owner and tenant is same

import { formatDate } from "../../../utils/dateUtils";
import {
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Factory,
  Globe2,
  Hash,
  Laptop,
  Mail,
  MapPin,
  Percent,
  Phone,
  RefreshCcw,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import CompletionTracker from "../../../Pages/SuperAdmin-Part/Tenant/ComletionTracker";

function OverviewTab({ tenant, viewMode = "expanded" }) {
  const cardBase = "card border border-gray-200 p-4 bg-white rounded-lg";
  const textSize = viewMode === "collapsed" ? "text-sm" : "text-base";
  const gridCols =
    viewMode === "collapsed"
      ? "grid-cols-1"
      : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  const InfoField = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-6">
      <div className="p-2 bg-custom-bg rounded-lg">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      <div>
        <span className="text-gray-500">{label}</span>
        <div className="font-medium mt-0.5 text-gray-800">
          {children || "N/A"}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${textSize} pb-6`}>
      <div>
        {tenant?.type === "individual" && (
          <CompletionTracker
            completionStatus={tenant?.contact?.completionStatus}
            stepsToShow={tenant?.user?.isFreelancer ? 4 : 2}
          />
        )}
      </div>
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
            {(tenant?.firstName || tenant?.lastName) && (
              <InfoField icon={User} label="Name">
                <div className="flex items-center gap-1 font-medium">
                  <span>{capitalizeFirstLetter(tenant?.firstName || "")}</span>
                  <span>{capitalizeFirstLetter(tenant?.lastName || "")}</span>
                </div>
              </InfoField>
            )}

            {/* Email */}
            {tenant?.email && (
              <InfoField icon={Mail} label="Email">
                {tenant.email}
              </InfoField>
            )}

            {/* Phone (Org only) */}
            {tenant?.type === "organization" && tenant?.phone && (
              <InfoField icon={Phone} label="Phone">
                {tenant.phone}
              </InfoField>
            )}

            {/* Job Title (Org only) */}
            {tenant?.type === "organization" && tenant?.jobTitle && (
              <InfoField icon={Briefcase} label="Job Title">
                {capitalizeFirstLetter(tenant.jobTitle)}
              </InfoField>
            )}

            {/* Freelancer (Individual only) */}
            {tenant?.type === "individual" && tenant?.user && (
              <InfoField icon={Laptop} label="Freelancer">
                {tenant?.user?.isFreelancer ? "Yes" : "No"}
              </InfoField>
            )}

            {/* Company (Org only) */}
            {tenant?.type === "organization" && tenant?.company && (
              <InfoField icon={Factory} label="Company">
                {capitalizeFirstLetter(tenant.company)}
              </InfoField>
            )}

            {/* Employees (Org only) */}
            {tenant?.type === "organization" && tenant?.employees && (
              <InfoField icon={Users} label="Employees">
                {tenant.employees}
              </InfoField>
            )}

            {/* Country (Org only) */}
            {tenant?.type === "organization" && tenant?.country && (
              <InfoField icon={Globe2} label="Country">
                {tenant.country}
              </InfoField>
            )}

            {/* Offices (If Any) */}
            {tenant?.offices?.length > 0 && (
              <InfoField icon={Building} label="Offices">
                <div className="font-medium mt-1 space-y-1">
                  {tenant.offices.map((office, index) => (
                    <p
                      key={office.id || index}
                      className="text-sm text-gray-800"
                    >
                      <span className="font-semibold">
                        {office.type || `Office ${index + 1}`}:
                      </span>{" "}
                      {office.address
                        ? `${office.address}, ${office.city}, ${office.state}, ${office.country} - ${office.zip}`
                        : "Address not available"}
                      {office.phone && (
                        <span className="block text-gray-500 text-xs mt-0.5">
                          <Phone className="w-4 h-4 inline-block mr-1" />
                          {office.phone}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </InfoField>
            )}

            {/* Address (if exists) */}
            {tenant?.address && (
              <InfoField icon={MapPin} label="Address">
                {capitalizeFirstLetter(tenant.address)}
              </InfoField>
            )}

            {/* Type */}
            <InfoField icon={Building2} label="Type">
              {capitalizeFirstLetter(tenant?.type)}
            </InfoField>

            {/* Users Bandwidth */}
            {tenant?.usersBandWidth && (
              <InfoField icon={Database} label="Users Bandwidth">
                {tenant.usersBandWidth} GB
              </InfoField>
            )}

            {/* Total Users */}
            {tenant?.totalUsers !== undefined && (
              <InfoField icon={Users} label="Total Users">
                {tenant.totalUsers}
              </InfoField>
            )}

            {/* Created At */}
            {tenant?.createdAt && (
              <InfoField icon={Calendar} label="Created At">
                {formatDate(tenant.createdAt)}
              </InfoField>
            )}

            {/* Updated At */}
            {tenant?.updatedAt && (
              <InfoField icon={Calendar} label="Updated At">
                {formatDate(tenant.updatedAt)}
              </InfoField>
            )}
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
                  {capitalizeFirstLetter(tenant?.selectedBillingCycle) ||
                    "Not Provided"}
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
                <p className="font-medium">
                  {tenant?.lastPaymentId || "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <UserCog className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Razorpay Customer ID</span>
                <p className="font-medium">
                  {tenant?.razorpayCustomerId || "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-gray-500">Razorpay Subscription</span>
                <p className="font-medium">
                  {tenant?.razorpaySubscriptionId || "Not Provided"}
                </p>
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
            {tenant?.subscriptionPlan?.features?.length > 0 ? (
              tenant.subscriptionPlan.features.map(
                ({ name, description, limit, _id }) => (
                  <div key={_id} className="flex items-center">
                    {/* Always green circle */}
                    <div
                      className="h-4 w-4 rounded-full mr-2 bg-green-500"
                      title={description}
                    ></div>

                    {/* Always green text */}
                    <span className="text-gray-900">
                      {name}
                      {limit !== undefined && (
                        <span className="ml-2 text-sm text-green-600 font-semibold">
                          ({limit})
                        </span>
                      )}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-gray-500 font-medium">Not Features Provided</p>
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
