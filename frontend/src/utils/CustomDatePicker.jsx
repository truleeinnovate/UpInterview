import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import { getYear, format } from "date-fns";
import range from "lodash/range";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePickerCustom.css"; // Make sure this file exists and is imported

const years = range(1990, getYear(new Date()) + 1, 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CustomDatePicker = ({ selectedDate, onChange, errors }) => {
  const [startDate, setStartDate] = useState(selectedDate);

  const handleDateChange = (date) => {
    setStartDate(date);
    if (onChange) {
      const formattedDate = format(date, 'dd-MM-yyyy');
      onChange(date, formattedDate);
    }
  };

  useEffect(() => {
    setStartDate(selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : null);
  }, [selectedDate]);


  // Custom day names that will be visible
  const customWeekDays = ["Sun", "Mon", "Tue", "Wen", "Thr", "Fri", "Sat"];

  return (
    <div className="relative w-full">
      <DatePicker
       selected={startDate instanceof Date && !isNaN(startDate) ? startDate : null}
        onChange={(date) => handleDateChange(date)}
        dateFormat="MMMM d, yyyy"
        maxDate={new Date()}
        calendarClassName="bg-white shadow-lg border border-gray-200 rounded-lg calendar-container"
        dayClassName={(date) =>
          date.getMonth() === startDate?.getMonth()
            ? "hover:bg-blue-100 day-cell"
            : "text-gray-400 hover:bg-blue-100 day-cell"
        }
        className="w-full"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
            >
              {"<<"}
            </button>
            <div className="flex space-x-2">
              <select
                value={months[date.getMonth()]}
                onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(value)}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
            >
              {">>"}
            </button>
          </div>
        )}
        customInput={
          <input
            type="text"
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Select date of birth"
          />
        }
         popperClassName="date-picker-popper custom-width-popper"
        popperProps={{
            positionFixed: true,
            modifiers: {
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: "viewport"
              }
            }
          }}
          popperPlacement="bottom-start"
 
        formatWeekDayHeader={(day) => {
          // Find the index of the day in the week (0-6)
          const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            .findIndex(d => d.startsWith(day));
          
          // Return the abbreviated day name
          return customWeekDays[dayIndex === -1 ? 0 : dayIndex];
        }}
        onChangeRaw={(e) => e.preventDefault()}
        preventOpenOnFocus
        showPopperArrow={false}
      />
      {errors && (
        <p className="text-red-500 text-sm mt-1">{errors}</p>
      )}
    </div>
  );
};

export default CustomDatePicker;