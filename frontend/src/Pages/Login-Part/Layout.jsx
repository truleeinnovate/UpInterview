import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children, showBackButton = false, backPath = '/' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              {showBackButton && (
                <Link
                  to={backPath}
                  className="mr-4 text-primary-500 hover:text-primary-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}
              <img
                src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                alt="Logo"
                className="w-32"
              />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">Accelerating hiring for 200+ companies</span>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
