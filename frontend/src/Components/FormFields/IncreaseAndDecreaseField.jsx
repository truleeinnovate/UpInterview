// v1.0.0 - Ashok - Updated code

// import React from "react";

// const IncreaseAndDecreaseField = ({ value, onChange, name, placeholder, inputRef, error, label = "IncreaseAndDecreaseField", required = false, min = 1, max = 15, disabled = false }) => {

//   const handleInputChange = (e) => {
//     const inputValue = e.target.value;

//     // Allow empty input for clearing
//     if (inputValue === '') {
//       onChange(e);
//       return;
//     }

//     // Parse the value
//     const numValue = parseInt(inputValue);

//     // Validate and enforce min/max limits
//     if (!isNaN(numValue)) {
//       // Clamp the value within min and max
//       const clampedValue = Math.min(Math.max(numValue, min), max);

//       // Create event with clamped value
//       const event = {
//         target: {
//           name: name,
//           value: clampedValue.toString()
//         }
//       };
//       onChange(event);
//     }
//   };

//   // Handle when user leaves the field empty - set to minimum value if required
//   const handleBlur = (e) => {
//     const inputValue = e.target.value;

//     // If empty and field is required, set to minimum value
//     if (inputValue === '' && required) {
//       const event = {
//         target: {
//           name: name,
//           value: min.toString()
//         }
//       };
//       onChange(event);
//     } else {
//       handleInputChange(e);
//     }
//   };

//   return (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       <div className="relative mt-1">
//         {label === "Max Salary(Annual)" || label === "Min Salary(Annual)" ? <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span> : null}
//         <input
//           ref={inputRef}
//           type="number"
//           name={name}
//           id={name}
//           min={min}
//           max={max}
//           disabled={disabled}
//           value={value || ''}
//           onChange={handleInputChange}
//           onBlur={handleBlur}
//           className={`block w-full rounded-md shadow-sm py-2 ${label === "Max Salary(Annual)" || label === "Min Salary(Annual)" ? "pr-3 pl-9" : "px-3"} sm:text-sm
//           border ${
//             error
//               ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
//               : "border-gray-300 focus:ring-red-300"
//           }
//           focus:outline-gray-300
//         `}
//           placeholder={placeholder ? placeholder : `Enter ${label}`}
//         />
//       </div>
//       {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
//     </div>
//   );
// };

// export default IncreaseAndDecreaseField;

const IncreaseAndDecreaseField = ({
  value,
  onChange,
  name,
  placeholder,
  inputRef,
  error,
  label = "IncreaseAndDecreaseField",
  required = false,
  min = 1,
  max = 15,
  disabled = false,
}) => {
  // const handleInputChange = (e) => {
  //   const inputValue = e.target.value;

  //   if (inputValue === "") {
  //     onChange(e);
  //     return;
  //   }

  //   const numValue = parseInt(inputValue);

  //   if (!isNaN(numValue)) {
  //     if (numValue > max) {
  //       onChange({ target: { name, value: max.toString() } });
  //       return;
  //     }

  //     const minString = min.toString();
  //     if (inputValue.length >= minString.length && numValue < min) {
  //       onChange({ target: { name, value: minString } });
  //     } else {
  //       onChange(e);
  //     }
  //   }
  // };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(e);
      return;
    }

    const numValue = parseInt(inputValue);

    if (!isNaN(numValue)) {
      if (numValue > max) {
        onChange({ target: { name, value: max.toString() } });
        return;
      }
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      if (required) {
        const event = { target: { name, value: min.toString() } };
        onChange(event);
      }
      return;
    }

    const numValue = parseInt(inputValue);

    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);

      const event = {
        target: {
          name: name,
          value: clampedValue.toString(),
        },
      };
      onChange(event);
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative mt-1">
        {/* Note: Fixed the extra space in " (Annual)" to match your props */}
        {(label.includes("Max Salary") || label.includes("Min Salary")) && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            ₹
          </span>
        )}
        <input
          ref={inputRef}
          type="number"
          name={name}
          id={name}
          disabled={disabled}
          value={value || ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`block w-full rounded-md shadow-sm py-2 ${
            label.includes("Salary") ? "pr-3 pl-9" : "px-3"
          } sm:text-sm border ${
            error
              ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
              : "border-gray-300 focus:ring-red-300"
          } focus:outline-gray-300`}
          placeholder={placeholder ? placeholder : `Enter ${label}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default IncreaseAndDecreaseField;
