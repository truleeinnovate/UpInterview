import React from "react";
import DropdownSelect from "../Dropdowns/DropdownSelect";


const CurrentRoleField = ({ value, options, onChange, error, containerRef, label = "Current Role", required = false }) => {
  return (
    <div>
      <label htmlFor="CurrentRole" className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    <div ref={containerRef}>
      <DropdownSelect
        options={options}
        isSearchable
        value={options.find((o) => o.value === value) || null}
        onChange={(opt) => onChange({ target: { name: "CurrentRole", value: opt?.value || "" } })}
        placeholder="Select Current Role"
        hasError={!!error}
        classNamePrefix="rs"
      />
    </div>
    {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
  </div>
  );
};

export default CurrentRoleField;
