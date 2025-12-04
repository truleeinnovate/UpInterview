// v1.0.0 - Ashok - fixed ShareReportPopup.
// v1.0.1 - Ashok - changed UI

// components/ShareReportPopup.jsx
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { X, Users, Shield, Check, Search } from "lucide-react";
import { useUsers } from "../../../../apiHooks/useUsers.js";
import { useRolesQuery } from "../../../../apiHooks/useRoles.js";
import { useShareReport } from "../../../../apiHooks/useReportTemplates.js";
import { useAllReportAccess } from "../../../../apiHooks/useReportTemplates.js"; // ← NEW: Tenant-wide access
import { notify } from "../../../../services/toastService.js";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { useUserProfile } from "../../../../apiHooks/useUsers.js";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { ChevronDown } from "lucide-react";

// const DropdownWithSearchField = forwardRef(
//   (
//     {
//       value,
//       options = [],
//       name,
//       onChange,
//       error,
//       isCustomName = false,
//       setIsCustomName = undefined,
//       containerRef,
//       disabled = false,
//       isSearchable = true,
//       label,
//       required = false,
//       isMulti = false,
//       loading = false,
//       placeholder,
//       creatable = false,
//       allowCreateOnEnter = false,
//     },
//     ref
//   ) => {
//     // Internal State for the Custom Dropdown
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const internalContainerRef = useRef(null);
//     const inputRef = useRef(null);

//     // Forward ref to the input
//     useEffect(() => {
//       if (ref) {
//         if (typeof ref === "function") ref(inputRef.current);
//         else if (ref && "current" in ref) ref.current = inputRef.current;
//       }
//     }, [ref]);

//     // Click Outside to Close
//     useEffect(() => {
//       const handleClickOutside = (event) => {
//         if (
//           internalContainerRef.current &&
//           !internalContainerRef.current.contains(event.target)
//         ) {
//           setIsOpen(false);
//         }
//       };
//       document.addEventListener("mousedown", handleClickOutside);
//       return () =>
//         document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     // Flatten options to handle groups if necessary (same utility as before)
//     const flattenOptions = (opts) => {
//       if (!Array.isArray(opts)) return [];
//       const flat = [];
//       opts.forEach((item) => {
//         if (item && Array.isArray(item.options)) {
//           item.options.forEach((child) => flat.push(child));
//         } else if (item) {
//           flat.push(item);
//         }
//       });
//       return flat;
//     };

//     const flatOptions = flattenOptions(options);

//     // Filter options based on search term
//     const filteredOptions = flatOptions.filter((opt) =>
//       opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Handle Option Selection
//     const handleSelect = (optionValue) => {
//       if (disabled) return;

//       if (isMulti) {
//         // Multi-select logic: Toggle value
//         const currentValues = Array.isArray(value) ? value : [];
//         let newValues;
//         if (currentValues.includes(optionValue)) {
//           newValues = currentValues.filter((v) => v !== optionValue);
//         } else {
//           newValues = [...currentValues, optionValue];
//         }
//         onChange({ target: { name: name, value: newValues } });
//         // Keep menu open for multi-select
//       } else {
//         // Single-select logic
//         onChange({ target: { name: name, value: optionValue } });
//         setIsOpen(false);
//         setSearchTerm(""); // Reset search on select
//       }
//     };

//     // Handle "Other / Custom" selection
//     const handleSwitchToCustom = () => {
//       if (typeof setIsCustomName === "function") {
//         setIsCustomName(true);
//         onChange({ target: { name: name, value: "" } });
//         setIsOpen(false);
//       }
//     };

//     // Determine what text to show in the main input box
//     const getDisplayValue = () => {
//       if (isOpen) return searchTerm; // When typing, show search term

//       if (isMulti) {
//         const selectedCount = Array.isArray(value) ? value.length : 0;
//         return selectedCount > 0 ? `${selectedCount} selected` : "";
//       }

