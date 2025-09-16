// v1.0.0 - Ashok - Alignment issue

import React, { useMemo } from "react";
import * as countryCodesList from "country-codes-list";
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
  // Build options like: "India (+91)" with value "+91"
  // v1.0.0 <------------------------------------------------------------
  // const countryOptions = useMemo(() => {
  //   try {
  //     // Resolve customList from module namespace or default (interop-safe)
  //     const mod = countryCodesList;
  //     const customListFn =
  //       (mod && typeof mod.customList === "function" && mod.customList) ||
  //       (mod && mod.default && typeof mod.default.customList === "function" && mod.default.customList);
  //     if (!customListFn) return [];

  //     // Use documented API: customList(keyProp, template)
  //     const labelsByIso = customListFn(
  //       "countryCode",
  //       "{countryNameEn} (+{countryCallingCode})"
  //     );
  //     const codesByIso = customListFn(
  //       "countryCode",
  //       "+{countryCallingCode}"
  //     );
  //     const mapped = Object.keys(labelsByIso).map((iso2) => ({
  //       iso2,
  //       label: labelsByIso[iso2],
  //       value: codesByIso[iso2],
  //     }));
  //     return mapped.sort((a, b) => a.label.localeCompare(b.label));
  //   } catch (e) {
  //     return [];
  //   }
  // }, []);
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
        iso2,
        label: labelsByIso[iso2], // full display in dropdown
        value: codesByIso[iso2], // actual value
      }));

      // Remove duplicates (same codes)
      const unique = Array.from(
        new Map(mapped.map((item) => [item.value, item])).values()
      );

      return unique.sort((a, b) => a.label.localeCompare(b.label));
    } catch (e) {
      return [];
    }
  }, []);
  // v1.0.0 ------------------------------------------------------------>

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex sm:flex-col sm:items-start items-center gap-2">
        <div className="sm:w-full md:w-[36%]" ref={countryCodeRef}>
          {/* <DropdownSelect
            options={countryOptions}
            isSearchable={true}
            value={
              countryOptions.find((o) => o.value === countryCodeValue) || null
            }
            onChange={(opt) =>
              onCountryCodeChange({
                target: { name: "CountryCode", value: opt?.value || "" },
              })
            }
            placeholder="+91"
            hasError={!!countryCodeError}
            classNamePrefix="rs"
          /> */}
          <DropdownSelect
            options={countryOptions}
            isSearchable={true}
            value={
              countryOptions.find((o) => o.value === countryCodeValue) || null
            }
            onChange={(opt) =>
              onCountryCodeChange({
                target: { name: "CountryCode", value: opt?.value || "" },
              })
            }
            placeholder="+91"
            hasError={!!countryCodeError}
            classNamePrefix="rs"
            // 👇 This makes dropdown show label, but selected value show only code
            getOptionLabel={(option) => option.label} // show "India (+91)" in menu
            getOptionValue={(option) => option.value} // keep value as "+91"
            formatOptionLabel={(option, { context }) =>
              context === "menu" ? option.label : option.value
            }
          />
        </div>
        <div className="flex-1 sm:w-full">
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
