// v1.0.0 - Ashok - fixed style issues and added remove button for custom name

import React, { useRef, forwardRef, useEffect } from "react";
import DropdownSelect, {
  StickyFooterMenuList,
  preserveStickyOptionFilter,
} from "../Dropdowns/DropdownSelect";
import { components as RSComponents } from "react-select";
import { X } from "lucide-react";

const DropdownWithSearchField = forwardRef(
  (
    {
      value,
      options,
      name,
      onChange,
      error,
      isCustomName = false,
      setIsCustomName = undefined,
      containerRef,
      disabled = false,
      isSearchable = true,
      label,
      required = false,
      onMenuOpen,
      onMenuClose,
      menuIsOpen,
      isMulti = false,
      loading = false,
      onKeyDown,
      placeholder,
      creatable = false,
      allowCreateOnEnter = false, // New prop to control create on enter behavior
      autoComplete,
      onInputChange,
      onMenuScrollToBottom,
      emptyMessage,
      isClearable = false, // Add isClearable prop
      formatOptionLabel, // Allow custom option rendering
    },
    ref,
  ) => {
    const inputRef = useRef(null);

    // Handle ref forwarding and attach keyboard events
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(inputRef.current);
        } else if (ref && "current" in ref) {
          ref.current = inputRef.current;
        }
      }

      // Attach keyboard events to the react-select input
      const attachKeyboardEvents = () => {
        if (inputRef.current) {
          // Find the react-select input element
          const selectContainer = inputRef.current.closest(".rs__control");
          if (selectContainer) {
            const inputElement = selectContainer.querySelector("input");
            if (
              inputElement &&
              !inputElement.hasAttribute("data-keyboard-attached")
            ) {
              // Strongly discourage browser autofill on this internal input
              inputElement.setAttribute("autocomplete", "new-password");
              // Clear any prefilled value (e.g., email autofill) so default
              // selected option text is shown instead of the autofilled text
              if (inputElement.value) {
                inputElement.value = "";
              }

              inputElement.addEventListener("keydown", (e) => {
                if (onKeyDown) onKeyDown(e);
              });
              inputElement.setAttribute("data-keyboard-attached", "true");
            } else if (
              inputElement &&
              inputElement.hasAttribute("data-keyboard-attached")
            ) {
            } else {
            }
          } else {
          }
        } else {
        }
      };

      // Use setTimeout to ensure the DOM is ready
      const timeoutId = setTimeout(attachKeyboardEvents, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [ref, onKeyDown]);

    // Merge react-select components to include our custom loading indicator and no options message
    const componentsMap = { MenuList: StickyFooterMenuList };
    if (loading) {
      const LoadingDotsIndicator = (props) => (
        <RSComponents.LoadingIndicator {...props}>
          <div className="flex items-center gap-1 pr-1">
            <span
              className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </RSComponents.LoadingIndicator>
      );
      componentsMap.LoadingIndicator = LoadingDotsIndicator;
    }

    // Custom NoOptionsMessage component
    // const NoOptionsMessage = (props) => {
    //   const { inputValue, allowCreateOnEnter } = props.selectProps;
    //   const showCreateHint =
    //     allowCreateOnEnter && inputValue && inputValue.trim().length > 0;

    //   if (inputValue) {
    //     return (
    //       <RSComponents.NoOptionsMessage {...props}>
    //         <div className="p-2 text-sm text-gray-500">
    //           No results found for "{inputValue}"
    //         </div>
    //       </RSComponents.NoOptionsMessage>
    //     );
    //   }

    //   return (
    //     <RSComponents.NoOptionsMessage {...props}>
    //       <div className="p-2 text-sm text-gray-500">
    //         {inputValue ? (
    //           <span>
    //             No {label ? label.toLowerCase() : "items"} found for "
    //             {inputValue}".
    //             {showCreateHint && (
    //               <span>
    //                 {" "}
    //                 Press{" "}
    //                 <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">
    //                   Enter
    //                 </kbd>{" "}
    //                 to add it as a new {label ? label.toLowerCase() : "item"}.
    //               </span>
    //             )}
    //           </span>
    //         ) : (
    //           <span>
    //             Start typing to search {label ? label.toLowerCase() : "items"}
    //             ...
    //           </span>
    //         )}
    //       </div>
    //     </RSComponents.NoOptionsMessage>
    //   );
    // };

    // Custom NoOptionsMessage component
    const NoOptionsMessage = (props) => {
      const { inputValue, allowCreateOnEnter, options, emptyMessage } =
        props.selectProps;
      const showCreateHint =
        allowCreateOnEnter && inputValue && inputValue.trim().length > 0;

      // 1. If user is searching (typing), show search results status
      if (inputValue) {
        return (
          <RSComponents.NoOptionsMessage {...props}>
            <div className="p-2 text-sm text-gray-500">
              <span>
                No {label ? label.toLowerCase() : "items"} found for "
                {inputValue}".
                {showCreateHint && (
                  <span>
                    {" "}
                    Press{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">
                      Enter
                    </kbd>{" "}
                    to add it.
                  </span>
                )}
              </span>
            </div>
          </RSComponents.NoOptionsMessage>
        );
      }

      // 2. If dropdown is open and there are NO options in the list at all
      // We check if options array is empty or null
      const hasNoOptions = !options || options.length === 0;

      if (hasNoOptions) {
        return (
          <RSComponents.NoOptionsMessage {...props}>
            <div className="p-2 text-sm text-gray-500">
              {/* Use the emptyMessage prop if provided, otherwise a default */}
              {emptyMessage
                ? emptyMessage
                : `No ${label ? label.toLowerCase() : "options"} available`}
            </div>
          </RSComponents.NoOptionsMessage>
        );
      }

      // 3. Fallback: If there ARE options but user hasn't typed yet, show the hint
      return (
        <RSComponents.NoOptionsMessage {...props}>
          <div className="p-2 text-sm text-gray-500">
            Start typing to search {label ? label.toLowerCase() : "items"}...
          </div>
        </RSComponents.NoOptionsMessage>
      );
    };

    componentsMap.NoOptionsMessage = NoOptionsMessage;

    const handleKeyDown = (e) => {
      // Only process Enter key for creatable fields or when allowCreateOnEnter is true
      if (e.key === "Enter" && (creatable || allowCreateOnEnter)) {
        // If this is an input inside the dropdown and we have a value, handle Enter to create
        const inputValue = e.target.value;
        if (inputValue && inputValue.trim().length > 0) {
          e.stopPropagation();
          e.preventDefault();
          if (onKeyDown) {
            // Pass a custom event with create action
            const createEvent = {
              ...e,
              target: {
                ...e.target,
                name: name,
                value: inputValue.trim(),
                action: "create",
              },
            };
            onKeyDown(createEvent);
          }
          return;
        }
      }

      // For all other cases, just pass through the event
      if (onKeyDown) onKeyDown(e);
    };

    // Helper to flatten options to support both flat and grouped options
    const flattenOptions = (opts) => {
      if (!Array.isArray(opts)) return [];
      const flat = [];
      opts.forEach((item) => {
        if (item && Array.isArray(item.options)) {
          item.options.forEach((child) => flat.push(child));
        } else if (item) {
          flat.push(item);
        }
      });
      return flat;
    };

    const flatOptions = flattenOptions(options);

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {!isCustomName ? (
          <div ref={containerRef}>
            <DropdownSelect
              options={options}
              isSearchable={isSearchable}
              components={componentsMap}
              filterOption={preserveStickyOptionFilter()}
              isMulti={isMulti}
              autoComplete={autoComplete}
              value={
                isMulti
                  ? Array.isArray(value)
                    ? flatOptions.filter((o) => value.includes(o.value))
                    : []
                  : flatOptions.find((o) => o.value === value) || null
              }
              onChange={(opt) => {
                // Ensure onChange is a function before calling
                if (!onChange) return;

                if (isMulti) {
                  const vals = Array.isArray(opt)
                    ? opt.map((o) => o.value)
                    : [];
                  onChange({ target: { name: name, value: vals } });
                  return;
                }

                // Handle single select
                if (opt?.value === "__other__") {
                  if (typeof setIsCustomName === "function") {
                    setIsCustomName(true);
                  }
                  onChange({ target: { name: name, value: "" } });
                } else {
                  // Ensure we always pass a valid value
                  const value = opt?.value !== undefined ? opt.value : "";
                  onChange({ target: { name: name, value: value } });
                }
              }}
              placeholder={placeholder ? placeholder : `Select ${label}`}
              isDisabled={disabled}
              hasError={!!error}
              classNamePrefix="rs"
              allowCreateOnEnter={allowCreateOnEnter}
              onKeyDown={handleKeyDown}
              onMenuOpen={onMenuOpen}
              onMenuClose={onMenuClose}
              menuIsOpen={menuIsOpen}
              onInputChange={onInputChange}
              onMenuScrollToBottom={onMenuScrollToBottom}
              closeMenuOnScroll={false}
              isLoading={loading}
              emptyMessage={emptyMessage}
              isClearable={isClearable}
              formatOptionLabel={formatOptionLabel}
            />
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange({ target: { name: name, value: newValue } });

                // If the input is cleared (empty string), automatically go back to dropdown
                if (newValue === "" && typeof setIsCustomName === "function") {
                  setIsCustomName(false);
                }
              }}
              className={`block w-full rounded-md shadow-sm h-10 px-3 sm:text-sm border
                            ${
                              error
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                        `}
              placeholder={placeholder ? placeholder : `Enter Custom ${label}`}
              ref={inputRef}
              onKeyDown={handleKeyDown}
            />
            <button
              title="Close Other"
              type="button"
              onClick={() => {
                onChange({ target: { name, value: "" } });
                setIsCustomName(false);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white px-1 py-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
        {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
      </div>
    );
  },
);

export default DropdownWithSearchField;
