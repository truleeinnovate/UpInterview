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
        const formatted = newValue.format('DD-MM-YYYY');
        if (onChange) onChange(jsDate, formatted);
    };

    // Format the value for display
    const displayValue = useMemo(() => {
        if (!value) return '';
        try {
            return dayjs(value).isValid() ? dayjs(value).format('DD-MM-YYYY') : '';
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    }, [value]);

    return (
        <div className="relative w-full">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                />
            </LocalizationProvider>
        </div>
    );
};

export default CustomDatePicker;