//       // Single Select: Find the label for the selected value
//       const selectedOption = flatOptions.find((o) => o.value === value);
//       return selectedOption ? selectedOption.label : "";
//     };

//     return (
//       <div className="w-full" ref={containerRef}>
//         {/* --- MODE 1: CUSTOM TEXT INPUT (When "Other" is active) --- */}
//         {isCustomName ? (
//           <div className="relative">
//             <input
//               ref={inputRef}
//               type="text"
//               value={value}
//               onChange={(e) => {
//                 const newValue = e.target.value;
//                 onChange({ target: { name: name, value: newValue } });
//                 // Auto-revert if cleared
//                 if (newValue === "" && typeof setIsCustomName === "function") {
//                   setIsCustomName(false);
//                 }
//               }}
//               placeholder={placeholder || `Enter Custom ${label}`}
//               className={`block w-full rounded-md shadow-sm h-10 px-3 border outline-none
//                 ${
//                   error
//                     ? "border-red-500 focus:ring-1 focus:ring-red-500"
//                     : "border-gray-300 focus:ring-1 focus:ring-custom-blue"
//                 }`}
//             />
//             {/* Remove Button for Custom Name */}
//             <button
//               title="Close Custom Input"
//               type="button"
//               onClick={() => {
//                 onChange({ target: { name, value: "" } });
//                 if (typeof setIsCustomName === "function")
//                   setIsCustomName(false);
//               }}
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-full hover:bg-gray-200"
//             >
//               <X className="h-4 w-4 text-gray-500" />
//             </button>
//           </div>
//         ) : (
//           /* --- MODE 2: CUSTOM DROPDOWN (Matches your UI requirement) --- */
//           <div className="relative" ref={internalContainerRef}>
//             <div
//               className="relative cursor-pointer"
//               onClick={() => !disabled && setIsOpen(true)}
//             >
//               {/* Search Icon */}
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />

//               {/* Main Input Field */}
//               <input
//                 type="text"
//                 placeholder={
//                   isOpen
//                     ? "Type to search..."
//                     : placeholder || `Select ${label}`
//                 }
//                 value={isOpen ? searchTerm : getDisplayValue()}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   if (!isOpen) setIsOpen(true);
//                 }}
//                 onFocus={() => setIsOpen(true)}
//                 disabled={disabled}
//                 className={`w-full pl-10 pr-10 py-2.5 border rounded-md outline-none transition-shadow
//                     ${error ? "border-red-500" : "border-gray-300"}
//                     ${
//                       isOpen
//                         ? "ring-2 ring-custom-blue border-custom-blue"
//                         : "focus:ring-2 focus:ring-custom-blue"
//                     }
//                     ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
//                 `}
//               />

//               {/* Chevron Icon (Visual indicator) */}
//               <ChevronDown
//                 className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
//                   isOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </div>

//             {/* Dropdown List */}
//             {isOpen && !disabled && (
//               <div className="absolute z-[9999] w-full bg-white border border-gray-100 rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto">
//                 {loading && (
//                   <div className="p-3 text-center text-gray-400 text-sm">
//                     Loading...
//                   </div>
//                 )}

//                 {!loading && filteredOptions.length === 0 && (
//                   <div className="p-3 text-center text-gray-400 text-sm">
//                     No options found
//                   </div>
//                 )}

//                 {!loading &&
//                   filteredOptions.map((option) => {
//                     const isSelected = isMulti
//                       ? Array.isArray(value) && value.includes(option.value)
//                       : value === option.value;

//                     return (
//                       <button
//                         key={option.value}
//                         type="button"
//                         onClick={() => handleSelect(option.value)}
//                         className={`w-full flex justify-between items-center px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors
//                         ${
//                           isSelected
//                             ? "bg-blue-50 font-medium text-custom-blue"
//                             : "text-gray-700"
//                         }
//                       `}
//                       >
//                         <span>{option.label}</span>
//                         {isSelected && (
//                           <Check className="w-4 h-4 text-custom-blue" />
//                         )}
//                       </button>
//                     );
//                   })}

