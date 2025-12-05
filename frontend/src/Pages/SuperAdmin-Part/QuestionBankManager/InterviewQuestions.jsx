// v1.0.0 - Ashok - Fixed issues
// v1.0.1 - Ashok - Added Edit functionality

import React from "react";
import { Eye, Pencil } from "lucide-react";

// v1.0.0 <-------------------------------------------------------------------------
const InterviewQuestions = ({
  questions = [],
  onView,
  onEdit,
  showCheckboxes,
  selectedQuestions = [],
  onToggleSelection,
}) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        No Interview Questions found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {questions?.map((q) => (
        <div
          key={q?._id}
          className="relative flex justify-center items-center"
        >
          {/* Checkbox for selection by Ranjith */}

          {showCheckboxes && (
            <div className="left-3 top-3 mr-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestions?.includes(q?._id)}
                  onChange={() => onToggleSelection(q?._id)}
                  className="sr-only" // Hide the default checkbox
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedQuestions?.includes(q?._id)
                      ? "bg-custom-blue border-custom-blue"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {selectedQuestions?.includes(q?._id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </label>
            </div>
          )}

          <div className=" w-full bg-white rounded-2xl shadow-md p-5 border border-gray-200 group">
            {/* Eye and Pencil icons - hidden by default, shows on hover */}
            <div className="flex items-center gap-2 absolute top-3 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(q)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Edit Question"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onView?.(q)}
                type="button"
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="View Question"
              >
                <Eye className="w-5 h-5 text-custom-blue" />
              </button>
            </div>

            {/* Difficulty + Category */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                <strong>Difficulty:</strong> {q?.difficultyLevel}
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                <strong>Category:</strong> {q?.category}
              </span>
              {q?.area && (
                <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                  <strong>Area:</strong> {q?.area}
                </span>
              )}
            </div>

            {/* Question */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {q?.questionOrderId}. {q?.questionText}
            </h3>


            {/* Answer / Explanation */}
            <p className="text-gray-700 text-sm mb-3">
              <span className="font-semibold">Answer: </span>
              {q?.explanation}
            </p>

            {/* Tags */}
            {q?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {q?.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Technologies */}
            {q?.technology?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500">Technology: </span>
                <span className="text-sm font-medium text-gray-800">
                  {q?.technology?.join(", ")}
                </span>
              </div>
            )}

            {/* Related Questions */}
            {q?.relatedQuestions?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500">Related: </span>
                <span className="text-sm text-gray-700">
                  {q?.relatedQuestions?.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
// v1.0.0 ------------------------------------------------------------------------->

export default InterviewQuestions;
