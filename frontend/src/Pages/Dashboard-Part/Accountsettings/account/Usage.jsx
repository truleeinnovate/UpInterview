// v1.0.0 - Ashok - Added optional chaining (ex. property?.value)

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { usePermissions } from '../../../../Context/PermissionsContext';
import { usePermissionCheck } from '../../../../utils/permissionUtils';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';

const Usage = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  //const organization = tokenPayload?.organization;
  const tenantId = tokenPayload?.tenantId;
  console.log("tenantId", tenantId);
  
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();

  // Local state for usage API
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch usage when permissions are ready
  useEffect(() => {
    if (!isInitialized || !checkPermission("Usage")) return;

    const fetchUsage = async () => {
      try {
        setError(null);
        const url = `${process.env.REACT_APP_API_URL}/usage/${tenantId}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
            'x-permissions': JSON.stringify(effectivePermissions || {}),
          },
          withCredentials: true,
        });

        setUsage(res.data);
      } catch (err) {
        console.error('Error fetching usage:', err);
        setError('Failed to load usage');
      }
    };

    fetchUsage();
  }, [tenantId]);

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("Usage")) {
    return null;
  }

  // Derived metrics from API
  const interviewerAttrs = usage?.attributes?.filter(a => /Interviewer/i.test(a.type)) || [];
  const interviewerEntitled = interviewerAttrs.reduce((sum, a) => sum + (Number(a.entitled) || 0), 0);
  const interviewerUtilized = interviewerAttrs.reduce((sum, a) => sum + (Number(a.utilized) || 0), 0);

  const assessmentAttr = usage?.attributes?.find(a => (a.type || '').toLowerCase() === 'assessments');
  const assessmentsEntitled = Number(assessmentAttr?.entitled || 0);
  const assessmentsUtilized = Number(assessmentAttr?.utilized || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Analytics</h2>

      {/* Usage Period */}
      {/* v1.0.0 <------------------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Current Period</h3>
        <p className="text-gray-600 mt-2">
          {usage?.period?.fromDate || usage?.period?.toDate ? (
            `${new Date(usage?.period?.fromDate)?.toLocaleDateString()} to ${new Date(usage?.period?.toDate)?.toLocaleDateString()}`
          ) : (error || '—')}
        </p>
      </div>
      {/* v1.0.0 -------------------------------------------------------------------------> */}

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interviewers (Internal + Outsource) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Interviewers</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {interviewerUtilized}</span>
              <span className="text-gray-600">Limit: {interviewerEntitled}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-custom-blue rounded-full"
                style={{
                  width: `${interviewerEntitled > 0 ? Math.min((interviewerUtilized / interviewerEntitled) * 100, 100) : 0}%`
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
              <span className="text-gray-600">Limit: {assessmentsEntitled}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{
                  width: `${assessmentsEntitled > 0 ? Math.min((assessmentsUtilized / assessmentsEntitled) * 100, 100) : 0}%`
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
              <span className="text-gray-600">Value:</span>
              <span className="text-gray-600">{usage?.usersBandWidth ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Active Users</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Current: {usage?.currentUsers ?? '—'}</span>
          <span className="text-gray-600">Limit: {usage?.totalUsers ?? '—'}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-custom-blue rounded-full"
            // v1.0.0 <------------------------------------------------------------------------------------------
            style={{
              width: `${usage?.totalUsers ? Math.min((usage?.currentUsers / usage?.totalUsers) * 100, 100) : 0}%`
            }}
            // v1.0.0 ------------------------------------------------------------------------------------------>
          />
        </div>
      </div>

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
  )
}

export default Usage