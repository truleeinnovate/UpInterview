// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { ArrowLeft, Save, Tags } from "lucide-react";
// import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
// import {
//   useCreateInterviewerTag,
//   useUpdateInterviewerTag,
// } from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
// import { notify } from "../../../../services/toastService";

// // Mock Utility for routing since createPageUrl was an import
// const createPageUrl = (page) => `/${page.toLowerCase()}`;

// const colorOptions = [
//   { value: "#217989", label: "Teal" },
//   { value: "#6366f1", label: "Indigo" },
//   { value: "#8b5cf6", label: "Purple" },
//   { value: "#ec4899", label: "Pink" },
//   { value: "#f59e0b", label: "Amber" },
//   { value: "#10b981", label: "Emerald" },
//   { value: "#3b82f6", label: "Blue" },
//   { value: "#ef4444", label: "Red" },
//   { value: "#64748b", label: "Slate" },
//   { value: "#84cc16", label: "Lime" },
//   { value: "#06b6d4", label: "Cyan" },
//   { value: "#f97316", label: "Orange" },
// ];

// // Dummy Data to simulate an existing tag for editing
// const DUMMY_TAGS = {
//   123: {
//     name: "React Expert",
//     description: "Interviewer qualified for advanced React.js assessments.",
//     color: "#6366f1",
//     category: "skill",
//     is_active: true,
//   },
// };

// const InterviewerTagsForm = ({ mode }) => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   // 2. Initialize the mutations
//   const createTagMutation = useCreateInterviewerTag();
//   const updateTagMutation = useUpdateInterviewerTag();

//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     color: "#217989",
//     category: "skill",
//     is_active: true,
//   });

//   const categoryOptions = [
//     { value: "skill", label: "Skill" },
//     { value: "level", label: "Experience Level" },
//     { value: "department", label: "Department" },
//     { value: "certification", label: "Certification" },
//     { value: "language", label: "Language" },
//     { value: "other", label: "Other" },
//   ];

//   // Simulate Fetching Data
//   useEffect(() => {
//     if (id) {
//       setIsLoading(true);
//       // Simulate network delay
//       setTimeout(() => {
//         const tag = DUMMY_TAGS[id];
//         if (tag) {
//           setFormData(tag);
//         }
//         setIsLoading(false);
//       }, 500);
//     }
//   }, [id]);

//   // Simulate Saving Data
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Configuration for callbacks
//     const mutationOptions = {
//       onSuccess: () => {
//         notify.success(
//           id ? "Tag updated successfully!" : "Tag created successfully!",
//         );
//         navigate(-1);
//       },
//       onError: (error) => {
//         notify.error(
//           error?.response?.data?.message || "An error occurred while saving.",
//         );
//       },
//     };

//     if (id) {
//       // Use the update mutation
//       updateTagMutation.mutate({ id: id, data: formData }, mutationOptions);
//     } else {
//       // Use the create mutation
//       createTagMutation.mutate(formData, mutationOptions);
//     }
//   };

//   // if (id && isLoading) {
//   //   return (
//   //     <div className="flex items-center justify-center min-h-[400px]">
//   //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217989]"></div>
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="px-[8%] sm:px-[5%] md:px-[5%] mt-4 space-y-6 mb-12">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-start gap-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
//           <span className="text-sm tracking-tight">
//             Back to Interviewer Tags
//           </span>
//         </button>

//         <div>
//           {/* <h1 className="text-xl font-bold text-slate-900 tracking-tight">
//             {id ? "Edit Tag" : "Create Tag"}
//           </h1> */}
//           <p className="text-xl font-bold text-slate-900 tracking-tight mt-1">
//             {id ? "Update tag details" : "Create a new interviewer tag"}
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Card Replacement */}
//         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-slate-100">
//             <div className="flex items-center gap-2 font-semibold text-slate-900">
//               <Tags className="w-5 h-5 text-[#217989]" />
//               Tag Information
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
//               {/* Tag Name */}
//               <div className="">
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-slate-700 mb-1"
//                 >
//                   Tag Name <span className="ml-1 text-red-500">*</span>
//                 </label>
//                 <input
//                   id="name"
//                   type="text"
//                   className="w-full h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217989] transition-all"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   placeholder="React Expert"
//                 />
//               </div>

//               {/* Category */}
//               <div>
//                 <DropdownWithSearchField
//                   label="Category"
//                   name="category"
//                   options={categoryOptions}
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   placeholder="Select or search category"
//                   isSearchable={true}
//                 />
//               </div>
//             </div>

//             {/* Color Grid */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-700">
//                 Tag Color
//               </label>
//               {/* <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
//                 {colorOptions.map((color) => (
//                   <button
//                     key={color.value}
//                     type="button"
//                     className={`w-10 h-10 rounded-lg border-2 transition-all ${
//                       formData.color === color.value
//                         ? "border-slate-900 shadow-md"
//                         : "border-transparent hover:scale-105"
//                     }`}
//                     style={{ backgroundColor: color.value }}
//                     onClick={() =>
//                       setFormData({ ...formData, color: color.value })
//                     }
//                     title={color.label}
//                   />
//                 ))}
//               </div> */}
//               <div className="flex flex-wrap gap-1">
//                 {colorOptions.map((color) => (
//                   <button
//                     key={color.value}
//                     type="button"
//                     className={`w-20 h-20 rounded-md border-2 transition-all ${
//                       formData.color === color.value
//                         ? "border-slate-900 shadow-md"
//                         : "border-transparent hover:scale-105"
//                     }`}
//                     style={{ backgroundColor: color.value }}
//                     onClick={() =>
//                       setFormData({ ...formData, color: color.value })
//                     }
//                     title={color.label}
//                   />
//                 ))}
//               </div>
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium text-slate-700"
//               >
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217989] transition-all"
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 placeholder="Describe what this tag represents..."
//                 rows={3}
//               />
//             </div>

