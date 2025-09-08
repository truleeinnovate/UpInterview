import React from "react";
import CustomDatePicker from "../../utils/CustomDatePicker";

const DateOfBirthField = ({ selectedDate, onChange, label = "Date of Birth", required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <CustomDatePicker selectedDate={selectedDate} onChange={onChange} placeholder="Select Date of Birth" />
    </div>
  );
};

export default DateOfBirthField;
