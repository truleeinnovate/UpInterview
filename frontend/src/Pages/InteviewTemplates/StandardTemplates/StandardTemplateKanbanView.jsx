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

const TemplateCard = ({ template, onClick }) => {
  return (
    <div className="template-card" onClick={() => onClick(template)}>
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{template.title}</h3>
          <span
            className={`template-badge ${
              template.type === "standard" ? "badge-standard" : "badge-custom"
            }`}
          >
            {template.type}
          </span>
        </div>
        <span
          className={`status-badge ${
            template.status === "active" ? "status-active" : "status-draft"
          }`}
        >
          {template.status}
        </span>
      </div>

      <p className="card-description">{template.description}</p>

      <div className="card-details">
        <div className="card-detail">
          <span className="detail-label">Best For:</span>
          <span className="detail-value">{template.bestFor}</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">Format:</span>
          <span className="detail-value">{template.format}</span>
        </div>
      </div>

      <div className="card-rounds">
        <strong>Rounds:</strong> {template.rounds}
      </div>
    </div>
  );
};

const StandardTemplateKanbanView = ({ standardTemplates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Group templates by category
  const groupedTemplates = standardTemplates.reduce((acc, template) => {
    const category = template.category;
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
                    <div
                      key={template.id}
                      className="relative bg-white rounded-xl p-5 border border-slate-100 shadow transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-200"
                      onClick={() => handleCardClick(template)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-800 to-teal-500"></div>

                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="flex flex-col gap-2 flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-5 tracking-tight">
                            {template.title}
                          </h3>
                          <p className="text-gray-500 text-sm leading-5 mb-4">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-4">
                        {/* Example detail */}
                        <div className="flex justify-between items-start text-sm gap-3">
                          <span className="text-gray-400 font-semibold min-w-[70px] flex-shrink-0">
                            Label
                          </span>
                          <span className="text-gray-800 font-medium text-right flex-1">
                            Value
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-md text-sm text-slate-700 border border-slate-200 font-medium">
                        {/* Example rounds info */}
                        Rounds info here
                      </div>
                    </div>
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
