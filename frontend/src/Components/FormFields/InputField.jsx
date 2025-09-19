import React from "react";

const InputField = ({
  value,
  onChange,
  onFocus,
  onBlur,
  name,
  inputRef,
  error,
  label,
  required = false,
  type = "text",
  id,
  placeholder,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  autoComplete,
  className = "",
}) => {
  const computedPlaceholder = placeholder ?? `Enter ${label}`;
  const computedId = id || name;
  return (
    <div>
      {label && (<label htmlFor={computedId} className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      )}
      <input
        ref={inputRef}
        type={type}
        id={computedId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        onFocus={onFocus}
        aria-invalid={!!error}
        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
        border ${error ? "border-red-500 focus:ring-red-500 focus:outline-red-300" : "border-gray-300 focus:ring-red-300"}
        focus:outline-gray-300 ${className}`}
        placeholder={computedPlaceholder}
      />
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default InputField;
