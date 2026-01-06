import React from "react";

const MeetPlatformBadge = ({ platform }) => {
  const normalizePlatform = (value) =>
    value?.toLowerCase().replace(/[\s_-]/g, "");

  const PLATFORM_CONFIG = {
    googlemeet: {
      label: "Google Meet",
      text: "text-green-600",
      iconBg: "bg-green-100",
      bg: "bg-green-50",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-5 h-5"
        >
          <g fill="none" fillRule="evenodd">
            <rect x="8" y="12" width="32" height="12" rx="4" fill="#ffe70b" />
            <rect x="8" y="24" width="32" height="12" rx="4" fill="#34A853" />
            <rect x="8" y="12" width="4" height="24" rx="2" fill="#4285F4" />
            <rect x="36" y="12" width="4" height="24" rx="2" fill="#34A853" />
            <rect x="12" y="16" width="24" height="16" rx="3" fill="#ffffff" />
            <path fill="#00f829" d="M36 20l14-4v18l-14-4z" />
          </g>
        </svg>
      ),
    },

    zoom: {
      label: "Zoom",
      text: "text-blue-600",
      iconBg: "bg-blue-100",
      bg: "bg-blue-50",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-5 h-5"
        >
          <circle cx="24" cy="24" r="24" fill="#2D8CFF" />
          <path
            fill="#fff"
            d="M30.5 18.5v3.3l4-3.3v11l-4-3.3v3.3c0 1.1-.9 2-2 2h-9c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2z"
          />
        </svg>
      ),
    },

    platform: {
      label: "Platform",
      text: "text-gray-600",
      iconBg: "bg-gray-200",
      bg: "bg-gray-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#9e9e9e"
          className="w-5 h-5"
        >
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ),
    },

    default: {
      label: "Platform",
      text: "text-gray-600",
      iconBg: "bg-gray-200",
      bg: "bg-gray-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#9e9e9e"
          className="w-5 h-5"
        >
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ),
    },
  };

  const normalizedPlatform = normalizePlatform(platform);
  const config = PLATFORM_CONFIG[normalizedPlatform] || PLATFORM_CONFIG.default;

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs ${config.bg}`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full ${config.iconBg}`}
      >
        {config.icon}
      </span>
      <strong className={config.text}>{config.label}</strong>
    </span>
  );
};

export default MeetPlatformBadge;
