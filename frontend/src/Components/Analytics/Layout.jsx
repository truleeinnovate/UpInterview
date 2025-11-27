// // v1.0.0 - Ashok - fixed style issues and commented some buttons
// // v1.0.1 - Ashok - fixed style and alignment issues
// v1.0.3 - Ashok - Toggle button with left/right arrow & smooth sidebar animation

// import React from "react";
// import { NavLink, Outlet } from "react-router-dom";
// import { BarChart3, FileText, TrendingUp } from "lucide-react";

// const Layout = () => {
//   const navigation = [
//     { name: "Dashboard", href: "/analytics", icon: BarChart3 },
//     { name: "Reports", href: "/analytics/reports", icon: FileText },
//     { name: "Trends", href: "/analytics/trends", icon: TrendingUp },
//   ];

//   return (
//     <div className="flex bg-gray-50">
//       {/* Sidebar */}
//       <nav className="w-72 bg-white shadow-sm border-r border-gray-200 h-full fixed left-0 top-0 pt-16">
//         <div>
//           <div>
//             {navigation.map((item) => {
//               const Icon = item.icon;
//               const isExact = item.href === "/analytics"; // only for Dashboard

//               return (
//                 <NavLink
//                   key={item.name}
//                   to={item.href}
//                   end={isExact} // exact match only for Dashboard
//                   className={({ isActive }) =>
//                     `w-full flex items-center gap-3 px-6 py-3 text-xs font-medium transition-all duration-200 ${
//                       isActive
//                         ? "bg-blue-50 text-custom-blue border-r-4 border-custom-blue"
//                         : "text-gray-600 hover:bg-gray-50"
//                     }`
//                   }
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span>{item.name}</span>
//                 </NavLink>
//               );
//             })}
//           </div>
//         </div>
//       </nav>

//       {/* Main Content (scrollable) */}
//       <main className="ml-72 flex-1">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default Layout;

import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/analytics/reports", icon: FileText },
    { name: "Trends", href: "/analytics/trends", icon: TrendingUp },
  ];

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar */}
      <nav
        className={`w-60 bg-white shadow-sm border-r border-gray-200 fixed top-0 pt-16 h-full z-40 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0`} // Always open in large screens
      >
        <div className="mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isExact = item.href === "/analytics";

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={isExact}
                onClick={() => setIsSidebarOpen(false)} // Auto close in mobile
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
        {/* Floating Toggle Button - Always visible on small screens */}
        <button
          className="lg:hidden xl:hidden 2xl:hidden absolute top-16 -right-8 z-50 bg-white/80 shadow-lg p-2.5 rounded-full border border-gray-200 transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-custom-blue" /> // Close sidebar
          ) : (
            <ChevronRight className="w-5 h-5 text-custom-blue" /> // Open sidebar
          )}
        </button>
      </nav>

      {/* Overlay (only on small screens when sidebar is open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto pt-4 transition-all duration-300 ${
          isSidebarOpen ? "" : "lg:ml-64 xl:ml-64 2xl:ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
