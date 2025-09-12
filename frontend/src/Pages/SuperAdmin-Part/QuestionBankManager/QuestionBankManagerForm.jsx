// v1.0.0 - Ashok - Added dropdown for adding questions

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, ChevronDown, CheckCircle } from "lucide-react";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";

// v1.0.0 <-----------------------------------------------------------------------
const QuestionTypeDropdown = ({ questionType, setQuestionType }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Question Type
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm hover:border-custom-blue focus:ring-2 focus:ring-custom-blue focus:outline-none"
        >
          <span className="text-gray-700 font-medium capitalize">
            {questionType === "interview"
              ? "Interview Questions"
              : "Assignment Questions"}
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown Options */}
        {dropdownOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in">
            <ul className="divide-y divide-gray-100">
              {[
                { value: "interview", label: "Interview Questions" },
                { value: "assessment", label: "Assignment Questions" },
              ].map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    setQuestionType(option.value);
                    setDropdownOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-custom-blue/10 ${
                    questionType === option.value ? "bg-custom-blue/5" : ""
                  }`}
                >
                  <span className="text-gray-700">{option.label}</span>
                  {questionType === option.value && (
                    <CheckCircle size={16} className="text-custom-blue" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const CsvUploader = ({ setCsvFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null); // reference to hidden input

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setCsvFile(file);
      } else {
        alert("Only CSV files are supported");
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition p-6
        ${
          dragActive
            ? "border-green-500 bg-green-50"
            : "border-custom-blue bg-custom-blue/5 hover:bg-custom-blue/10"
        }`}
    >
      <Upload size={30} className="text-custom-blue mb-2" />
      <span className="text-sm text-custom-blue font-medium">
        Drag & Drop your CSV here, or Click to upload
      </span>
      <span className="text-xs text-gray-500 mt-1">
        Only .csv files supported
      </span>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

// v1.0.0 ----------------------------------------------------------------------->

const QuestionBankManagerForm = ({ isOpen, onClose, onSubmit }) => {
  useScrollLock(isOpen);

  const [csvFile, setCsvFile] = useState(null);
  // v1.0.0 <--------------------------------------------------------
  const [questionType, setQuestionType] = useState("interview");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // v1.0.0 -------------------------------------------------------->

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvFile) return;
    // v1.0.0 <-------------------------------
    onSubmit(csvFile, questionType);
    // v1.0.0 ------------------------------->
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
          {/* v1.0.0 <------------------------------------------------------------------- */}
          {/* Custom Dropdown */}
          <div>
            <QuestionTypeDropdown
              questionType={questionType}
              setQuestionType={setQuestionType}
            />
          </div>
          {/* CSV Upload */}
          {/* <div>
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
          </div> */}
          <div>
            <CsvUploader setCsvFile={setCsvFile} />

            {csvFile && (
              <p className="mt-2 text-xs font-medium text-green-600">
                {csvFile.name} selected
              </p>
            )}
          </div>
          {/* v1.0.0 -------------------------------------------------------------------> */}

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
