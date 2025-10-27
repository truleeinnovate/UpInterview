// v1.0.0 - Ashok - made kanban as common

// import React, { useState } from "react";
// import TemplateModal from "./TemplateModal";

// const TemplateCard = ({ template, onClick }) => {
//   const capitalizeFirstLetter = (str) =>
//     str?.charAt(0)?.toUpperCase() + str?.slice(1);

//   return (
//     <div
//       className="relative bg-white rounded-xl p-5 border border-slate-100 shadow transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-200"
//       onClick={() => onClick(template)}
//     >
//       <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-800 to-teal-500"></div>

//       <div className="flex justify-between items-start mb-3 gap-3">
//         <div className="flex flex-col gap-2 flex-1">
//           <div className="flex items-center gap-2">
//             <h3 className="font-bold text-gray-900 text-lg leading-5 tracking-tight">
//               {template.title}
//             </h3>
//             <span
//               className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                 template.type === "standard"
//                   ? "bg-blue-100 text-blue-600"
//                   : "bg-green-100 text-green-600"
//               }`}
//             >
//               {capitalizeFirstLetter(template.type)}
//             </span>
//           </div>
//           <p className="text-gray-500 text-sm leading-5 mb-4">
//             {template.description}
//           </p>
//         </div>
//         <span
//           className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//             template.status === "active"
//               ? "bg-green-100 text-green-600"
//               : "bg-gray-200 text-gray-600"
//           }`}
//         >
//           {capitalizeFirstLetter(template.status)}
//         </span>
//       </div>

//       <div className="flex flex-col gap-2 mb-4">
//         <div className="flex justify-between items-start text-sm gap-3">
//           <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
//             Best For
//           </span>
//           <span className="text-gray-800 font-medium text-right flex-1">
//             {template.bestFor}
//           </span>
//         </div>
//         <div className="flex justify-between items-start text-sm gap-3">
//           <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
//             Format
//           </span>
//           <span className="text-gray-800 font-medium text-right flex-1">
//             {template.format}
//           </span>
//         </div>
//         <div className="flex justify-between items-start text-sm gap-3">
//           <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
//             Key Characteristic
//           </span>
//           <span className="text-gray-800 font-medium text-right flex-1">
//             {template.keyCharacteristic}
//           </span>
//         </div>
//         <div className="flex justify-between items-start text-sm gap-3">
//           <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
//             Category
//           </span>
//           <span className="text-gray-800 font-medium text-right flex-1">
//             {template.category}
//           </span>
//         </div>
//       </div>

//       <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-md text-sm text-slate-700 border border-slate-200 font-medium">
//         <strong>Rounds:</strong> {template.rounds}
//       </div>
//     </div>
//   );
// };

// const StandardTemplateKanbanView = ({ templatesData }) => {
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   // Group templates by category
//   const groupedTemplates = templatesData.reduce((acc, template) => {
//     const category = template.category || "Uncategorized";
//     if (!acc[category]) {
//       acc[category] = [];
//     }
//     acc[category].push(template);
//     return acc;
//   }, {});

//   const handleCardClick = (template) => {
//     setSelectedTemplate(template);
//   };

//   const closeModal = () => {
//     setSelectedTemplate(null);
//   };

//   return (
//     <>
//       <div className="px-6 h-[80vh] overflow-y-auto">
//         <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-6 items-start">
//           {Object.entries(groupedTemplates).map(
//             ([category, categoryTemplates]) => (
//               <div
//                 key={category}
//                 className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 shadow-sm"
//               >
//                 <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
//                   <h2 className="text-xl font-bold text-teal-800 tracking-tight">
//                     {category}
//                   </h2>
//                   <span className="bg-teal-800 text-white px-3 py-1 rounded-full text-xs font-bold text-center shadow-[0_2px_4px_rgba(33,121,137,0.3)]">
//                     {categoryTemplates.length}
//                   </span>
//                 </div>

//                 <div className="flex flex-col gap-4">
//                   {categoryTemplates.map((template) => (
//                     <TemplateCard
//                       key={template.id}
//                       template={template}
//                       onClick={handleCardClick}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )
//           )}
//         </div>
//       </div>

//       {selectedTemplate && (
//         <TemplateModal template={selectedTemplate} onClose={closeModal} />
//       )}
//     </>
//   );
// };

// export default StandardTemplateKanbanView;

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Layers, Eye, Pencil } from "lucide-react";
import { formatDateTime } from "../../../utils/dateFormatter";

const KanbanView = ({
  templates,
  loading = false,
  effectivePermissions,
  onView,
  onEdit,
}) => {
  const inProgressTemplates =
    templates?.filter((t) => ["active", "draft"].includes(t?.status)) || [];
  const otherTemplates =
    templates?.filter((t) => !["active", "draft"].includes(t?.status)) || [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
            variants={item}
          >
            <div className="flex justify-between items-start mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 skeleton-animation rounded mt-1"></div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
              </div>
            </div>
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                <div className="h-8 bg-gray-200 skeleton-animation rounded-lg"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* In Progress / Active Templates */}
      <motion.div
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Active/Draft</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {inProgressTemplates?.length || 0}
          </span>
        </div>
        <div className="space-y-4">
          {inProgressTemplates?.length > 0 ? (
            inProgressTemplates?.map((template, index) => (
              <motion.div
                key={template?._id || index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      effectivePermissions?.InterviewTemplates?.View &&
                      onView?.(template)
                    }
                  >
                    <h4 className="text-xl font-medium text-gray-900 truncate">
                      {template?.title || "Untitled"}
                    </h4>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {effectivePermissions?.InterviewTemplates?.View && (
                      <button
                        onClick={() => onView?.(template)}
                        className="text-custom-blue hover:bg-custom-blue/80 p-2 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {effectivePermissions?.InterviewTemplates?.Edit && (
                      <button
                        onClick={() => onEdit?.(template)}
                        className="text-purple-500 hover:bg-purple-50 p-2 rounded-lg"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900">
                        {template?.rounds?.length || 0}{" "}
                        {template?.rounds?.length <= 1 ? "Round" : "Rounds"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDateTime(template?.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                      template?.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : template?.status === "draft"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                        : "bg-slate-50 text-slate-700 border border-slate-200/60"
                    }`}
                  >
                    {template?.status?.charAt(0).toUpperCase() +
                      template?.status?.slice(1) || "Active"}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No Active/Draft Templates</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Other Templates */}
      <motion.div
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Other Templates
          </h3>
          <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {otherTemplates?.length || 0}
          </span>
        </div>
        <div className="space-y-4">
          {otherTemplates?.length > 0 ? (
            otherTemplates?.map((template, index) => (
              <motion.div
                key={template?._id || index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <h4 className="text-xl font-medium text-gray-900 truncate">
                  {template?.title || "Untitled"}
                </h4>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No Other Templates</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default KanbanView;
