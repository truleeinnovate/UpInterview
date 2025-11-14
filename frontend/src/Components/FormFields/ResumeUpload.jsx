// v1.0.0 - Ashok - Fixed style issues

import React from "react";
import { Trash, Eye } from "lucide-react";

const ResumeUpload = ({
  resumeInputRef,
  selectedResume,
  resumeError,
  onResumeChange,
  onRemoveResume,
  label = "Resume",
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => resumeInputRef.current?.click()}
        className="relative group cursor-pointer w-full max-w-sm"
      >
        <div className="h-32 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-custom-blue/30 flex flex-col items-center justify-center transition-all duration-200 hover:border-custom-blue/60 hover:shadow-lg px-4 text-center">
          {selectedResume ? (
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium truncate max-w-[180px]">
                {selectedResume.name}
              </p>
              <p className="text-xs text-gray-500">
                {selectedResume?.fileSize || selectedResume?.size
                  ? `${(
                      (selectedResume.size || selectedResume.fileSize) /
                      1024 /
                      1024
                    ).toFixed(2)} MB`
                  : ""}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400">Upload Resume</p>
              <p className="text-xs text-gray-400">PDF or Word document</p>
            </>
          )}
        </div>

        {(selectedResume?.path || selectedResume?.url) && (
          <button
            type="button"
            title="Preview Resume"
            onClick={(e) => {
              e.stopPropagation();
              window.open(selectedResume.path || selectedResume.url, "_blank");
            }}
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-70 transition"
          >
            <Eye className="w-3 h-3" />
          </button>
        )}

        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={onResumeChange}
        />

        {selectedResume && (
          <button
            title="Remove Resume"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveResume();
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700 text-center">
        {label}
      </p>
      <p className="text-xs text-gray-500 text-center">
        Maximum file size: 4MB
      </p>
      <p className="text-xs text-red-500 font-medium text-center">
        {resumeError}
      </p>
    </div>
  );
};

export default ResumeUpload;
