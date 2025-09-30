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
    label,
    required = false,
    onMenuOpen,
    isMulti = false,
    loading = false,
    onKeyDown,
    creatable = false,
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
        const { inputValue } = props.selectProps;
        return (
            <RSComponents.NoOptionsMessage {...props}>
                <div className="p-2 text-sm text-gray-500">
                    {inputValue ? (
                        <span>
                            No skills found for "{inputValue}". Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> to add it as a new skill.
                        </span>
                    ) : (
                        <span>Start typing to search skills...</span>
                    )}
                </div>
            </RSComponents.NoOptionsMessage>
        );
    };
    componentsMap.NoOptionsMessage = NoOptionsMessage;

    const handleKeyDown = (e) => {
        console.log('Key pressed:', e.key, 'Value:', e.target.value);
        if (e.key === 'Enter' && creatable) {
            e.stopPropagation();
            console.log('Enter pressed on creatable field, calling onKeyDown');
            if (onKeyDown) onKeyDown(e);
            return;
        }
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
                        isSearchable
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
                            if (isMulti) {
                                const vals = Array.isArray(opt) ? opt.map((o) => o.value) : [];
                                onChange({ target: { name: name, value: vals } });
                                return;
                            }
                            if (opt?.value === "__other__") {
                                if (typeof setIsCustomName === "function") {
                                    setIsCustomName(true);
                                }
                                onChange({ target: { name: name, value: "" } });
                            } else {
                                if (typeof setIsCustomName === "function") {
                                    setIsCustomName(false);
                                }
                                onChange({ target: { name: name, value: opt?.value || "" } });
                            }
                        }}
                        placeholder={`Select a ${label}`}
                        isDisabled={disabled}
                        hasError={!!error}
                        classNamePrefix="rs"
                        onKeyDown={(e) => {
                            console.log('DropdownSelect key event:', e.key);
                            if (onKeyDown) onKeyDown(e);
                        }}
                        onMenuOpen={onMenuOpen}
                        isLoading={loading}
                    />
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange({ target: { name: name, value: e.target.value } })}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
            border ${error
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
            focus:outline-gray-300
          `}
                        placeholder={`Enter custom ${label} name`}
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof setIsCustomName === "function") {
                                setIsCustomName(false);
                            }
                            onChange({ target: { name: name, value: "" } });
                        }}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
        </div>
    );
});

export default DropdownWithSearchField;
