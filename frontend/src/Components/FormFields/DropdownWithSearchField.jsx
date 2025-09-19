import React from "react";
import DropdownSelect, { StickyFooterMenuList, preserveStickyOptionFilter } from "../Dropdowns/DropdownSelect";
import { components as RSComponents } from "react-select";

const DropdownWithSearchField = ({
  value,
  options,
  name,
  onChange,
  error,
  isCustomName = false,
  setIsCustomName = undefined,
  containerRef,
  disabled = false,
  label,
  required = false,
  onMenuOpen,
  isMulti = false,
  loading = false,
}) => {
  // Merge react-select components to include our custom loading indicator when loading
  const componentsMap = { MenuList: StickyFooterMenuList };
  if (loading) {
    const LoadingDotsIndicator = (props) => (
      <RSComponents.LoadingIndicator {...props}>
        <div className="flex items-center gap-1 pr-1">
          <span
            className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </RSComponents.LoadingIndicator>
    );
    componentsMap.LoadingIndicator = LoadingDotsIndicator;
  }
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {!isCustomName ? (
        <div ref={containerRef}>
          <DropdownSelect
            options={options}
            isSearchable
            components={componentsMap}
            filterOption={preserveStickyOptionFilter()}
            isMulti={isMulti}
            value={
              isMulti
                ? (Array.isArray(value)
                    ? options.filter((o) => value.includes(o.value))
                    : [])
                : (value && typeof value === 'object' && value.value
                    ? value
                    : options.find((o) => o.value === value) || null)
            }
            onChange={(opt) => {
              if (isMulti) {
                const vals = Array.isArray(opt) ? opt.map((o) => o.value) : [];
                onChange({ target: { name: name, value: vals } });
                return;
              }
              if (opt?.value === "__other__") {
                if (typeof setIsCustomName === "function") {
                  setIsCustomName(true);
                }
                onChange({ target: { name: name, value: "" } });
              } else {
                if (typeof setIsCustomName === "function") {
                  setIsCustomName(false);
                }
                // Always pass event-like object with target containing name and value
                onChange({ target: { name: name, value: opt?.value || "" } });
              }
            }}
            placeholder={`Select a ${label}`}
            isDisabled={disabled}
            hasError={!!error}
            classNamePrefix="rs"
            onMenuOpen={onMenuOpen}
            isLoading={loading}
          />
        </div>
      ) : (
        <div className="relative">
          <input
            ref={containerRef}
            type="text"
            value={value}
            onChange={(e) => onChange({ target: { name: name, value: e.target.value } })}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
            border ${
              error
                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                : "border-gray-300 focus:ring-red-300"
            }
            focus:outline-gray-300
          `}
            placeholder={`Enter custom ${label} name`}
          />
          <button
            type="button"
            onClick={() => {
              if (typeof setIsCustomName === "function") {
                setIsCustomName(false);
              }
              onChange({ target: { name: name, value: "" } });
            }}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default DropdownWithSearchField;
