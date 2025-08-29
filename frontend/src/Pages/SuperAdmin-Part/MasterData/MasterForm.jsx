import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import Papa from "papaparse";

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

  // Get correct field name based on type
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
      default:
        return "Name";
    }
  };

  const nameFieldKey = getNameFieldKey();

  // Initialize form
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        [nameFieldKey]: "",
        CreatedDate: new Date().toISOString(),
        ModifiedDate: null,
      });
      setFields([{ id: Date.now(), data: { [nameFieldKey]: "" } }]);
    }
  }, [initialData, mode, nameFieldKey]);

  // Handle CSV upload
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

  // Handle multiple manual inputs
  const handleFieldChange = (id, e) => {
    const { name, value } = e.target;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, [name]: value } } : f
      )
    );
  };

  const addNewField = () => {
    setFields((prev) => [
      ...prev,
      { id: Date.now(), data: { [nameFieldKey]: "" } },
    ]);
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (csvData) {
      // Bulk from CSV
      const payload = csvData.map((item) => ({
        ...item,
        CreatedDate: new Date().toISOString(),
      }));
      onSubmit(payload);
    } else if (mode === "create" && fields.length > 1) {
      // Bulk manual entries
      const bulkPayload = fields.map((f) => ({
        ...f.data,
        CreatedDate: new Date().toISOString(),
      }));
      onSubmit(bulkPayload);
    } else {
      // Single record
      const payload =
        mode === "edit"
          ? { ...formData, ModifiedDate: new Date().toISOString() }
          : {
              ...fields[0].data,
              CreatedDate: new Date().toISOString(),
            };
      onSubmit(payload);
    }

    // Reset
    onClose();
    setCsvData(null);
    setFields([{ id: Date.now(), data: { [nameFieldKey]: "" } }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
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
          {/* CSV Upload */}
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

          {/* Manual fields if no CSV */}
          {!csvData && (
            <>
              {mode === "create" &&
                fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 border rounded-lg mb-2 relative"
                  >
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Master Name {fields.length > 1 && `#${idx + 1}`}
                    </label>
                    <input
                      type="text"
                      name={nameFieldKey}
                      value={f.data[nameFieldKey] || ""}
                      onChange={(e) => handleFieldChange(f.id, e)}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none mb-2"
                      required
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(f.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

              {mode === "create" && (
                <button
                  type="button"
                  onClick={addNewField}
                  className="flex items-center gap-1 text-custom-blue text-sm font-medium hover:underline"
                >
                  <Plus size={16} /> Add More
                </button>
              )}

              {mode === "edit" && (
                <div>
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
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
                    required
                  />
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
