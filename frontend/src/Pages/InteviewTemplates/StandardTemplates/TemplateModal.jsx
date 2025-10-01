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

export default TemplateModal;
