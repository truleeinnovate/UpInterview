// // v1.0.0 - Ashok - Added extra fields for technology and category

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, ChevronDown } from "lucide-react";
import Papa from "papaparse";

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
        return "RoleName";
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

  // helper: create a fresh empty field object that includes extra fields for type
  const createEmptyField = () => {
    const base = { [nameFieldKey]: "" };
    if (type === "technology") base.Category = "";
    if (type === "category") base.isActive = null;
    return { id: Date.now(), data: base };
  };

  // Initialize form (supports: single edit object, array-edit (bulk edit) or create)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // If initialData is an array -> show bulk-edit fields
      if (Array.isArray(initialData) && initialData.length > 0) {
        setFields(
          initialData.map((item, i) => ({
            id: Date.now() + i,
            data: { ...item },
          }))
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
          setCsvData(results.data);
        },
      });
    }
  };

  // update a specific field (text inputs)
  const handleFieldChange = (id, e) => {
    const { name, value } = e.target;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, [name]: value } } : f
      )
    );
  };

  const addNewField = () => setFields((prev) => [...prev, createEmptyField()]);

  const removeField = (id) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  // submit: supports CSV bulk, manual bulk (create/edit), single create/edit
  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   if (csvData) {
  //     const payload = csvData.map((item) => ({ ...item }));
  //     onSubmit(payload);
  //   } else if (fields.length > 1) {
  //     // bulk create OR bulk edit (if mode === 'edit' and initialData was array)
  //     const bulkPayload = fields.map((f) => ({ ...f.data }));
  //     onSubmit(bulkPayload);
  //   } else {
  //     // single record
  //     const payload =
  //       mode === "edit"
  //         ? { ...formData, ModifiedDate: new Date().toISOString() }
  //         : { ...fields[0].data };
  //     onSubmit(payload);
  //   }

  //   // reset UI
  //   onClose();
  //   setCsvData(null);
  //   setFields([createEmptyField()]);
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   if (csvData) {
  //     // Bulk from CSV
  //     const payload = csvData.map((item) => ({ ...item }));
  //     onSubmit(payload);
  //   } else if (mode === "create" && fields.length > 1) {
  //     // Bulk manual create
  //     const bulkPayload = fields.map((f) => ({ ...f.data }));
  //     onSubmit(bulkPayload);
  //   } else if (mode === "edit" && fields.length > 1) {
  //     // Bulk edit
  //     const bulkPayload = fields.map((f) => ({
  //       ...f.data,
  //     }));
  //     onSubmit(bulkPayload);
  //   } else {
  //     // Single record
  //     const payload =
  //       mode === "edit"
  //         ? { ...formData, }
  //         : { ...fields[0].data };
  //     onSubmit(payload);
  //   }

  //   // reset after submit
  //   onClose();
  //   setCsvData(null);
  //   setFields([createEmptyField()]);
  // };

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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg px-6 relative max-h-[90%] overflow-y-auto py-12">
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
          {/* CSV upload (create only) */}
          {mode === "create" && (
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Upload CSV (optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center justify-center w-full border-2 border-dashed border-custom-blue rounded-xl cursor-pointer bg-custom-blue/5 hover:bg-custom-blue/10 transition p-6"
                >
                  <Upload size={30} className="text-custom-blue mb-2" />
                  <span className="text-sm text-custom-blue font-medium">
                    Click to upload CSV
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
                        Master Name {fields.length > 1 && `#${idx + 1}`}
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

                    {type === "technology" && (
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Category
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
                                  : field
                              )
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                          required
                        />
                      </div>
                    )}

                    {type === "category" && (
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Status
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
                                  : field
                              )
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
                    Master Name
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
                        Category
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
                    </div>
                  )}

                  {type === "category" && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Status
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

// import React, { useState, useEffect } from "react";
// import { X, Plus, Trash2, Upload, ChevronDown } from "lucide-react";
// import Papa from "papaparse";

// const StatusDropdown = ({ value, onChange }) => {
//   const [open, setOpen] = useState(false);
//   const options = [
//     { label: "Active", value: true },
//     { label: "Inactive", value: false },
//   ];

//   return (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen(!open)}
//         className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-custom-blue outline-none shadow-sm"
//       >
//         <span>
//           {value === true
//             ? "Active"
//             : value === false
//             ? "Inactive"
//             : "Select Status"}
//         </span>
//         <ChevronDown
//           className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
//           {options.map((opt) => (
//             <div
//               key={opt.value.toString()}
//               onClick={() => {
//                 onChange(opt.value);
//                 setOpen(false);
//               }}
//               className={`px-3 py-2 cursor-pointer hover:bg-custom-blue/10 ${
//                 value === opt.value ? "bg-custom-blue/20 font-medium" : ""
//               }`}
//             >
//               {opt.label}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const MasterForm = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   type,
//   initialData = null,
//   mode = "create", // "create" or "edit"
// }) => {
//   const [formData, setFormData] = useState({});
//   const [csvData, setCsvData] = useState(null);
//   const [fields, setFields] = useState([]);

//   // Get correct field name based on type
//   // v1.0.0 <----------------------------------------------
//   const getNameFieldKey = () => {
//     switch (type) {
//       case "industries":
//         return "IndustryName";
//       case "technology":
//         return "TechnologyMasterName";
//       case "skills":
//         return "SkillName";
//       case "locations":
//         return "LocationName";
//       case "roles":
//         return "RoleName";
//       case "qualification":
//         return "QualificationName";
//       case "universitycollege":
//         return "University_CollegeName";
//       case "company":
//         return "CompanyName";
//       case "category":
//         return "CategoryName";
//       default:
//         return "Name";
//     }
//   };
//   const nameFieldKey = getNameFieldKey();

//   // Initialize form
//   useEffect(() => {
//     if (mode === "edit" && initialData) {
//       setFormData(initialData);
//     } else {
//       setFormData({
//         [nameFieldKey]: "",
//       });
//       setFields([{ id: Date.now(), data: { [nameFieldKey]: "" } }]);
//     }
//   }, [initialData, mode, nameFieldKey]);
//   // v1.0.0 ---------------------------------------------->

//   // Handle CSV upload
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       Papa.parse(file, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           setCsvData(results.data);
//         },
//       });
//     }
//   };

//   // Handle multiple manual inputs
//   const handleFieldChange = (id, e) => {
//     const { name, value } = e.target;
//     setFields((prev) =>
//       prev.map((f) =>
//         f.id === id ? { ...f, data: { ...f.data, [name]: value } } : f
//       )
//     );
//   };

//   const addNewField = () => {
//     setFields((prev) => [
//       ...prev,
//       { id: Date.now(), data: { [nameFieldKey]: "" } },
//     ]);
//   };

//   const removeField = (id) => {
//     setFields((prev) => prev.filter((f) => f.id !== id));
//   };

//   // v1.0.1 <-------------------------------------------------------------
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (csvData) {
//       // Bulk from CSV
//       const payload = csvData.map((item) => ({
//         ...item,
//       }));
//       onSubmit(payload);
//     } else if (mode === "create" && fields.length > 1) {
//       // Bulk manual entries
//       const bulkPayload = fields.map((f) => ({
//         ...f.data,
//       }));
//       onSubmit(bulkPayload);
//     } else {
//       // Single record
//       const payload =
//         mode === "edit"
//           ? { ...formData, ModifiedDate: new Date().toISOString() }
//           : {
//               ...fields[0].data,
//             };
//       onSubmit(payload);
//     }

//     // Reset
//     onClose();
//     setCsvData(null);
//     setFields([{ id: Date.now(), data: { [nameFieldKey]: "" } }]);
//   };

//   // v1.0.0 ------------------------------------------------------------->

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-lg px-6 relative max-h-[90%] overflow-y-auto py-12">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//         >
//           <X size={20} />
//         </button>

//         <h2 className="text-xl font-semibold mb-4 text-custom-blue">
//           {mode === "edit" ? "Update Master" : "Create Master"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* CSV Upload */}
//           {mode === "create" && (
//             <div className="mt-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">
//                 Upload CSV (optional)
//               </label>
//               <div className="flex items-center justify-center w-full">
//                 <label
//                   htmlFor="csv-upload"
//                   className="flex flex-col items-center justify-center w-full border-2 border-dashed border-custom-blue rounded-xl cursor-pointer bg-custom-blue/5 hover:bg-custom-blue/10 transition p-6"
//                 >
//                   <Upload size={30} className="text-custom-blue mb-2" />
//                   <span className="text-sm text-custom-blue font-medium">
//                     Click to upload CSV
//                   </span>
//                   <span className="text-xs text-gray-500 mt-1">
//                     Only .csv files supported
//                   </span>
//                 </label>
//                 <input
//                   id="csv-upload"
//                   type="file"
//                   accept=".csv"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//               </div>

//               {csvData && (
//                 <p className="mt-2 text-xs font-medium text-green-600">
//                   {csvData.length} records ready to upload
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Manual fields if no CSV */}
//           {/* v1.0.1 <------------------------------------------------------------------------- */}
//           {/* {!csvData && (
//             <>
//               {mode === "create" &&
//                 fields.map((f, idx) => (
//                   <div
//                     key={f.id}
//                     className="p-3 border rounded-lg mb-2 relative"
//                   >
//                     <label className="block text-gray-700 text-sm font-medium mb-1">
//                       Master Name {fields.length > 1 && `#${idx + 1}`}
//                     </label>
//                     <input
//                       type="text"
//                       name={nameFieldKey}
//                       value={f.data[nameFieldKey] || ""}
//                       onChange={(e) => handleFieldChange(f.id, e)}
//                       className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none mb-2"
//                       required
//                     />
//                     {fields.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeField(f.id)}
//                         className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     )}
//                   </div>
//                 ))}

//               {mode === "create" && (
//                 <button
//                   type="button"
//                   onClick={addNewField}
//                   className="flex items-center gap-1 text-custom-blue text-sm font-medium hover:underline"
//                 >
//                   <Plus size={16} /> Add More
//                 </button>
//               )}

//               {mode === "edit" && (
//                 <div>
//                   <label className="block text-gray-700 text-sm font-medium mb-1">
//                     Master Name
//                   </label>
//                   <input
//                     type="text"
//                     name={nameFieldKey}
//                     value={formData[nameFieldKey] || ""}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         [nameFieldKey]: e.target.value,
//                       })
//                     }
//                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
//                     required
//                   />
//                 </div>
//               )}
//             </>
//           )} */}
//           {!csvData && (
//             <>
//               {mode === "create" &&
//                 fields.map((f, idx) => (
//                   <div
//                     key={f.id}
//                     className="p-3 border rounded-lg mb-3 relative space-y-3"
//                   >
//                     {/* Master Name */}
//                     <div>
//                       <label className="block text-gray-700 text-sm font-medium mb-1">
//                         Master Name {fields.length > 1 && `#${idx + 1}`}
//                       </label>
//                       <input
//                         type="text"
//                         name={nameFieldKey}
//                         value={f.data[nameFieldKey] || ""}
//                         onChange={(e) => handleFieldChange(f.id, e)}
//                         className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
//                         required
//                       />
//                     </div>

//                     {/* Extra field for technology */}
//                     {type === "technology" && (
//                       <div>
//                         <label className="block text-gray-700 text-sm font-medium mb-1">
//                           Category
//                         </label>
//                         <input
//                           type="text"
//                           name="Category"
//                           value={f.data.Category || ""}
//                           onChange={(e) =>
//                             setFields((prev) =>
//                               prev.map((field) =>
//                                 field.id === f.id
//                                   ? {
//                                       ...field,
//                                       data: {
//                                         ...field.data,
//                                         Category: e.target.value,
//                                       },
//                                     }
//                                   : field
//                               )
//                             )
//                           }
//                           className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
//                           required
//                         />
//                       </div>
//                     )}

//                     {/* Extra field for category */}
//                     {type === "category" && (
//                       <div>
//                         <label className="block text-gray-700 text-sm font-medium mb-1">
//                           Status
//                         </label>
//                         <StatusDropdown
//                           value={f.data.isActive}
//                           onChange={(val) =>
//                             setFields((prev) =>
//                               prev.map((field) =>
//                                 field.id === f.id
//                                   ? {
//                                       ...field,
//                                       data: { ...field.data, isActive: val },
//                                     }
//                                   : field
//                               )
//                             )
//                           }
//                         />
//                       </div>
//                     )}

//                     {/* Remove button */}
//                     {fields.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeField(f.id)}
//                         className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     )}
//                   </div>
//                 ))}

//               {mode === "create" && (
//                 <button
//                   type="button"
//                   onClick={addNewField}
//                   className="flex items-center gap-1 text-custom-blue text-sm font-medium hover:underline"
//                 >
//                   <Plus size={16} /> Add More
//                 </button>
//               )}
//             </>
//           )}

//           {/* v1.0.1 -------------------------------------------------------------------------> */}

//           <div className="flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
//             >
//               {mode === "edit"
//                 ? "Update"
//                 : csvData
//                 ? "Upload CSV"
//                 : fields.length > 1
//                 ? "Save All"
//                 : "Create"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default MasterForm;

// v1.0.1 - Ashok - Fix: edit/view + bulk-edit support + per-row extra fields
