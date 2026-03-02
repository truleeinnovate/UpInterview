import React from "react";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

const GlobalBanner = ({
  title,
  message,
  type = "info",
  actionLabel,
  onActionClick,
  isDismissible,
  onClose,
}) => {
  const styles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Info,
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: AlertTriangle,
    },
    critical: {
      container: "bg-red-50 border-red-200 text-red-800",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: AlertCircle,
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-800",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: CheckCircle,
    },
  };

  const currentStyle = styles[type] || styles.info;
  const IconComponent = currentStyle.icon;

  return (
    <div
      className={`w-full border-b transition-all px-4 py-4 mt-1 ${currentStyle.container}`}
    >
      <div className="max-w-[1920px] mx-auto flex flex-row sm:flex-col md:flex-col items-start justify-between gap-4">
        <div className="flex sm:flex-col md:flex-col items-start gap-4">
          <div
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${currentStyle.iconBg}`}
          >
            <IconComponent className={`w-6 h-6 ${currentStyle.iconColor}`} />
          </div>
          <div className="flex flex-col">
            {title && (
              <h4 className="text-sm font-bold mb-0.5 uppercase tracking-wide">
                {title}
              </h4>
            )}
            <p className="text-sm leading-relaxed opacity-90">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 pt-1">
          {isDismissible && (
            <button
              onClick={onClose}
              className={`text-sm font-bold ${currentStyle.iconColor}`}
            >
              Dismiss
            </button>
          )}
          {actionLabel && (
            <button
              onClick={onActionClick}
              className={`flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:opacity-70 whitespace-nowrap ${currentStyle.iconColor}`}
            >
              {actionLabel} <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalBanner;
