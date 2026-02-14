import React from "react";

const InputField = React.forwardRef(
  (
    {
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
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
      showCounter = false,
    },
    ref,
  ) => {
    const computedPlaceholder = placeholder ?? `Enter ${label}`;
    const computedId = id || name;
    const resolvedRef = inputRef || ref;

    const currentLength = (value || "").length;
    const showMinHint =
      !error && currentLength > 0 && min > 0 && currentLength < min;

    return (
      <div>
        {label && (
          <label
            htmlFor={computedId}
            className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={resolvedRef}
          type={type}
          id={computedId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
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
        border ${error ? "border-red-500 focus:ring-red-500 focus:outline-red-300" : "border-gray-300"}
        focus:outline-none focus:ring-0 ${error ? "" : "focus:ring-custom-blue focus:border-custom-blue/70"} ${className}`}
          placeholder={computedPlaceholder}
        />
        <div className="">
          {/* {error && <p className="text-red-500 text-xs pt-1">{error}</p>} */}
          <div className="flex justify-between items-start mt-1">
            <div className="flex-1">
              <p className="text-red-500 text-xs">{error}</p>
            </div>

            {showCounter && (
              <p
                className={`text-xs ml-2 whitespace-nowrap transition-colors ${
                  showMinHint ? "text-red-500 font-medium" : "text-gray-400"
                }`}
              >
                {currentLength}
                {max ? `/${max}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default InputField;
