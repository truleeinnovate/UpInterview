import React from "react";
import DropdownSelect from "../Dropdowns/DropdownSelect";

const PhoneField = ({
  countryCodeOptions,
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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <div className="w-28" ref={countryCodeRef}>
          <DropdownSelect
            options={countryCodeOptions}
            isSearchable={false}
            value={countryCodeOptions.find((o) => o.value === countryCodeValue) || null}
            onChange={(opt) =>
              onCountryCodeChange({ target: { name: "CountryCode", value: opt?.value || "" } })
            }
            placeholder="+91"
            hasError={!!countryCodeError}
            classNamePrefix="rs"
          />
        </div>
        <div className="flex-1">
          <input
            ref={phoneRef}
            type="text"
            name="Phone"
            value={phoneValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                onPhoneChange({ target: { name: "Phone", value } });
              }
            }}
            maxLength={10}
            className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
              border ${
                phoneError
                  ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                  : "border-gray-300 focus:ring-red-300"
              }
              focus:outline-gray-300
            `}
            placeholder="Enter Phone Number"
          />
        </div>
      </div>
      {phoneError && <p className="text-red-500 text-xs pt-1">{phoneError}</p>}
    </div>
  );
};

export default PhoneField;
