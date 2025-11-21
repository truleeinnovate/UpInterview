import React from "react";
import Select, { components } from "react-select";

// Centralized react-select styles used app-wide
export const selectBaseStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: hasError
      ? "#ef4444" // red-500
      : state.isFocused
      ? "#217989" // custom-blue focus ring
      : "#d1d5db", // gray-300
    boxShadow: "none",
    "&:hover": {
      borderColor: hasError ? "#ef4444" : "#9ca3af", // gray-400
    },
    borderRadius: 6,
    fontSize: "inherit", // inherit from wrapper for responsive match with InputField
    lineHeight: "inherit",
    fontFamily: "inherit",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontFamily: "inherit",
  }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 12 }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  // When using menuPortalTarget, react-select renders into a portal container;
  // ensure it's above scrollable content like question lists
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (base) => ({
    ...base,
    maxHeight: 200,
    overflowY: "auto",
    paddingBottom: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: "black",
    fontWeight: 500,
    lineHeight: "inherit",
    fontFamily: "inherit",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "inherit", // inherit to match InputField across breakpoints
    fontWeight: 400, // normal weight like native input placeholder
    lineHeight: "inherit",
    fontFamily: "inherit",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  }),
  input: (base) => ({
    ...base,
    fontSize: "inherit",
    lineHeight: "inherit",
    fontFamily: "inherit",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "inherit",
    backgroundColor: state.isSelected
      ? "#217989" // custom-blue for selected
      : state.isFocused
      ? "rgba(33, 121, 137, 0.1)" // custom-blue/10 for hover
      : base.backgroundColor,
    color: state.isSelected ? "#ffffff" : base.color,
    fontWeight: state.data?.isCustomOption ? "600" : base.fontWeight,
    fontStyle: state.data?.isCustomOption ? "italic" : base.fontStyle,
    "&:active": {
      backgroundColor: state.isSelected
        ? "#217989" // keep custom-blue if already selected
        : "rgba(33, 121, 137, 0.5)", // custom-blue/50 for click
    },
  }),


   // ✅ Added styles for multi-value chips
   multiValue: (base) => ({
    ...base,
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: 4,
    padding: "0 4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#000",
    fontWeight: 500,
  }),
  multiValueRemove: (base, state) => ({
    ...base,
    color: "#6b7280",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "transparent",
      color: "#ef4444",
    },
  }),

});

// Sticky footer MenuList that keeps a special option fixed at the bottom (e.g. value "__other__")
export const makeStickyOptionMenuList = (stickyValue = "__other__") => {
  const StickyMenuList = (props) => {
    const items = React.Children.toArray(props.children);
    const stickyIndex = items.findIndex(
      (child) => child?.props?.data?.value === stickyValue
    );

    let stickyEl = null;
    let normalItems = items;
    if (stickyIndex !== -1) {
      stickyEl = items[stickyIndex];
      normalItems = items.filter((_, i) => i !== stickyIndex);
    }

    return (
      <components.MenuList {...props}>
        {normalItems}
        {stickyEl && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "#ffffff",
              borderTop: "1px solid #e5e7eb",
              zIndex: 1,
            }}
          >
            {stickyEl}
          </div>
        )}
      </components.MenuList>
    );
  };
  return StickyMenuList;
};

// Generic sticky footer MenuList (keeps a special option like "__other__" fixed at bottom)
export const StickyFooterMenuList = makeStickyOptionMenuList("__other__");

// Helper filter that never hides the sticky option (e.g. "__other__")
export const preserveStickyOptionFilter = (stickyValue = "__other__") =>
  (option, input) => {
    if (option?.data?.value === stickyValue) return true;
    if (!input) return true;
    const label = option?.label || "";
    return label.toLowerCase().includes((input || "").toLowerCase());
  };

// Reusable Select wrapper with default styles and easy error state
const DropdownSelect = React.forwardRef(({ hasError = false, classNamePrefix = "rs", styles, ...rest }, ref) => {
  const mergedStyles = styles || selectBaseStyles(hasError);
  return (
    <div ref={ref} tabIndex={-1} className="text-base sm:text-sm leading-5">
      <Select styles={mergedStyles} classNamePrefix={classNamePrefix} {...rest} />
    </div>
  );
});

export default DropdownSelect;
