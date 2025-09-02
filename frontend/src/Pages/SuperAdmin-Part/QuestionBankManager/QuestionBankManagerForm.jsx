import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";

const QuestionBankManagerForm = ({ isOpen, onClose, onSubmit }) => {
  useScrollLock(isOpen);

  const [csvFile, setCsvFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvFile) return;
    onSubmit(csvFile);
    onClose();
    setCsvFile(null);
  };

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

        <h2 className="text-xl font-semibold mb-6 text-custom-blue">
          Upload Questions
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CSV Upload */}
          <div>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-custom-blue rounded-xl cursor-pointer bg-custom-blue/5 hover:bg-custom-blue/10 transition p-6">
              <Upload size={30} className="text-custom-blue mb-2" />
              <span className="text-sm text-custom-blue font-medium">
                Click to upload CSV
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Only .csv files supported
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            {csvFile && (
              <p className="mt-2 text-xs font-medium text-green-600">
                {csvFile.name} selected
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!csvFile}
              className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 disabled:opacity-50"
            >
              <Upload size={16} /> Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionBankManagerForm;
