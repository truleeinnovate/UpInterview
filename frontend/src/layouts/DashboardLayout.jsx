import { Outlet } from "react-router-dom";
import Header from "../Components/SuperAdminComponents/Navbar/SuperAdminNavbar/Header";
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="w-full mx-auto">
          <Header />
        </div>
      </div>

      <main className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
