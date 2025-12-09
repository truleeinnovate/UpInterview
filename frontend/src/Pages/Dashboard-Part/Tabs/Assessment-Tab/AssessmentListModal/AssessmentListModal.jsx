// v1.0.0 - Ashok - fixed unique check with name field

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { notify } from "../../../../../services/toastService.js";

const AssessmentListModal = ({
  show,
  onClose,
  createAssessmentTemplateList,
  useAssessmentList,
  tenantId,
  ownerId,
  setSelected,
  selectionType,
  setErrors,
}) => {
  const [newList, setNewList] = useState({
    categoryOrTechnology: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [options, setLocalOptions] = useState([]);

  const hasViewPermission = true; // replace with your actual permission logic
  const filters = { tenantId, ownerId };

  const { assessmentListData } = useAssessmentList(filters, hasViewPermission);

  // Fetch existing lists when popup opens
  useEffect(() => {
    if (!show) return;
    const fetchLists = async () => {
      try {
        const response = assessmentListData;

        if (response && Array.isArray(response)) {
          const formatted = response.map((item) => ({
            categoryOrTechnology: item?.categoryOrTechnology,
            value: item?.name,
            _id: item?._id,
          }));
          setLocalOptions(formatted);
        }
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };
    fetchLists();
  }, [show, assessmentListData]);

  // Auto-generate name field from label
  useEffect(() => {
    if (newList.categoryOrTechnology) {
      const generatedName = newList.categoryOrTechnology
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const isDuplicate = options.some(
        (opt) => opt.value.toLowerCase() === generatedName.toLowerCase()
      );

      // Only update when generated name actually changes to avoid re-render loops
      setNewList((prev) => {
        if (prev.name === generatedName) {
          return prev;
        }
        return { ...prev, name: generatedName };
      });
      setError(isDuplicate ? "A list with this name already exists." : "");
    } else {
      // Reset name only if needed to prevent unnecessary state updates
      setNewList((prev) => {
        if (!prev.name) {
          return prev;
        }
        return { ...prev, name: "" };
      });
      setError("");
    }
  }, [newList.categoryOrTechnology, options]);

  const handleCreateList = async () => {
    const { categoryOrTechnology, name } = newList;

    if (!categoryOrTechnology.trim() || !name.trim()) {
      setError("Both fields are required.");
      return;
    }

    // Duplicate check using `name` field instead of categoryOrTechnology
    const isDuplicateName = options.some(
      (opt) => opt.value.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicateName) {
      setError("A list with this label already exists.");
      return;
    }

    const nameRegex = /^[A-Za-z0-9_]+$/;
    if (!nameRegex.test(name)) {
      setError("Name can only contain letters, numbers, and underscores (_).");
      return;
    }

    try {
      const result = await createAssessmentTemplateList.mutateAsync({
        categoryOrTechnology,
        name,
        tenantId,
        ownerId,
      });

      if (!result.success) {
        notify.error(result.message || "Failed to create list");
        return;
      }

      // Refetch lists after creation
      if (selectionType === "object") {
        setSelected({ categoryOrTechnology, value: name.toLowerCase() });
      } else if (selectionType === "id") {
        setSelected(result.data._id);
      }

      notify.success("List created successfully!");
      onClose();
      setNewList({ categoryOrTechnology: "", name: "" });
      setError("");
      setErrors((prevErrors) => ({
        ...prevErrors,
        categoryOrTechnology: "",
      }));
    } catch (error) {
      console.error("Create List Error:", error);
      setError("Server error, please try again.");
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[1000]">
      <div className="relative bg-white rounded-lg shadow-lg w-[350px] p-6">
        <h2 className="text-lg text-custom-blue font-semibold mb-4">
          New List
        </h2>

        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="h-5 w-5 text-red-500" />
        </button>

        {/* Category/Technology */}
        <div className="mb-2">
          <div className="flex items-start gap-1">
            <label className="text-sm text-gray-800">Category/Technology</label>
            <label className="text-red-500">*</label>
          </div>
          <input
            type="text"
            value={newList.categoryOrTechnology}
            maxLength={30}
            onChange={(e) => {
              const cleanValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "");
              setNewList((prev) => ({
                ...prev,
                categoryOrTechnology: cleanValue,
              }));
              setError("");
            }}
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-custom-blue outline-none"
            placeholder="Category or Technology"
          />
          <div className="flex justify-between items-center mt-1">
            {error && (
              <p className="text-xs text-red-500">
                {error === "A list with this label already exists."
                  ? error
                  : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 ml-auto">
              {newList.categoryOrTechnology.length}/30
            </p>
          </div>
        </div>

        {/* Name Field */}
        <div className="mb-4">
          <div className="flex items-start gap-1">
            <label className="text-sm text-gray-800">Name</label>
            <label className="text-red-500">*</label>
          </div>
          <input
            type="text"
            value={newList.name}
            onChange={(e) => {
              const cleanValue = e.target.value
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "");
              setNewList((prev) => ({ ...prev, name: cleanValue }));
            }}
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-custom-blue outline-none"
            disabled
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCreateList}
            className="px-3 py-2 text-sm bg-custom-blue text-white rounded-md hover:bg-custom-blue/90"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssessmentListModal;
