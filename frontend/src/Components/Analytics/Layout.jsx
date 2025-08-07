// import React from 'react';
// import { NavLink, Outlet } from 'react-router-dom';
// import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';

// const Layout = () => {
//   const navigation = [
//     { name: 'Dashboard', href: '/analytics', icon: BarChart3 },
//     { name: 'Reports', href: '/analytics/reports', icon: FileText },
//     { name: 'Trends', href: '/analytics/trends', icon: TrendingUp }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       {/* <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
//                 <Users className="w-5 h-5 text-white" />
//               </div>
//               <h1 className="text-xl font-bold text-gray-900">Interview SaaS</h1>
//             </div>
//             <div className="text-sm text-gray-500">
//               Analytics Dashboard
//             </div>
//           </div>
//         </div>
//       </header> */}

//       <div className="flex">
//         {/* Sidebar */}
//         <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
//           <div className="p-6">
//             <div className="space-y-2">
//               {navigation.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <NavLink
//                     key={item.name}
//                     to={item.href}
//                     className={({ isActive }) =>
//                       `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
//                         isActive
//                           ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
//                           : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                       }`
//                     }
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{item.name}</span>
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>
//         </nav>

//         {/* Main Content */}
//         <main className="flex-1 p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// v1.0.0 - Ashok - fixed style issues and commented some buttons

import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, FileText, TrendingUp } from "lucide-react";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";

const Layout = () => {
  const navigation = [
    { name: "Dashboard", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/analytics/reports", icon: FileText },
    { name: "Trends", href: "/analytics/trends", icon: TrendingUp },
  ];

  // Disable outer scrollbar
  useScrollLock(true);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-72 bg-white shadow-sm border-r border-gray-200 h-full fixed left-0 top-0 pt-16">
        {/* v1.0.0 <-------------------------------------------------- */}
        <div>
        {/* v1.0.0 --------------------------------------------------> */}
          <div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isExact = item.href === "/analytics"; // only for Dashboard

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={isExact} // exact match only for Dashboard
                  // className={({ isActive }) =>
                  //   `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  //     isActive
                  //       ? "bg-teal-50 text-custom-blue border-l-2 border-custom-blue"
                  //       : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  //   }`
                  // }
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-6 py-3 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-custom-blue border-r-4 border-custom-blue'
                        : 'text-gray-600 hover:bg-gray-50'
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
      <main className="ml-72 flex-1 overflow-y-auto p-6 mt-1 mb-[54px]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
