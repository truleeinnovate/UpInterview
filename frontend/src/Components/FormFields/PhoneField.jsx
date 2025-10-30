// v1.0.0 - Ashok - Alignment issue
// v1.1.0 - Mansoor - Dynamic phone validation with libphonenumber-js (auto-detects digit length per country)
import React, { useMemo, useState, useEffect } from "react";
import * as countryCodesList from "country-codes-list";
import { parsePhoneNumberFromString, getExampleNumber } from "libphonenumber-js"; // 👈 For validation and example numbers
import DropdownSelect from "../Dropdowns/DropdownSelect";

const PhoneField = ({
    countryCodeValue,
    onCountryCodeChange,
    countryCodeError,
    countryCodeRef,
    phoneValue,
    onPhoneChange,
    phoneError,
    phoneRef,
    label = "Phone",
    required = false,
}) => {
    const [realTimeError, setRealTimeError] = useState("");
    const [selectedIso2, setSelectedIso2] = useState(""); // 👈 New: Track ISO2 for dynamic length

    // 👈 Updated: Build country options (now with iso2 for libphonenumber-js)
    const countryOptions = useMemo(() => {
        try {
            const mod = countryCodesList;
            const customListFn =
                (mod && typeof mod.customList === "function" && mod.customList) ||
                (mod &&
                    mod.default &&
                    typeof mod.default.customList === "function" &&
                    mod.default.customList);
            if (!customListFn) return [];
            const labelsByIso = customListFn(
                "countryCode",
                "{countryNameEn} (+{countryCallingCode})"
            );
            const codesByIso = customListFn("countryCode", "+{countryCallingCode}");
            const mapped = Object.keys(labelsByIso).map((iso2) => ({
                iso2, // 👈 Ensure iso2 is included
                label: labelsByIso[iso2],
                value: codesByIso[iso2],
            }));
            const unique = Array.from(
                new Map(mapped.map((item) => [item.value, item])).values()
            );
            return unique.sort((a, b) => a.label.localeCompare(b.label));
        } catch (e) {
            console.error("Error building country options:", e);
            return [];
        }
    }, []);

    // 👈 New: Dynamically compute expected digit length using libphonenumber-js
    const getExpectedDigitLength = useMemo(() => {
        if (!selectedIso2) return 15; // Fallback
        try {
            const example = getExampleNumber(selectedIso2);
            return example ? example.nationalNumber.length : 15;
        } catch (e) {
            console.error("Error getting example number:", e);
            return 15;
        }
    }, [selectedIso2]);

    // 👈 Updated: Validate using libphonenumber-js (handles length automatically)
    const validatePhone = (phoneDigits, countryCode) => {
        if (!phoneDigits || !countryCode) return "Phone number is required";

        const fullNumber = `${countryCode}${phoneDigits.replace(/\D/g, "")}`;
        const phoneNumber = parsePhoneNumberFromString(fullNumber);

        if (!phoneNumber) {
            return "Invalid phone number format";
        }

        if (!phoneNumber.isValid()) {
            const expectedLength = getExpectedDigitLength;
            return `Invalid phone number for ${countryCode}`;
        }

        return ""; // Valid
    };

    // 👈 Updated: Handle country code change - extract ISO2 and re-validate
    const handleCountryCodeChange = (opt) => {
        const newCode = opt?.value || "";
        onCountryCodeChange({
            target: { name: "CountryCode", value: newCode },
        });

        // 👈 Extract ISO2 from selected option
        const selectedOption = countryOptions.find((o) => o.value === newCode);
        setSelectedIso2(selectedOption?.iso2 || "");

        // Re-validate if phone number exists
        if (phoneValue) {
            const error = validatePhone(phoneValue, newCode);
            setRealTimeError(error);
        } else {
            setRealTimeError("");
        }
    };

    // 👈 Updated: Handle phone change with real-time validation
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Strip non-digits
        onPhoneChange({ target: { name: "Phone", value } });

        // Real-time validation
        const error = validatePhone(value, countryCodeValue);
        setRealTimeError(error);
    };

    // 👈 Effect: Initial ISO2 set on mount if default countryCodeValue exists
    useEffect(() => {
        if (countryCodeValue && !selectedIso2) {
            const defaultOption = countryOptions.find((o) => o.value === countryCodeValue);
            setSelectedIso2(defaultOption?.iso2 || "");
        }
    }, [countryCodeValue, selectedIso2, countryOptions]);

    // 👈 Dynamic maxLength (for UX, not strict validation - library handles real checks)
    const maxDigits = getExpectedDigitLength;

    // 👈 Combined error
    const displayError = realTimeError || phoneError;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex sm:flex-col sm:items-start items-center gap-2">
                <div className="sm:w-full md:w-[36%]" ref={countryCodeRef}>
                    <DropdownSelect
                        options={countryOptions}
                        isSearchable={true}
                        value={
                            countryOptions.find((o) => o.value === countryCodeValue) || null
                        }
                        onChange={handleCountryCodeChange} // 👈 Now passes full option
                        placeholder="+91"
                        hasError={!!countryCodeError}
                        classNamePrefix="rs"
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        formatOptionLabel={(option, { context }) =>
                            context === "menu" ? option.label : option.value
                        }
                        styles={{
                            menu: (base) => ({
                                ...base,
                                width: "300px",
                                minWidth: "280px",
                            }),
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                            }),
                            control: (base, state) => ({
                                ...base,
                                borderColor: state.isFocused ? "#217989" : "#217989",
                                boxShadow: state.isFocused ? "0 0 0 1px #217989" : "none",
                                "&:hover": {
                                    borderColor: "#217989",
                                },
                            }),
                            option: (base, { isSelected, isFocused }) => ({
                                ...base,
                                backgroundColor: isSelected
                                    ? "#217989"
                                    : isFocused
                                        ? "#e6f4f4"
                                        : "white",
                                color: isSelected ? "white" : "#000",
                            }),
                            dropdownIndicator: (base, state) => ({
                                ...base,
                                color: state.isFocused ? "#217989" : "#217989",
                                "&:hover": {
                                    color: "#217989",
                                },
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: "#217989",
                                fontWeight: 500,
                            }),
                        }}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                <div className="flex-1 sm:w-full">
                    <input
                        ref={phoneRef}
                        type="text"
                        name="Phone"
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        maxLength={maxDigits} // 👈 Dynamic based on country
                        className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${
                                displayError
                                    ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                    : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                        `}
                        placeholder={`Enter phone number`} // 👈 Dynamic placeholder
                    />
                </div>
            </div>
            {displayError && (
                <p className="text-red-500 text-xs pt-1">{displayError}</p>
            )}
        </div>
    );
};

export default PhoneField;
