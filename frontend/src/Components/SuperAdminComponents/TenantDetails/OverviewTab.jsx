// v1.0.0 - Ashok - fixed an  unique "key" prop at recent activity
import { formatDate } from "../../../utils/dateUtils";

function OverviewTab({ tenant, viewMode = "expanded" }) {
  console.log('OVERVIEW TAB TENANT =================> : ', tenant);
  const cardBase = "card";
  const textSize = viewMode === "collapsed" ? "text-sm" : "text-base";
  const gridCols =
    viewMode === "collapsed"
      ? "grid-cols-1"
      : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  return (
    <div className={`space-y-6 ${textSize} pb-6`}>
      <div className={`grid ${gridCols} gap-6 px-4 mt-4`}>
        {/* Tenant Info */}
        <div className={cardBase}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tenant Details
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Contact Name</span>
              <p className="font-medium">{tenant?.firstName || ""}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Contact Email</span>
              <p className="font-medium">
                {tenant?.email || tenant?.Email || ""}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Contact Phone</span>
              <p className="font-medium">
                {tenant?.Phone || tenant?.phone || ""}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Address</span>
              <p className="font-medium">{tenant?.address || ""}</p>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className={cardBase}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subscription
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Plan</span>
              <p className="font-medium">
                {tenant?.subscriptionPlan?.name || "Not Provided"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Billing Email</span>
              <p className="font-medium">
                {tenant?.billingEmail || "Not Provided"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Renewal Date</span>
              <p className="font-medium">
                {tenant?.nextBillingDate
                  ? formatDate(tenant?.nextBillingDate)
                  : "Not Provided"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Licensed Users</span>
              <p className="font-medium">{tenant?.users || "Not Provided"}</p>
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
      <div className={` ${cardBase} px-4`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {(tenant?.recentActivity || []).map((activity) => (
            // v1.0.0 <----------------------------------------------------------------------------------------------------
            <div key={activity?._id} className="flex">
            {/* v1.0.0 ---------------------------------------------------------------------------------------------------> */}
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
      </div>
    </div>
  );
}

export default OverviewTab;
