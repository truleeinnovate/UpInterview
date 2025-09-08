import React from "react";
import DropdownSelect, { StickyFooterMenuList, preserveStickyOptionFilter } from "../Dropdowns/DropdownSelect";

const UniversityCollegeField = ({
  value,
  options,
  onChange,
  error,
  isCustomUniversity,
  setIsCustomUniversity,
  containerRef,
  label = "University/College",
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!isCustomUniversity ? (
        <div ref={containerRef}>
          <DropdownSelect
            options={options}
            isSearchable
            components={{ MenuList: StickyFooterMenuList }}
            filterOption={preserveStickyOptionFilter()}
            value={options.find((o) => o.value === value) || null}
            onChange={(opt) => {
              if (opt?.value === "__other__") {
                setIsCustomUniversity(true);
                onChange({ target: { name: "UniversityCollege", value: "" } });
              } else {
                setIsCustomUniversity(false);
                onChange({ target: { name: "UniversityCollege", value: opt?.value || "" } });
              }
            }}
            placeholder="Select a University/College"
            hasError={!!error}
            classNamePrefix="rs"
          />
        </div>
      ) : (
        <div className="relative">
          <input
            ref={containerRef}
            type="text"
            value={value}
            onChange={(e) => onChange({ target: { name: "UniversityCollege", value: e.target.value } })}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
            border ${
              error
                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                : "border-gray-300 focus:ring-red-300"
            }
            focus:outline-gray-300
          `}
            placeholder="Enter custom university/college name"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustomUniversity(false);
              onChange({ target: { name: "UniversityCollege", value: "" } });
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

export default UniversityCollegeField;
