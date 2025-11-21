// v1.0.0 - Ashok - fixed style issues and commented some buttons
// v1.0.1 - Ashok - fixed style and alignment issues

import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, FileText, TrendingUp } from "lucide-react";

const Layout = () => {
  const navigation = [
    { name: "Dashboard", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/analytics/reports", icon: FileText },
    { name: "Trends", href: "/analytics/trends", icon: TrendingUp },
  ];

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <nav className="w-72 bg-white shadow-sm border-r border-gray-200 h-full fixed left-0 top-0 pt-16">
        <div>
          <div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isExact = item.href === "/analytics"; // only for Dashboard

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={isExact} // exact match only for Dashboard
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-6 py-3 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-custom-blue border-r-4 border-custom-blue"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content (scrollable) */}
      <main className="ml-72 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
