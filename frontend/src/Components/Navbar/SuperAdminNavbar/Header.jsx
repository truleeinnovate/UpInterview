import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";

import {
  AiOutlineBell,
  AiOutlineQuestionCircle,
  AiOutlineDown,
  AiOutlineSearch,
  AiOutlineHome,
} from "react-icons/ai";

import NavbarSidebar from "../Navbar-Sidebar";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";

function Header() {
  const { user, hasRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const [userType, setUserType] = useState("SuperAdmin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mainNavItems = [
    { path: "/tenants", label: "Tenants" },
    {
      path: "/interviewer-requests",
      label: "Interviewer Requests",
      role: "super_admin",
    },
    {
      path: "/outsource-interviewers",
      label: "Outsource Interviewers",
      role: "super_admin",
    },
    { path: "/support-tickets", label: "Support" },
    { path: "/admin-billing", label: "Billing" },
  ];

  const moreNavItems = [
    { path: "/settings", label: "Settings" },

    { path: "/internal-logs", label: "Internal Logs", role: "super_admin" },
    { path: "/integrations", label: "Integrations", role: "super_admin" },
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return user?.role === "super_admin" ? (
    <div className="fixed top-0 z-50 left-0 w-full flex items-center justify-between px-4 sm:px-6 md:px-6 lg:px-8 xl:px-8 2xl:px-8 h-16 bg-white shadow">
      <div className="flex items-center flex-1">
        <div className="flex items-center flex-shrink-0 gap-2">
          <button
            className="lg:hidden xl:hidden 2xl:hidden"
            onClick={handleSidebarToggle}
          >
            <FaBars className="size-5 md:size-6" />
          </button>
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              // src="https://via.placeholder.com/40x40/4f46e5/ffffff?text=IA"
              src="https://ui-avatars.com/api/?name=IA&background=4f46e5&color=ffffff&size=40"
              alt="Interview Admin"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900 hidden lg:flex xl:flex 2xl:flex">
              Interview Admin
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex xl:flex s2xl:flex ml-8 space-x-1">
          {mainNavItems.map(
            (item) =>
              (!item.role || hasRole(item.role)) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    (
                      item.path === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.path)
                    )
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              )
          )}

          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center"
            >
              More
              <AiOutlineDown className="ml-1" />
            </button>

            {showMore && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {moreNavItems.map(
                    (item) =>
                      (!item.role || hasRole(item.role)) && (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`block px-4 py-2 text-sm ${
                            location.pathname.startsWith(item.path)
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => setShowMore(false)}
                        >
                          {item.label}
                        </Link>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="xl:hidden">
          {isSidebarOpen && (
            <Sidebar open={isSidebarOpen} onClose={handleSidebarToggle} />
          )}
        </div>

        {/* Search bar */}
        <div className="ml-8 flex-1 max-w-lg">
          {/* <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search..."
            />
          </div> */}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link to="/admin-dashboard">
          <button
            type="button"
            className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <AiOutlineHome className="h-6 w-6" />
          </button>
        </Link>

        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none hidden sm:block"
        >
          <AiOutlineQuestionCircle className="h-6 w-6" />
        </button>

        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <AiOutlineBell className="h-6 w-6" />
        </button>

        <div className="relative">
          <button
            type="button"
            className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              className="h-8 w-8 rounded-full"
              src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
              alt=""
            />
          </button>

          {showDropdown && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Your Profile
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Settings
                </a>
                <a
                  href="#logout"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <NavbarSidebar />
  );
}

export default Header;
