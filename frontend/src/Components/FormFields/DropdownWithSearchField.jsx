import React, { useRef, forwardRef, useEffect } from 'react';
import DropdownSelect, { StickyFooterMenuList, preserveStickyOptionFilter } from "../Dropdowns/DropdownSelect";
import { components as RSComponents } from "react-select";

const DropdownWithSearchField = forwardRef(({
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
    isMulti = false,
    loading = false,
    onKeyDown,
    placeholder,
    creatable = false,
    allowCreateOnEnter = false, // New prop to control create on enter behavior
}, ref) => {
    const inputRef = useRef(null);

    // Handle ref forwarding and attach keyboard events
    useEffect(() => {
        if (ref) {
            if (typeof ref === 'function') {
                ref(inputRef.current);
            } else if (ref && 'current' in ref) {
                ref.current = inputRef.current;
            }
        }

        // Attach keyboard events to the react-select input
        const attachKeyboardEvents = () => {
            if (inputRef.current) {
                console.log('Attempting to attach keyboard events');
                // Find the react-select input element
                const selectContainer = inputRef.current.closest('.rs__control');
                if (selectContainer) {
                    const inputElement = selectContainer.querySelector('input');
                    if (inputElement && !inputElement.hasAttribute('data-keyboard-attached')) {
                        console.log('Attaching keyboard events to react-select input');
                        inputElement.addEventListener('keydown', (e) => {
                            console.log('React-select input keydown:', e.key, e.target.value);
                            if (onKeyDown) onKeyDown(e);
                        });
                        inputElement.setAttribute('data-keyboard-attached', 'true');
                        console.log('Keyboard events attached successfully');
                    } else if (inputElement && inputElement.hasAttribute('data-keyboard-attached')) {
                        console.log('Keyboard events already attached');
                    } else {
                        console.log('Input element not found in select container');
                    }
                } else {
                    console.log('Select container (.rs__control) not found');
                }
            } else {
                // console.log('inputRef.current is null');
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
    const NoOptionsMessage = (props) => {
        const { inputValue, allowCreateOnEnter } = props.selectProps;
        const showCreateHint = allowCreateOnEnter && inputValue && inputValue.trim().length > 0;
        
        return (
            <RSComponents.NoOptionsMessage {...props}>
                <div className="p-2 text-sm text-gray-500">
                    {inputValue ? (
                        <span>
                            No {label ? label.toLowerCase() : 'items'} found for "{inputValue}".
                            {showCreateHint && (
                                <span> Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> to add it as a new {label ? label.toLowerCase() : 'item'}.</span>
                            )}
                        </span>
                    ) : (
                        <span>Start typing to search {label ? label.toLowerCase() : 'items'}...</span>
                    )}
                </div>
            </RSComponents.NoOptionsMessage>
        );
    };
    componentsMap.NoOptionsMessage = NoOptionsMessage;

    const handleKeyDown = (e) => {
        console.log('Key pressed:', e.key, 'Value:', e.target.value);
        
        // Only process Enter key for creatable fields or when allowCreateOnEnter is true
        if (e.key === 'Enter' && (creatable || allowCreateOnEnter)) {
            // If this is an input inside the dropdown and we have a value, handle Enter to create
            const inputValue = e.target.value;
            if (inputValue && inputValue.trim().length > 0) {
                e.stopPropagation();
                e.preventDefault();
                console.log('Enter pressed with value, calling onKeyDown with create action');
                if (onKeyDown) {
                    // Pass a custom event with create action
                    const createEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            name: name,
                            value: inputValue.trim(),
                            action: 'create'
                        }
                    };
                    onKeyDown(createEvent);
                }
                return;
            }
        }
        
        // For all other cases, just pass through the event
        if (onKeyDown) onKeyDown(e);
    };

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
                        value={
                            isMulti
                                ? (Array.isArray(value)
                                    ? options.filter((o) => value.includes(o.value))
                                    : [])
                                : (options.find((o) => o.value === value) || null)
                        }
                        onChange={(opt) => {
                            // Ensure onChange is a function before calling
                            if (!onChange) return;
                            
                            if (isMulti) {
                                const vals = Array.isArray(opt) ? opt.map((o) => o.value) : [];
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
                            isLoading={loading}
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
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm border
                            ${error
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                        `}
                        placeholder={placeholder ? placeholder : `Enter Custom ${label}`}
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            )}
            {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
        </div>
    );
});

export default DropdownWithSearchField;
