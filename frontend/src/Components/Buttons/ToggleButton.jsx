import React from "react";
import clsx from "clsx";

const COLOR_MAP = {
  "custom-blue": "peer-checked:bg-custom-blue",
  "green-600": "peer-checked:bg-green-600",
  "red-600": "peer-checked:bg-red-600",
  "emerald-600": "peer-checked:bg-emerald-600",
};

const ToggleSwitch = ({
  label,
  value = false,
  onChange,
  activeText = "Active",
  inactiveText = "Inactive",
  textPosition = "right", // "left" | "right"
  color = "custom-blue",
  disabled = false,
  className = "",
}) => {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {/* Top Label */}
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}

      <div className="flex items-center gap-3">
        {/* Left Text */}
        {textPosition === "left" && (
          <span className="text-sm font-medium text-slate-700">
            {value ? activeText : inactiveText}
          </span>
        )}

        {/* Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />

          <div
            className={clsx(
              "w-11 h-6 bg-slate-200 rounded-full peer-focus:outline-none transition-colors",
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
              "after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
              "peer-checked:after:translate-x-full peer-checked:after:border-white",
              COLOR_MAP[color] || COLOR_MAP["custom-blue"],
              disabled && "opacity-60 cursor-not-allowed",
            )}
          />
        </label>

        {/* Right Text */}
        {textPosition === "right" && (
          <span className="text-sm font-medium text-slate-700">
            {value ? activeText : inactiveText}
          </span>
        )}
      </div>
    </div>
  );
};

export default ToggleSwitch;