//             {/* Switch Replacement */}
//             <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={formData.is_active}
//                   onChange={(e) =>
//                     setFormData({ ...formData, is_active: e.target.checked })
//                   }
//                 />
//                 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#217989]"></div>
//                 <span className="ml-3 text-sm font-medium text-slate-700">
//                   Active tag
//                 </span>
//               </label>
//             </div>

//             {/* Preview Section */}
//             <div className="pt-4 border-t border-slate-100">
//               <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
//                 Preview
//               </label>
//               <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
//                 <div
//                   className="w-6 h-6 rounded-full shadow-sm"
//                   style={{ backgroundColor: formData.color }}
//                 />
//                 <span className="font-semibold text-slate-900">
//                   {formData.name || "Tag Name"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end gap-4">
//           <Link
//             to={createPageUrl("InterviewerTags")}
//             className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
//           >
//             Cancel
//           </Link>
//           <button
//             type="submit"
//             disabled={isSaving}
//             className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#217989] hover:bg-[#1c6473] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//           >
//             <Save className="w-4 h-4" />
//             {isSaving ? "Saving..." : id ? "Update Tag" : "Create Tag"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default InterviewerTagsForm;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Tags } from "lucide-react";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import {
  useCreateInterviewerTag,
  useUpdateInterviewerTag,
  useGetInterviewerTagById, // Added this hook to fetch real data
} from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
import { notify } from "../../../../services/toastService";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";

const colorOptions = [
  { value: "#217989", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#64748b", label: "Slate" },
  { value: "#84cc16", label: "Lime" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
];

const InterviewerTagsForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit" || !!id;

  // 1. Mutations and Queries
  const createTagMutation = useCreateInterviewerTag();
  const updateTagMutation = useUpdateInterviewerTag();

  // Use the hook to fetch data if in edit mode
  const { data: existingTag, isLoading: isFetching } = useGetInterviewerTagById(
    id,
    {
      enabled: isEditMode && !!id,
    },
  );

  useScrollLock(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#217989",
    category: "skill",
    is_active: true,
  });

  const categoryOptions = [
    { value: "skill", label: "Skill" },
    { value: "level", label: "Experience Level" },
    { value: "department", label: "Department" },
    { value: "certification", label: "Certification" },
    { value: "language", label: "Language" },
    { value: "other", label: "Other" },
  ];

  // 2. Set form data when existingTag is successfully fetched
  useEffect(() => {
    if (isEditMode && existingTag) {
      setFormData({
        name: existingTag.name || "",
        description: existingTag.description || "",
        color: existingTag.color || "#217989",
        category: existingTag.category || "skill",
        is_active: existingTag.is_active ?? true,
      });
    }
  }, [existingTag, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mutationOptions = {
      onSuccess: () => {
        notify.success(
          isEditMode
            ? "Tag updated successfully!"
            : "Tag created successfully!",
        );
        navigate(-1);
      },
      onError: (error) => {
        notify.error(
          error?.response?.data?.message || "An error occurred while saving.",
        );
      },
    };

    if (isEditMode) {
      updateTagMutation.mutate({ id: id, data: formData }, mutationOptions);
    } else {
      createTagMutation.mutate(formData, mutationOptions);
    }
  };

  // Show a loading state while fetching data in edit mode
  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217989]"></div>
      </div>
    );
  }

  return (
    <SidebarPopup
      title={isEditMode ? "Update tag details" : "Create Interviewer Tag"}
      onClose={() => navigate(-1)}
    >
      <div className="mt-4 space-y-6 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white overflow-hidden">

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                {/* Tag Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Tag Name <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217989] transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="React Expert"
                  />
                </div>

                {/* Category */}
                <div>
                  <DropdownWithSearchField
                    label="Category"
                    name="category"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Select or search category"
                    isSearchable={true}
                  />
                </div>
              </div>

              {/* Color Grid */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tag Color
                </label>
                <div className="flex flex-wrap gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-16 h-16 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? "border-slate-900 shadow-md"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setFormData({ ...formData, color: color.value })
                      }
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217989] transition-all"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this tag represents..."
                  rows={3}
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-3 pt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#217989]"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    Active tag
                  </span>
                </label>
              </div>

              {/* Preview Section */}
              <div className="pt-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Preview
                </label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="font-semibold text-slate-900">
                    {formData.name || "Tag Name"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border font-medium text-slate-700 bg-white rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createTagMutation.isLoading || updateTagMutation.isLoading
              }
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#217989] hover:bg-[#1c6473] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {createTagMutation.isLoading || updateTagMutation.isLoading
                ? "Saving..."
                : isEditMode
                  ? "Update Tag"
                  : "Create Tag"}
            </button>
          </div>
        </form>
      </div>
    </SidebarPopup>
  );
};

export default InterviewerTagsForm;
