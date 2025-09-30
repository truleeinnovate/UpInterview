import React, { useState } from 'react';

const TemplateModal = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{template.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
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

const TableView = ({ templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleRowClick = (template) => {
    setSelectedTemplate(template);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <>
      <div className="table-container">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            <table className="templates-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Description</th>
                  <th>Rounds</th>
                  <th>Best For</th>
                  <th>Format</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categoryTemplates.map((template) => (
                  <tr key={template.id} onClick={() => handleRowClick(template)}>
                    <td>
                      <div className="template-title-cell">
                        <div className="template-title">{template.title}</div>
                        <span className={`template-badge ${template.type === 'standard' ? 'badge-standard' : 'badge-custom'}`}>
                          {template.type}
                        </span>
                      </div>
                      <div className="template-description">{template.keyCharacteristic}</div>
                    </td>
                    <td>
                      <div className="template-description">{template.description}</div>
                    </td>
                    <td>
                      <div className="template-rounds">{template.rounds}</div>
                    </td>
                    <td>{template.bestFor}</td>
                    <td>{template.format}</td>
                    <td>
                      <span className={`status-badge ${template.status === 'active' ? 'status-active' : 'status-draft'}`}>
                        {template.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      
      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={closeModal} />
      )}
    </>
  );
};

export default TableView;