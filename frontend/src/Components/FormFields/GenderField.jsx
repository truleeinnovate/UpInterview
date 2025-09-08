import React from "react";
import DropdownSelect from "../Dropdowns/DropdownSelect";

const GenderField = ({ value, options, onChange, error, containerRef, label = "Gender", required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div ref={containerRef}>
      <DropdownSelect
        options={options}
        isSearchable={false}
        value={options.find((o) => o.value === value) || null}
        onChange={(opt) => onChange({ target: { name: "Gender", value: opt?.value || "" } })}
        placeholder="Select Gender"
        hasError={!!error}
        classNamePrefix="rs"
      />
      </div>
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default GenderField;
