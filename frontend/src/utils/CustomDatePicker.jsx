/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState, forwardRef, useRef, useLayoutEffect } from 'react';
import DatePicker from "react-datepicker";
import { getYear, format } from "date-fns";
import range from "lodash/range";
import { Calendar } from "lucide-react";
import DropdownSelect from "../Components/Dropdowns/DropdownSelect";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePickerCustom.css"; // Make sure this file exists and is imported

// Month labels used in header dropdown
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Custom input with calendar icon and Tailwind styling aligned with InputField.jsx
const InputWithIcon = forwardRef(function InputWithIcon(
  {
    value,
    onClick,
    placeholder = "DD-MM-YYYY",
    id,
    name,
    disabled,
    error,
    required,
    ariaInvalid,
  },
  ref
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        id={id}
        name={name}
        value={value || ""}
        onClick={onClick}
        readOnly
        disabled={disabled}
        aria-invalid={ariaInvalid || !!error}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md shadow-sm py-2 pl-10 pr-3 sm:text-sm border ${
          error
            ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
            : "border-gray-300 focus:ring-red-300"
        } focus:outline-gray-300`}
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
});

const CustomDatePicker = ({
  selectedDate,
  onChange,
  errors,
  placeholder = "DD-MM-YYYY",
  id,
  name,
  disabled = false,
  required = false,
  minYear = 1950,
  maxYear,
}) => {
  const [startDate, setStartDate] = useState(selectedDate);
  const containerRef = useRef(null);
  const [calendarWidth, setCalendarWidth] = useState(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCalendarWidth(Math.round(rect.width));
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

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

  // Compute years range for dropdown based on props
  const computedMaxYear = useMemo(() => getYear(maxYear instanceof Date ? maxYear : new Date()), [maxYear]);
  const years = useMemo(() => range(minYear, computedMaxYear + 1, 1), [minYear, computedMaxYear]);

  // Custom calendar container to force width equal to input container
  const CalendarContainerCmp = ({ className, children }) => (
    <div
      className={`${className} calendar-container`}
      style={{ width: calendarWidth ? `${calendarWidth}px` : undefined }}
    >
      {children}
    </div>
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <DatePicker
        selected={startDate instanceof Date && !isNaN(startDate) ? startDate : null}
        onChange={(date) => handleDateChange(date)}
        maxDate={new Date()}
        shouldCloseOnSelect
        dateFormat="dd-MM-yyyy"
        id={id}
        name={name}
        disabled={disabled}
        calendarClassName="bg-white shadow-lg border border-gray-200 rounded-lg w-full"
        calendarContainer={CalendarContainerCmp}
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
          <div className="flex flex-1 items-center justify-between px-2 py-1 gap-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
            >
              {"<<"}
            </button>
            <div className="flex items-center gap-1">
              <div className="w-36">
                <DropdownSelect
                  isSearchable={false}
                  value={{ value: date.getMonth(), label: months[date.getMonth()] }}
                  onChange={(opt) => changeMonth(opt?.value ?? date.getMonth())}
                  options={months.map((m, idx) => ({ value: idx, label: m }))}
                />
              </div>
              <div className="w-28">
                <DropdownSelect
                  isSearchable
                  value={{ value: getYear(date), label: String(getYear(date)) }}
                  onChange={(opt) => changeYear(opt?.value ?? getYear(date))}
                  options={years.map((y) => ({ value: y, label: String(y) }))}
                />
              </div>
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
          <InputWithIcon
            id={id}
            name={name}
            disabled={disabled}
            error={!!errors}
            placeholder={placeholder}
            ariaInvalid={!!errors}
            required={required}
          />
        }
        popperClassName="date-picker-popper custom-width-popper"
        popperProps={{
          modifiers: [
            {
              name: 'preventOverflow',
              options: { boundary: 'viewport' },
            },
            {
              // Force popper width to match the reference (input) width
              name: 'sameWidth',
              enabled: true,
              phase: 'beforeWrite',
              requires: ['computeStyles'],
              fn: ({ state }) => {
                state.styles.popper.width = `${state.rects.reference.width}px`;
              },
            },
          ],
        }}
        popperPlacement="bottom-start"
        formatWeekDay={(nameOfDay) => nameOfDay?.slice(0, 3) || ""}
        onChangeRaw={(e) => e.preventDefault()}
        preventOpenOnFocus
        showPopperArrow={false}
        placeholderText={placeholder}
      />
      {errors && (
        <p className="text-red-500 text-xs pt-1">{errors}</p>
      )}
    </div>
  );
};

export default CustomDatePicker;