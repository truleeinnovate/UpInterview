// // v1.0.0 - Ashok - Added extra fields for technology and category
// v1.0.1 - Ashok - implemented drag and drop functionality
// v1.0.2 - Ashok - Added Name field

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, ChevronDown } from "lucide-react";
import Papa from "papaparse";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { notify } from "../../../services/toastService";
import { useMasterData } from "../../../apiHooks/useMasterData";
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-custom-blue outline-none shadow-sm"
      >
        <span>
          {value === true
            ? "Active"
            : value === false
              ? "Inactive"
              : "Select Status"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
          {options.map((opt) => (
            <div
              key={opt.value.toString()}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-custom-blue/40 ${
                value === opt.value
                  ? "bg-custom-blue font-medium text-white"
                  : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MasterForm = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  initialData = null,
  mode = "create", // "create" or "edit"
}) => {
  const [formData, setFormData] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [fields, setFields] = useState([]);

  // ----------------- Related roles ---------------------------------------------
  const { currentRoles, loadCurrentRoles, isCurrentRolesFetching } =
    useMasterData({}, "adminPortal", "roles");
  // ----------------- Related roles ---------------------------------------------

  // v1.0.1 <---------------------------------------------------
  // Add inside MasterForm
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const isValidCsvRow = (row) => {
    if (type === "roles") {
      return (
        row.roleName?.trim() &&
        row.roleLabel?.trim() &&
        row.roleCategory?.trim()
      );
    }

    // default validation for other masters
    return Object.values(row).some(
      (val) => val && val.toString().trim() !== "",
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // setCsvData(results.data);
            const filteredData = results.data.filter(isValidCsvRow);
            setCsvData(filteredData);
          },
        });
      } else {
        alert("Only .csv files are supported!");
      }
    }
  };

  // v1.0.1 --------------------------------------------------->

  // get name field key based on type
  const getNameFieldKey = () => {
    switch (type) {
      case "industries":
        return "IndustryName";
      case "technology":
        return "TechnologyMasterName";
      case "skills":
        return "SkillName";
      case "locations":
        return "LocationName";
      case "roles":
        return "roleName";
      case "qualification":
        return "QualificationName";
      case "universitycollege":
        return "University_CollegeName";
      case "company":
        return "CompanyName";
      case "category":
        return "CategoryName";
      default:
        return "Name";
    }
  };
  const nameFieldKey = getNameFieldKey();

  // Helper for Required Star
  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

  // Validation Logic
  const validateFields = (dataArray) => {
    for (let i = 0; i < dataArray.length; i++) {
      const item = dataArray[i];
      const entryNum = dataArray.length > 1 ? `(Entry ${i + 1})` : "";

      if (!item[nameFieldKey]?.trim()) {
        notify.error(
          `${capitalizeFirstLetter(type)} Name is required ${entryNum}`,
        );
        return false;
      }

      if (type === "roles") {
        if (!item.roleLabel?.trim()) {
          notify.error(`Role Label is required ${entryNum}`);
          return false;
        }
        if (!item.roleCategory?.trim()) {
          notify.error(`Role Category is required ${entryNum}`);
          return false;
        }
        if (!item.relatedRoles || item.relatedRoles.length === 0) {
          notify.error(`Related Roles are required ${entryNum}`);
          return false;
        }
      }

      if (type === "technology") {
        if (!item.Category?.trim()) {
          notify.error(`Category is required ${entryNum}`);
          return false;
        }
        if (!item.name?.trim()) {
          notify.error(`Technical Name is required ${entryNum}`);
          return false;
        }
      }

      if (type === "category" && item.isActive === null) {
        notify.error(`Status is required ${entryNum}`);
        return false;
      }
    }
    return true;
  };

  // v1.0.2 <---------------------------------------------------------------------------
  // helper: create a fresh empty field object that includes extra fields for type
  // const createEmptyField = () => {
  //   const base = { [nameFieldKey]: "" };
  //   if (type === "technology") base.Category = "";
  //   if (type === "category") base.isActive = null;
  //   return { id: Date.now(), data: base };
  // };

  const createEmptyField = () => {
    const base = { [nameFieldKey]: "" };
    if (type === "technology") {
      base.Category = "";
      base.name = ""; //
    }

    // v1.0.3: Add role-specific fields
    if (type === "roles") {
      base.roleLabel = "";
      base.roleCategory = "";
      base.relatedRoles = [];
    }

    if (type === "category") base.isActive = null;
    return { id: Date.now(), data: base };
  };
  // v1.0.2 <--------------------------------------------------------------------------->

  // Initialize form (supports: single edit object, array-edit (bulk edit) or create)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // If initialData is an array -> show bulk-edit fields
      if (Array.isArray(initialData) && initialData.length > 0) {
        setFields(
          initialData.map((item, i) => ({
            id: Date.now() + i,
            data: { ...item },
          })),
        );
        setFormData(initialData[0] || {}); // keep a fallback
      } else if (!Array.isArray(initialData)) {
        // single edit
        setFormData({ ...initialData });
        setFields([{ id: Date.now(), data: { ...initialData } }]);
      } else {
        // fallback
        setFormData({ [nameFieldKey]: "" });
        setFields([createEmptyField()]);
      }
    } else {
      // create mode or no initial data
      setFormData({ [nameFieldKey]: "" });
      setFields([createEmptyField()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, mode, nameFieldKey, type]);

  // CSV upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // setCsvData(results.data);
          const filteredData = results.data.filter(isValidCsvRow);
          setCsvData(filteredData);
        },
      });
    }
  };

  // update a specific field (text inputs)
  const handleFieldChange = (id, e) => {
    const { name, value } = e.target;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, [name]: value } } : f,
      ),
    );
  };

  const addNewField = () => setFields((prev) => [...prev, createEmptyField()]);

  const removeField = (id) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  // --------------------------------------- Related roles -----------------------------------------
  const handleSelectChange = (selectedOptions, id, isSingleEdit = false) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];

    if (isSingleEdit) {
      setFormData({ ...formData, relatedRoles: values });
    } else {
      setFields((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, data: { ...f.data, relatedRoles: values } } : f,
        ),
      );
    }
  };

  // Transform currentRoles for the dropdown
  const roleOptions =
    currentRoles?.map((role) => ({
      label: role.roleLabel,
      value: role.roleName,
    })) || [];
  // --------------------------------------- Related roles -----------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    let payload;

    if (csvData && csvData.length > 0) {
      // Priority to CSV if uploaded
      payload = csvData.map((item) => ({ ...item }));
    } else if (fields.length > 1) {
      // Bulk manual entries
      payload = fields.map((f) => ({ ...f.data }));
    } else {
      // Single record (create or edit)
      payload = mode === "edit" ? { ...formData } : { ...fields[0].data };
    }

    // Run Validation
    if (!validateFields(payload)) return;

    // Call parent's onSubmit
    onSubmit(payload);

    // Reset UI
    onClose();
    setCsvData(null);
    setFields([createEmptyField()]);
  };

  if (!isOpen) return null;

  const isBulkEdit = mode === "edit" && fields.length > 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl px-6 relative max-h-[90%] overflow-y-auto py-12">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-custom-blue">
          {mode === "edit" ? "Update Master" : "Create Master"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* v1.0.1 <--------------------------------------------------------- */}
          {/* CSV upload (create only) */}
          {mode === "create" && (
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Upload CSV (optional)
              </label>
              <div
                className={`flex items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition p-6 
              ${
                dragActive
                  ? "border-green-500 bg-green-50"
                  : "border-custom-blue bg-custom-blue/5 hover:bg-custom-blue/10"
              }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center justify-center w-full"
                >
                  <Upload size={30} className="text-custom-blue mb-2" />
                  <span className="text-sm text-custom-blue font-medium">
                    Drag & Drop CSV here or Click to upload
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Only .csv files supported
                  </span>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {csvData && (
                <p className="mt-2 text-xs font-medium text-green-600">
                  {csvData.length} records ready to upload
                </p>
              )}
            </div>
          )}

          {/* v1.0.1 ---------------------------------------------------------> */}

          {/* Manual fields (create OR bulk-edit) */}
          {!csvData && (
            <>
              {(mode === "create" || isBulkEdit) &&
                fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 border rounded-lg mb-3 relative space-y-3"
                  >
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        {/* Master Name */}
                        {capitalizeFirstLetter(type) || type}
                        {fields.length > 1 && `#${idx + 1}`}
                        <RequiredStar />
                      </label>
                      <input
                        type="text"
                        name={nameFieldKey}
                        value={f.data[nameFieldKey] || ""}
                        onChange={(e) => handleFieldChange(f.id, e)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                        required
                      />
                    </div>

                    {/* v1.0.3: Add role-specific fields */}
                    {type === "roles" && (
                      <>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Role Label <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="roleLabel"
                            value={f.data.roleLabel || ""}
                            onChange={(e) =>
                              setFields((prev) =>
                                prev.map((field) =>
                                  field.id === f.id
                                    ? {
                                        ...field,
                                        data: {
                                          ...field.data,
                                          roleLabel: e.target.value,
                                        },
                                      }
                                    : field,
                                ),
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Role Category <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="roleCategory"
                            value={f.data.roleCategory || ""}
                            onChange={(e) =>
                              setFields((prev) =>
                                prev.map((field) =>
                                  field.id === f.id
                                    ? {
                                        ...field,
                                        data: {
                                          ...field.data,
                                          roleCategory: e.target.value,
                                        },
                                      }
                                    : field,
                                ),
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Related Roles <RequiredStar />
                          </label>
                          <DropdownSelect
                            isMulti
                            placeholder="Select related roles..."
                            options={roleOptions}
                            isLoading={isCurrentRolesFetching}
                            onMenuOpen={() => loadCurrentRoles()}
                            value={roleOptions.filter((opt) =>
                              f.data.relatedRoles?.includes(opt.value),
                            )}
                            onChange={(selected) =>
                              handleSelectChange(selected, f.id)
                            }
                            closeMenuOnSelect={false}
                            required={true}
                          />
                        </div>
                      </>
                    )}

                    {type === "technology" && (
                      <>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Category <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="Category"
                            value={f.data.Category || ""}
                            onChange={(e) =>
                              setFields((prev) =>
                                prev.map((field) =>
                                  field.id === f.id
                                    ? {
                                        ...field,
                                        data: {
                                          ...field.data,
                                          Category: e.target.value,
                                        },
                                      }
                                    : field,
                                ),
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                            required
                          />
                        </div>

                        {/* New Field Added */}
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Name <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="Name"
                            value={f.data.name || ""}
                            onChange={(e) =>
                              setFields((prev) =>
                                prev.map((field) =>
                                  field.id === f.id
                                    ? {
                                        ...field,
                                        data: {
                                          ...field.data,
                                          name: e.target.value,
                                        },
                                      }
                                    : field,
                                ),
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                            required
                          />
                        </div>
                      </>
                    )}

                    {type === "category" && (
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Status <RequiredStar />
                        </label>
                        <StatusDropdown
                          value={f.data.isActive}
                          onChange={(val) =>
                            setFields((prev) =>
                              prev.map((field) =>
                                field.id === f.id
                                  ? {
                                      ...field,
                                      data: { ...field.data, isActive: val },
                                    }
                                  : field,
                              ),
                            )
                          }
                        />
                      </div>
                    )}

                    {fields.length > 1 && (
                      <button
                        title="Remove"
                        type="button"
                        onClick={() => removeField(f.id)}
                        className="absolute -top-1 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

              {/* Add more - shown for create and bulk-edit (you can change this if you want it only for create) */}
              {(mode === "create" || isBulkEdit) && (
                <button
                  type="button"
                  onClick={addNewField}
                  className="flex items-center gap-1 text-custom-blue text-sm font-medium hover:underline"
                >
                  <Plus size={16} /> Add More
                </button>
              )}

              {/* Single edit view (mode === 'edit' and not bulk) */}
              {mode === "edit" && !isBulkEdit && (
                <div className="p-3 border rounded-lg">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Master Name <RequiredStar />
                  </label>
                  <input
                    type="text"
                    name={nameFieldKey}
                    value={formData[nameFieldKey] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [nameFieldKey]: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none mb-3"
                    required
                  />

                  {type === "technology" && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Category <RequiredStar />
                      </label>
                      <input
                        type="text"
                        name="Category"
                        value={formData.Category || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, Category: e.target.value })
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                        required
                      />
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Name <RequiredStar />
                        </label>
                        <input
                          type="text"
                          name="Name"
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* v1.0.3: Add role-specific fields for single edit */}
                  {type === "roles" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Role Label <RequiredStar />
                        </label>
                        <input
                          type="text"
                          name="roleLabel"
                          value={formData.roleLabel || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roleLabel: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none mb-3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Role Category <RequiredStar />
                        </label>
                        <input
                          type="text"
                          name="roleCategory"
                          value={formData.roleCategory || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roleCategory: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none mb-3"
                          required
                        />
                      </div>
                      <div className="mt-3">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Related Roles <RequiredStar />
                        </label>
                        <DropdownSelect
                          isMulti
                          placeholder="Select related roles..."
                          options={roleOptions}
                          isLoading={isCurrentRolesFetching}
                          onMenuOpen={() => loadCurrentRoles()}
                          value={roleOptions.filter((opt) =>
                            formData.relatedRoles?.includes(opt.value),
                          )}
                          onChange={(selected) =>
                            handleSelectChange(selected, null, true)
                          }
                          closeMenuOnSelect={false}
                          required={true}
                        />
                      </div>
                    </>
                  )}

                  {type === "category" && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Status <RequiredStar />
                      </label>
                      <StatusDropdown
                        value={formData.isActive}
                        onChange={(val) =>
                          setFormData({ ...formData, isActive: val })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
            >
              {mode === "edit"
                ? "Update"
                : csvData
                  ? "Upload CSV"
                  : fields.length > 1
                    ? "Save All"
                    : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterForm;
