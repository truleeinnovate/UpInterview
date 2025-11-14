// v1.0.0 - Ashok - Used custom blue color (Brand color)

/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import dayjs from "dayjs";
import {
  LocalizationProvider,
  DatePicker as MUIDatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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
  maxDate,
}) => {
  const value = selectedDate ? dayjs(selectedDate) : null;

  const computedMin = useMemo(() => dayjs(new Date(minYear, 0, 1)), [minYear]);
  const computedMax = useMemo(() => {
    if (maxDate) {
      return dayjs(maxDate);
    }
    return dayjs();
  }, [maxDate]);

  const handleChange = (newValue) => {
    if (!newValue || !newValue.isValid || !newValue.isValid()) {
      if (onChange) onChange(null, "");
      return;
    }
    const jsDate = newValue.toDate();
    const formatted = newValue.format("DD-MM-YYYY");
    if (onChange) onChange(jsDate, formatted);
  };

  // Format the value for display
  const displayValue = useMemo(() => {
    if (!value) return "";
    try {
      return dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "";
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* <MUIDatePicker
                    value={value ? dayjs(value) : null}
                    onChange={handleChange}
                    format="DD-MM-YYYY"
                    minDate={computedMin}
                    maxDate={computedMax}
                    disabled={disabled}
                    slotProps={{
                        textField: {
                            id,
                            name,
                            placeholder,
                            required,
                            error: !!errors,
                            helperText: errors || "",
                            size: 'small',
                            fullWidth: true,
                            inputProps: {
                                value: displayValue,
                                readOnly: true,
                                placeholder: placeholder
                            },
                            InputLabelProps: {
                                shrink: true,
                            },
                        },
                        actionBar: { actions: ['clear', 'accept'] },
                    }}
                /> */}
        <MUIDatePicker
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          format="DD-MM-YYYY"
          minDate={computedMin}
          maxDate={computedMax}
          disabled={disabled}
          slotProps={{
            textField: {
              id,
              name,
              placeholder,
              required,
              error: !!errors,
              helperText: errors || "",
              size: "small",
              fullWidth: true,
              inputProps: {
                value: displayValue,
                readOnly: true,
                placeholder: placeholder,
              },
              InputLabelProps: { shrink: true },
              sx: {
                // Border color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#217989", // your custom border
                  },
                  "&:hover fieldset": {
                    borderColor: "#217989", // hover color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#217989", // focus color
                    borderWidth: "1px",
                  },
                },

                // Helper text color (error text)
                "& .MuiFormHelperText-root": {
                  color: errors ? "#EF4444" : "#6B7280",
                },
              },
            },

            // Custom styling for calendar popup UI
            desktopPaper: {
              sx: {
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "#217989 !important",
                  color: "#fff",
                },
                "& .MuiPickersDay-root:hover": {
                  backgroundColor: "#21798933",
                },
                "& .MuiPickersDay-today": {
                  borderColor: "#217989",
                },
                "& .MuiPickersCalendarHeader-label": {
                  color: "#217989",
                  fontWeight: 600,
                },
                "& .MuiIconButton-root": {
                  color: "#217989",
                },
                /* ⭐ SELECTED YEAR – MAIN BUTTON ⭐ */
                "& .MuiPickersYear-yearButton.Mui-selected": {
                  backgroundColor: "#217989 !important",
                  color: "#fff !important",
                },

                /* ⭐ SELECTED YEAR – INNER TEXT (important!) ⭐ */
                "& .MuiPickersYear-root .Mui-selected": {
                  color: "#fff !important",
                },

                /* Hover effect for year list */
                "& .MuiPickersYear-yearButton:hover": {
                  backgroundColor: "#2179894D",
                },

                /* Year item default text color */
                "& .MuiPickersYear-yearButton": {
                  color: "#217989",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default CustomDatePicker;
