import React, { useState } from "react";
import TemplateModal from "./TemplateModal";

const TemplateCard = ({ template, onClick }) => {
  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  return (
    <div
      className="relative bg-white rounded-xl p-5 border border-slate-100 shadow transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-200"
      onClick={() => onClick(template)}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-800 to-teal-500"></div>

      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg leading-5 tracking-tight">
              {template.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                template.type === "standard"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {capitalizeFirstLetter(template.type)}
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-5 mb-4">
            {template.description}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            template.status === "active"
              ? "bg-green-100 text-green-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {capitalizeFirstLetter(template.status)}
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
            Best For
          </span>
          <span className="text-gray-800 font-medium text-right flex-1">
            {template.bestFor}
          </span>
        </div>
        <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
            Format
          </span>
          <span className="text-gray-800 font-medium text-right flex-1">
            {template.format}
          </span>
        </div>
        <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
            Key Characteristic
          </span>
          <span className="text-gray-800 font-medium text-right flex-1">
            {template.keyCharacteristic}
          </span>
        </div>
        <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
            Category
          </span>
          <span className="text-gray-800 font-medium text-right flex-1">
            {template.category}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-md text-sm text-slate-700 border border-slate-200 font-medium">
        <strong>Rounds:</strong> {template.rounds}
      </div>
    </div>
  );
};

const StandardTemplateKanbanView = ({ templatesData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Group templates by category
  const groupedTemplates = templatesData.reduce((acc, template) => {
    const category = template.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  const handleCardClick = (template) => {
    setSelectedTemplate(template);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
  };

  return (
    <>
      <div className="px-6 h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-6 items-start">
          {Object.entries(groupedTemplates).map(
            ([category, categoryTemplates]) => (
              <div
                key={category}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
                  <h2 className="text-xl font-bold text-teal-800 tracking-tight">
                    {category}
                  </h2>
                  <span className="bg-teal-800 text-white px-3 py-1 rounded-full text-xs font-bold text-center shadow-[0_2px_4px_rgba(33,121,137,0.3)]">
                    {categoryTemplates.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={closeModal} />
      )}
    </>
  );
};

export default StandardTemplateKanbanView;