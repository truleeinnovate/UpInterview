import { useEffect } from "react";
import { Outlet } from "react-router-dom";
// import { useAuth } from "../../Context/AuthContext";
import MetricsOverview from "../../Components/SuperAdminComponents/Dashboard/MetricsOverview";
import RecentActivity from "../../Components/SuperAdminComponents/Dashboard/RecentActivity";
import TenantMetricsChart from "../../Components/SuperAdminComponents/Dashboard/TenantMetricsChart";
import { AlertTriangle } from "lucide-react";

function Dashboard() {
  // const { user, hasRole } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | Admin Portal";
  }, []);

  const renderSuperAdminContent = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5" />
            <h3 className="text-sm font-medium text-yellow-800">
              System Health
            </h3>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-yellow-600">API Status: Operational</p>
            <p className="text-sm text-yellow-600">Database Load: 42%</p>
            <p className="text-sm text-yellow-600">Storage Usage: 68%</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800">License Usage</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-green-600">Total Licenses: 1000</p>
            <p className="text-sm text-green-600">Active: 824</p>
            <p className="text-sm text-green-600">Available: 176</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">API Usage</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-blue-600">Total Requests: 1.2M</p>
            <p className="text-sm text-blue-600">Success Rate: 99.9%</p>
            <p className="text-sm text-blue-600">Avg Response: 120ms</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800">Security</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-purple-600">Failed Logins: 23</p>
            <p className="text-sm text-purple-600">Active Sessions: 156</p>
            <p className="text-sm text-purple-600">2FA Enabled: 92%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl-grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Actions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tenant Approvals</span>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">License Requests</span>
              <span className="text-sm font-medium text-gray-900">5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">API Key Requests</span>
              <span className="text-sm font-medium text-gray-900">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm font-medium">High CPU Usage</p>
              <p className="text-xs mt-1">
                Server cluster 2 - 85% CPU utilization
              </p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg">
              <p className="text-sm font-medium">Storage Warning</p>
              <p className="text-xs mt-1">
                Media storage approaching 70% capacity
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
              <p className="text-sm font-medium">Maintenance Schedule</p>
              <p className="text-xs mt-1">
                Database optimization planned for tonight
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSupportContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Support Queue
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-red-700">High Priority</span>
            <span className="text-sm font-medium text-red-700">4 tickets</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm text-yellow-700">Medium Priority</span>
            <span className="text-sm font-medium text-yellow-700">
              8 tickets
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-green-700">Low Priority</span>
            <span className="text-sm font-medium text-green-700">
              12 tickets
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Assignments
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Interview Recording Issue
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Acme Corp - 2 hours ago
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                High
              </span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Assessment Access
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  TechStart Inc - 3 hours ago
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                Medium
              </span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  User License Request
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Global Services - 4 hours ago
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Low
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mt-2 px-4">
      <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row 2x:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-custom-blue">Dashboard</h1>
        <div className="text-sm text-gray-500 font-semibold">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <MetricsOverview />

      {renderSuperAdminContent()}
      {renderSupportContent()}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
        <TenantMetricsChart />
        <RecentActivity />
      </div>
      <Outlet />
    </div>
  );
}

export default Dashboard;
