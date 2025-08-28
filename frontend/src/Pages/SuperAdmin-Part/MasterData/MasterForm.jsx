import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const MasterForm = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  initialData = null,
  mode = "create", // can be "create" or "edit"
}) => {
  const [formData, setFormData] = useState({});

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

  // Initialize form state based on mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        [nameFieldKey]: "",
        CreatedBy: "",
        ModifiedBy: "",
        CreatedDate: new Date().toISOString(),
        ModifiedDate: null,
      });
    }
  }, [initialData, mode, nameFieldKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload =
      mode === "edit"
        ? {
            ...formData,
            ModifiedDate: new Date().toISOString(),
          }
        : {
            ...formData,
            CreatedDate: new Date().toISOString(),
          };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
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
          {/* Master Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Master Name
            </label>
            <input
              type="text"
              name={nameFieldKey}
              value={formData[nameFieldKey] || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
              required
            />
          </div>

          {/* Created By */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Created By
            </label>
            <input
              type="text"
              name="CreatedBy"
              value={formData.CreatedBy || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
              required={mode === "create"}
              disabled={mode === "edit"} // lock creator in edit mode
            />
          </div>

          {/* Modified By (only in edit mode) */}
          {mode === "edit" && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Modified By
              </label>
              <input
                type="text"
                name="ModifiedBy"
                value={formData.ModifiedBy || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-custom-blue outline-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-blue-700"
            >
              {mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterForm;
