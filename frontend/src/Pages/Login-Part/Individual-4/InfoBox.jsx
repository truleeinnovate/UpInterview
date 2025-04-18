import React from 'react';

export default function InfoBox({ title, description, icon }) {
  return (
    <div className="relative group">
      {/* Main container */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-lg border border-custom-blue">
        <div className="relative z-10 flex items-center gap-3">
          {/* Icon container */}
          {icon && (
            <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-5 h-5 text-custom-blue">
                {icon}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-custom-blue mb-1">
              {title}
            </h2>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-orange-200/20 rounded-full blur-2xl"></div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-white/20 to-orange-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Bottom accent */}
      <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-custom-blue to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"></div>
    </div>
  );
}