/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider, DatePicker as MUIDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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
  const value = selectedDate ? dayjs(selectedDate) : null;

  const computedMin = useMemo(() => dayjs(new Date(minYear, 0, 1)), [minYear]);
  const computedMax = useMemo(() => {
    if (maxYear instanceof Date) {
      return dayjs(maxYear);
    }
    if (typeof maxYear === 'number') {
      return dayjs(new Date(maxYear, 11, 31));
    }
    return dayjs();
  }, [maxYear]);

  const handleChange = (newValue) => {
    if (!newValue || !newValue.isValid || !newValue.isValid()) {
      if (onChange) onChange(null, "");
      return;
    }
    const jsDate = newValue.toDate();
    const formatted = newValue.format('DD-MM-YYYY');
    if (onChange) onChange(jsDate, formatted);
  };

  return (
    <div className="relative w-full">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MUIDatePicker
          value={value && value.isValid() ? value : null}
          onChange={handleChange}
          format="DD-MM-YYYY"
          minDate={computedMin}
          maxDate={computedMax}
          disableFuture
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
              InputProps: { readOnly: true },
            },
            actionBar: { actions: ['clear', 'accept'] },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default CustomDatePicker;