//                 {/* --- Sticky Footer: "Other" Option --- */}
//                 {setIsCustomName && (
//                   <div className="border-t border-gray-100 p-1 sticky bottom-0 bg-white">
//                     <button
//                       type="button"
//                       onClick={handleSwitchToCustom}
//                       className="w-full text-left px-4 py-2 text-sm text-custom-blue hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
//                     >
//                       <span className="text-lg">+</span> Enter Custom Name
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {error && <p className="text-red-500 text-xs pt-1 ml-1">{error}</p>}
//       </div>
//     );
//   }
// );

const DropdownWithSearchField = forwardRef(
  (
    {
      value,
      options = [],
      name,
      onChange,
      error,
      isCustomName = false,
      setIsCustomName = undefined,
      containerRef,
      disabled = false,
      isSearchable = true, // Default is true
      label,
      required = false,
      isMulti = false,
      loading = false,
      placeholder,
    },
    ref
  ) => {
    // Internal State
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const internalContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Forward ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") ref(inputRef.current);
        else if (ref && "current" in ref) ref.current = inputRef.current;
      }
    }, [ref]);

    // Click Outside to Close
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          internalContainerRef.current &&
          !internalContainerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm(""); // Clear search when closing
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Flatten options
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

    // Filter options based on search term (ONLY if searchable)
    const filteredOptions = isSearchable
      ? flatOptions.filter((opt) =>
          opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : flatOptions;

    // Handle Option Selection
    const handleSelect = (optionValue) => {
      if (disabled) return;

      if (isMulti) {
        const currentValues = Array.isArray(value) ? value : [];
        let newValues;
        if (currentValues.includes(optionValue)) {
          newValues = currentValues.filter((v) => v !== optionValue);
        } else {
          newValues = [...currentValues, optionValue];
        }
        onChange({ target: { name: name, value: newValues } });
      } else {
        onChange({ target: { name: name, value: optionValue } });
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    // Handle "Other / Custom" selection
    const handleSwitchToCustom = () => {
      if (typeof setIsCustomName === "function") {
        setIsCustomName(true);
        onChange({ target: { name: name, value: "" } });
        setIsOpen(false);
      }
    };

    // Determine Display Value
    const getDisplayValue = () => {
      if (isSearchable && isOpen) return searchTerm; // Show typing when searching

      if (isMulti) {
        const selectedCount = Array.isArray(value) ? value.length : 0;
        return selectedCount > 0 ? `${selectedCount} selected` : "";
      }

      // Single Select
      const selectedOption = flatOptions.find((o) => o.value === value);
      return selectedOption ? selectedOption.label : "";
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* --- MODE 1: CUSTOM TEXT INPUT --- */}
        {isCustomName ? (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange({ target: { name: name, value: newValue } });
                if (newValue === "" && typeof setIsCustomName === "function") {
                  setIsCustomName(false);
                }
              }}
              placeholder={placeholder || `Enter Custom ${label}`}
              className={`block w-full rounded-md shadow-sm h-10 px-3 border outline-none
                ${
                  error
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:ring-1 focus:ring-custom-blue"
                }`}
            />
            <button
              title="Close Custom Input"
              type="button"
              onClick={() => {
                onChange({ target: { name, value: "" } });
                if (typeof setIsCustomName === "function")
                  setIsCustomName(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-full hover:bg-gray-200"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ) : (
          /* --- MODE 2: DROPDOWN (Searchable or Standard) --- */
          <div className="relative" ref={internalContainerRef}>
            <div
              className="relative cursor-pointer"
              onClick={() => !disabled && setIsOpen(true)}
            >
              {/* Only show Search Icon if it IS searchable */}
              {isSearchable && (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              )}

              <input
                type="text"
                readOnly={!isSearchable} // Blocks typing on mobile/desktop
                placeholder={
                  isOpen && isSearchable
                    ? "Type to search..."
                    : placeholder || `Select ${label || "Option"}`
                }
                // If not searchable, ALWAYS show display value. If searchable + open, show search term.
                value={
                  !isSearchable || !isOpen ? getDisplayValue() : searchTerm
                }
                onChange={(e) => {
                  if (!isSearchable) return; // Prevent search updates if disabled
                  setSearchTerm(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                disabled={disabled}
                className={`w-full py-2.5 border rounded-md outline-none transition-shadow
                    ${isSearchable ? "pl-10" : "pl-4"} pr-10
                    ${error ? "border-red-500" : "border-gray-300"}
                    ${
                      isOpen
                        ? "ring-2 ring-custom-blue border-custom-blue"
                        : "focus:ring-2 focus:ring-custom-blue"
                    }
                    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                    ${!isSearchable ? "cursor-pointer caret-transparent" : ""} 
                `}
                // caret-transparent hides the blinking cursor if it's not searchable
              />

              <ChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown List */}
            {isOpen && !disabled && (
              <div className="absolute z-[9999] w-full bg-white border border-gray-100 rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto">
                {loading && (
                  <div className="p-3 text-center text-gray-400 text-sm">
                    Loading...
                  </div>
                )}

                {!loading && filteredOptions.length === 0 && (
                  <div className="p-3 text-center text-gray-400 text-sm">
                    No options found
                  </div>
                )}

                {!loading &&
                  filteredOptions.map((option) => {
                    const isSelected = isMulti
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex justify-between items-center px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors
                        ${
                          isSelected
                            ? "bg-blue-50 font-medium text-custom-blue"
                            : "text-gray-700"
                        }
                      `}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-custom-blue" />
                        )}
                      </button>
                    );
                  })}

                {setIsCustomName && (
                  <div className="border-t border-gray-100 p-1 sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={handleSwitchToCustom}
                      className="w-full text-left px-4 py-2 text-sm text-custom-blue hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">+</span> Enter Custom Name
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-xs pt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

const ShareReportPopup = ({ templateId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("roles"); // "roles" | "users"

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Global hooks
  const { userProfile } = useUserProfile();
  const { effectivePermissions_RoleName } = usePermissions();
  const { usersRes } = useUsers({ limit: 1000 });
  const { data: allRoles } = useRolesQuery({ fetchAllRoles: true });

  const dropdownRef = useRef(null);

  // ONE API CALL: Get access for ALL reports in tenant
  const { data: accessMap = {}, isLoading: accessLoading } =
    useAllReportAccess();

  // Current access for this specific template
  const currentAccess = accessMap[templateId] || { roles: [], users: [] };

  const shareMutation = useShareReport();

  // Load current sharing when popup opens
  useEffect(() => {
    if (!isOpen || accessLoading) return;

    const roleIds =
      currentAccess.roles?.map((r) => r._id?.toString() || r) || [];
    const userIds =
      currentAccess.users?.map((u) => u._id?.toString() || u) || [];

    setSelectedRoles(roleIds);
    setSelectedUsers(userIds);
  }, [currentAccess, isOpen, accessLoading]);

  // Normalize roles (hide current user's role + organization only)
  const organizationRoles = (allRoles || [])
    .filter((role) => role.roleType === "organization")
    .map((role) => ({
      _id: role._id,
      name: role.label || role.roleName || role.name || "Unnamed Role",
      label: role.label || role.roleName || role.name || "Unnamed Role",
      usersCount: role.usersCount || role.users?.length || 0,
    }))
    .filter((role) => role.name !== effectivePermissions_RoleName); // Hide own role

  // Normalize users (exclude current user)
  const usersList = (usersRes?.users || [])
    .filter((user) => user?._id !== userProfile?._id)
    .map((user) => {
      const roleObj = allRoles?.find((r) => r._id === user.roleId);
      return {
        _id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: roleObj?.label || roleObj?.name || user?.roleName || "No Role",
        status: user.status,
      };
    });

  // Search filter
  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle handlers
  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    if (selectedRoles.length === 0 && selectedUsers.length === 0) {
      notify.error("Please select at least one role or user");
      return;
    }

    shareMutation.mutate(
      { templateId, roleIds: selectedRoles, userIds: selectedUsers },
      {
        onSuccess: () => {
          notify.success("Report shared successfully!");
          onClose();
        },
        onError: () => notify.error("Failed to share report"),
      }
    );
  };

  // Detect changes
  const hasChanges =
    JSON.stringify(currentAccess.roles?.map((r) => r._id).sort() || []) !==
      JSON.stringify(selectedRoles.sort()) ||
    JSON.stringify(currentAccess.users?.map((u) => u._id).sort() || []) !==
      JSON.stringify(selectedUsers.sort());

  if (!isOpen) return null;

  // --------------- Left and right and Search + dropdown ----------------------
  const roleOptions = organizationRoles.map((role) => ({
    label: role.name,
    value: role._id,
  }));

  const userOptions = filteredUsers.map((user) => ({
    label: user.name,
    value: user._id,
  }));

  const handleSelectionChange = (e) => {
    const { value } = e.target;

    if (activeTab === "roles") {
      setSelectedRoles(value);
    } else {
      setSelectedUsers(value);
    }
  };

  const tabOptions = [
    { label: "Roles", value: "roles" },
    { label: "Users", value: "users" },
  ];
  // ------------------------------------------------------

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white border-b">
          <h2 className="text-2xl font-bold text-custom-blue">Share Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-3 mt-4 text-custom-blue text-sm border-b bg-custom-blue/10 font-medium mb-6">
          Select who can access this report — you can share it with specific
          roles or individual users.
        </div>
        <div className="flex sm:flex-col md:flex-col sm:justify-start md:justify-start justify-between items-center gap-4 mb-6 px-6 w-full">
          {/* SEARCH + DROPDOWN COMBINED */}
          <div className="w-full">
            <DropdownWithSearchField
              name={activeTab}
              placeholder={
                activeTab === "roles" ? "Search Roles" : "Search Users / Email"
              }
              value={activeTab === "roles" ? selectedRoles : selectedUsers}
              options={activeTab === "roles" ? roleOptions : userOptions}
              onChange={handleSelectionChange}
              isMulti={true}
              isSearchable={true}
              ref={dropdownRef}
            />
          </div>

          {/* DROPDOWN SELECTOR */}
          <div className="w-full md:w-40">
            <DropdownWithSearchField
              value={activeTab}
              options={tabOptions}
              onChange={(e) => setActiveTab(e.target.value)}
              isSearchable={false}
              isMulti={false}
              placeholder="Select Type"
            />
          </div>
        </div>

        <div className="p-8 space-y-8">
          {(selectedRoles.length > 0 || selectedUsers.length > 0) && (
            <div className="bg-gradient-to-r from-custom-blue/10 to-green-500/10 px-4 py-2 rounded-xl border-2 border-custom-blue/30">
              <p className="font-bold text-custom-blue mb-4 text-md">
                Report will be shared with:
              </p>
              <div className="flex flex-wrap gap-3">
                {selectedRoles.map((id) => {
                  const role = organizationRoles.find((r) => r._id === id);
                  return (
                    <span
                      key={id}
                      className="bg-custom-blue text-white px-4 py-2 rounded-full font-medium text-xs"
                    >
                      Role: {role?.name}
                    </span>
                  );
                })}
                {selectedUsers.map((id) => {
                  const user = usersList.find((u) => u._id === id);
                  return (
                    <span
                      key={id}
                      className="bg-green-600 text-white px-4 py-2 rounded-full font-medium text-xs"
                    >
                      User: {user?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={
              shareMutation.isPending ||
              !hasChanges ||
              (selectedRoles.length === 0 && selectedUsers.length === 0)
            }
            className="px-8 py-2.5 bg-custom-blue text-white font-bold rounded-xl hover:bg-custom-blue/90 disabled:opacity-50 shadow-lg transition"
          >
            {shareMutation.isPending ? "Sharing..." : "Share Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareReportPopup;
