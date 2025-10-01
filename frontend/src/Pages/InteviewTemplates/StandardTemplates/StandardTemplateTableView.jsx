import React, { useState } from "react";

const TemplateModal = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{template.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-section">
          <h3>Description</h3>
          <p>{template.description}</p>
        </div>

        <div className="modal-section">
          <h3>Interview Rounds</h3>
          <p>{template.rounds}</p>
        </div>

        <div className="modal-section">
          <h3>Best For</h3>
          <p>{template.bestFor}</p>
        </div>

        <div className="modal-section">
          <h3>Format</h3>
          <p>{template.format}</p>
        </div>

        <div className="modal-section">
          <h3>Key Characteristic</h3>
          <p>{template.keyCharacteristic}</p>
        </div>

        <div className="modal-section">
          <h3>Category</h3>
          <p>{template.category}</p>
        </div>
      </div>
    </div>
  );
};

const StandardTemplateTableView = ({ standardTemplates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleRowClick = (template) => {
    setSelectedTemplate(template);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // Group templates by category
  const groupedTemplates = standardTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});
  return (
    <>
      <div className="w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="h-[calc(100vh-12rem)] overflow-y-auto pb-6 scrollbar-thin">
            {Object.entries(groupedTemplates).map(
              ([category, categoryTemplates]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3 px-6">
                    {category}
                  </h2>
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-100 border-b sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                          Template
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[25%]">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">
                          Rounds
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                          Best For
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                          Format
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categoryTemplates.map((template) => (
                        <tr
                          key={template.id}
                          onClick={() => handleRowClick(template)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-3 py-2 text-sm text-gray-700">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">
                                  {template.title}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    template.type === "standard"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {template.type}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {template.keyCharacteristic}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {template.description}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {template.rounds}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {template.bestFor}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {template.format}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                template.status === "active"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {capitalizeFirstLetter(template.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={closeModal} />
      )}
    </>
  );
};

export default StandardTemplateTableView;
