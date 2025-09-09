import React from "react";

const InputField = ({ value, onChange, name, inputRef, error, label = "Last Name", required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
        border ${
          error
            ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
            : "border-gray-300 focus:ring-red-300"
        }
        focus:outline-gray-300
      `}
        placeholder={`Enter ${label}`}
      />
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default InputField;
