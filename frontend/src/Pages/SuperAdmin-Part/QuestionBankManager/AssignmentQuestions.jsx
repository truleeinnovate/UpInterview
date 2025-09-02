import React from "react";
import { Eye } from "lucide-react";

const AssignmentQuestions = ({ questions, onView }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        No Assignment Questions found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {questions.map((q) => (
        <div
          key={q._id}
          className="relative bg-white rounded-2xl shadow-md p-5 border border-gray-200 group"
        >
          {/* Eye icon - hidden by default, shows on hover */}
          <button
            type="button"
            onClick={() => onView?.(q)}
            className="absolute top-3 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-6 h-6 text-custom-blue" />
          </button>

          {/* Question */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {q.questionOrderId}. {q.questionText}
          </h3>

          {/* Difficulty + Category */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
              <strong>Difficulty:</strong> {q.difficultyLevel}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
              <strong>Category:</strong> {q.category}
            </span>
            {q.area && (
              <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                <strong>Area:</strong> {q.area}
              </span>
            )}
          </div>

          {/* Answer / Explanation */}
          <p className="text-gray-700 text-sm mb-3">
            <span className="font-semibold">Answer: </span>
            {q.explanation}
          </p>

          {/* Tags */}
          {q.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {q.tags.map((tag, i) => (
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
          {q.technology?.length > 0 && (
            <div className="mt-3">
              <span className="text-xs text-gray-500">Technology: </span>
              <span className="text-sm font-medium text-gray-800">
                {q.technology.join(", ")}
              </span>
            </div>
          )}

          {/* Related Questions */}
          {q.relatedQuestions?.length > 0 && (
            <div className="mt-3">
              <span className="text-xs text-gray-500">Related: </span>
              <span className="text-sm text-gray-700">
                {q.relatedQuestions.join(", ")}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssignmentQuestions;
