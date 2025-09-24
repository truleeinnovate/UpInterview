import React, { useMemo } from "react";
import CustomDatePicker from "../../utils/CustomDatePicker";

const DateOfBirthField = ({
  selectedDate,
  onChange,
  label = "Date of Birth",
  required = false,
  name = "Date_Of_Birth",
  id,
  placeholder = "DD-MM-YYYY",
  disabled = false,
  error,
  minYear = 1950,
  maxYear,
}) => {
  const eighteenYearsAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const computedId = id || name;
  return (
    <div>
      <label htmlFor={computedId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <CustomDatePicker
        id={computedId}
        name={name}
        selectedDate={selectedDate}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        errors={error}
        minYear={minYear}
        maxDate={eighteenYearsAgo}
        maxYear={maxYear}
      />
    </div>
  );
};

export default DateOfBirthField;
    