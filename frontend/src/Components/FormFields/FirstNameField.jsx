import React from "react";

const FirstNameField = ({ value, onChange, inputRef, label = "First Name", required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        ref={inputRef}
        name="FirstName"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border sm:text-sm rounded-md border-gray-300"
        placeholder="Enter First Name"
      />
    </div>
  );
};

export default FirstNameField;
