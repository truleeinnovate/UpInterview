// v1.0.0 - Ashok - Added optional chaining (ex. property?.value)

/* eslint-disable react-hooks/exhaustive-deps */
//<----v1.0.0---Venkatesh---add loading skelton view and api loading issues solved
// v1.0.2 - Ashok - Improved responsiveness

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../utils/permissionUtils";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";

const Usage = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const tenantId = tokenPayload?.tenantId;
  console.log("tenantId", tenantId);

  // Helper function to format date as dd-mm-yy
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    
    return `${dd}-${mm}-${yy}`;
  };

  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();

  // Local state for usage API
  const [usage, setUsage] = useState({});
  console.log("usage--", usage);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch usage when permissions are ready
  useEffect(() => {
    // Wait until permissions are initialized
    if (!isInitialized) return;

    // Ensure the user has access to Usage
    if (!checkPermission("Usage")) return;

    // Guard: tenantId must be available to build the API URL
    if (!tenantId) {
      console.warn("Usage: tenantId is missing; skipping fetch");
      setError("Missing tenant information");
      return;
    }

    const fetchUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${process.env.REACT_APP_API_URL}/usage/${tenantId}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "x-permissions": JSON.stringify(effectivePermissions || {}),
          },
          withCredentials: true,
        });

        setUsage(res.data);
      } catch (err) {
        console.error("Error fetching usage:", err);
        setError("Failed to load usage");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [isInitialized, effectivePermissions, authToken, tenantId]);

  // v1.0.2 <------------------------------------------------------------------------
  // Loading skeleton view (initializing or fetching)
  // if (!isInitialized || loading) {
  //   return (
  //     <div className="space-y-6 animate-pulse">
  //       <div className="h-8 w-48 bg-gray-200 rounded" />

  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <div className="h-5 w-40 bg-gray-200 rounded" />
  //         <div className="mt-3 h-4 w-64 bg-gray-200 rounded" />
  //       </div>

  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //         {[1,2,3].map((i) => (
  //           <div key={i} className="bg-white p-6 rounded-lg shadow">
  //             <div className="h-5 w-36 bg-gray-200 rounded" />
  //             <div className="mt-3 h-4 w-full bg-gray-200 rounded" />
  //             <div className="mt-2 h-2 w-full bg-gray-200 rounded-full" />
  //           </div>
  //         ))}
  //       </div>

  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
  //         <div className="h-4 w-80 bg-gray-200 rounded mb-3" />
  //         <div className="h-2 w-full bg-gray-200 rounded-full" />
  //       </div>
  //     </div>
  //   );
  // }

  if (!isInitialized || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded shimmer" />

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-5 w-40 bg-gray-200 rounded shimmer" />
          <div className="mt-3 h-4 w-64 bg-gray-200 rounded shimmer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-5 w-36 bg-gray-200 rounded shimmer" />
              <div className="mt-3 h-4 w-full bg-gray-200 rounded shimmer" />
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full shimmer" />
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4 shimmer" />
          <div className="h-4 w-80 bg-gray-200 rounded mb-3 shimmer" />
          <div className="h-2 w-full bg-gray-200 rounded-full shimmer" />
        </div>
      </div>
    );
  }
  // v1.0.2 ------------------------------------------------------------------------>


  // Permission check after initialization
  if (!checkPermission("Usage")) {
    return null;
  }

  // Derived metrics from API (matches both "Internal Interviews" and any future interview types)
  const interviewerAttrs =
    usage?.attributes?.filter((a) => /Interview/i.test(a.type)) || [];
  const interviewerEntitled = interviewerAttrs.reduce(
    (sum, a) => sum + (Number(a.entitled) || 0),
    0
  );
  const interviewerUtilized = interviewerAttrs.reduce(
    (sum, a) => sum + (Number(a.utilized) || 0),
    0
  );

  const assessmentAttr = usage?.attributes?.find(
    (a) => (a.type || "").toLowerCase() === "assessments"
  );
  const assessmentsEntitled = Number(assessmentAttr?.entitled || 0);
  const assessmentsUtilized = Number(assessmentAttr?.utilized || 0);

  return (
    <div className="sm:mx-2 sm:mt-8 space-y-6">
      {/* v1.0.2 <------------------------------------------------------- */}
      <h2 className="sm:text-xl text-2xl font-bold">Usage Analytics</h2>
      {/* v1.0.2 ------------------------------------------------------- */}

      {/* Usage Period */}
      {/* v1.0.0 <------------------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Current Period</h3>
        <p className="text-gray-600 mt-2">
          {usage?.period?.fromDate || usage?.period?.toDate
            ? `${formatDate(usage?.period?.fromDate)} to ${formatDate(usage?.period?.toDate)}`
            : error || "—"}
        </p>
      </div>
      {/* v1.0.0 -------------------------------------------------------------------------> */}

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interviewers (Internal + Outsource) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Internal Interviews</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {interviewerUtilized}</span>
              <span className="text-gray-600">
                Limit: {interviewerEntitled}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-custom-blue rounded-full"
                style={{
                  width: `${
                    interviewerEntitled > 0
                      ? Math.min(
                          (interviewerUtilized / interviewerEntitled) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Assessments</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {assessmentsUtilized}</span>
              <span className="text-gray-600">
                Limit: {assessmentsEntitled}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{
                  width: `${
                    assessmentsEntitled > 0
                      ? Math.min(
                          (assessmentsUtilized / assessmentsEntitled) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* User Bandwidth */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">User Bandwidth</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">GB:</span>
              <span className="text-gray-600">
                {usage?.usersBandWidth ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
    {organization && (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Active Users</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">
            Current: {usage?.currentUsers ?? "—"}
          </span>
          <span className="text-gray-600">
            Limit: {usage?.totalUsers ?? "—"}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-custom-blue rounded-full"
            // v1.0.0 <------------------------------------------------------------------------------------------
            style={{
              width: `${
                usage?.totalUsers
                  ? Math.min(
                      (usage?.currentUsers / usage?.totalUsers) * 100,
                      100
                    )
                  : 0
              }%`,
            }}
            // v1.0.0 ------------------------------------------------------------------------------------------>
          />
        </div>
      </div>
    )}

      {/* Usage Trends */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
      {/* Interview Trend */}
      {/* <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Interview Trend</h3>
          <div className="space-y-2">
            {usageMetrics.interviews.breakdown.map((day, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium">{day.count} interviews</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-custom-blue rounded-full"
                    style={{
                      width: `${(day.count / Math.max(...usageMetrics.interviews.breakdown.map(d => d.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div> */}

      {/* Assessment Trend */}
      {/* <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Assessment Trend</h3>
          <div className="space-y-2">
            {usageMetrics.assessments.breakdown.map((day, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium">{day.count} assessments</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{
                      width: `${(day.count / Math.max(...usageMetrics.assessments.breakdown.map(d => d.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default Usage;

//-----v1.0.0-------->
