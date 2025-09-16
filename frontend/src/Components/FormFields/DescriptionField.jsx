import React from "react";

/*
How to import and use any where:

import DescriptionField from "../../../../Components/FormFields/DescriptionField";

<DescriptionField
  value={formData.jobDescription}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({ ...formData, jobDescription: value });
    // Clear error when user types
    if (errors.jobDescription) {
      setErrors((prev) => ({ ...prev, jobDescription: "" }));
    }
  }}
  name="jobDescription"
  inputRef={fieldRefs.jobDescription}
  error={errors.jobDescription}
  label="Job Description"
  required
  placeholder="This position is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
  rows={10}
  minLength={50}
  maxLength={1000}
/>
*/

const DescriptionField = ({
  value = "",
  onChange,
  name,
  inputRef,
  error,
  label = "Description",
  required = false,
  id,
  placeholder = "",
  rows = 10,
  minLength = 0,
  maxLength = 1000,
  disabled = false,
  readOnly = false,
  showCounter = true,
}) => {
  const currentLength = (value || "").length;
  const computedId = id || name || "description";
  const showMinHint = !error && currentLength > 0 && minLength > 0 && currentLength < minLength;

  return (
    <div>
      <label htmlFor={computedId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        ref={inputRef}
        id={computedId}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
          border ${error ? "border-red-500 focus:ring-red-500 focus:outline-red-300" : "border-gray-300 focus:ring-red-300"}
          focus:outline-gray-300
        `}
        placeholder={placeholder}
        rows={rows}
        minLength={minLength || undefined}
        maxLength={maxLength || undefined}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={!!error}
      />
      {showCounter && (
        <div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">
              {error ? (
                <p className="text-red-500 text-xs pt-1">{error}</p>
              ) : showMinHint ? (
                <p className="text-gray-500 text-xs">
                  Minimum {minLength - currentLength} more characters needed
                </p>
              ) : null}
            </span>
            <p className="text-sm text-gray-500">
              {typeof maxLength === "number" ? `${currentLength}/${maxLength}` : currentLength}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionField;
