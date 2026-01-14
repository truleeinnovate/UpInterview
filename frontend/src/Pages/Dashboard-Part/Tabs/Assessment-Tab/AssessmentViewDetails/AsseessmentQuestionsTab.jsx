// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Changed question card UI

import { ChevronDown, ChevronUp } from "lucide-react";
import QuestionCard from "./QuestionCard/QuestionCard";

function QuestionsTab({ sections, toggleStates, toggleArrow1 }) {
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-88px)] p-4 pb-18">
      <div className="space-y-5">
        {sections?.length > 0 ? (
          sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium shadow-xs">
                      {section.questions?.length || 0}{" "}
                      {section.questions?.length <= 1
                        ? "Question"
                        : "Questions"}
                    </span>
                    <h3 className="font-semibold text-gray-800">
                      {section.sectionName.charAt(0).toUpperCase() +
                        section.sectionName.slice(1)}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                    onClick={() => toggleArrow1(index)}
                  >
                    {toggleStates[index] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {toggleStates[index] && (
                <div className="divide-y divide-gray-200">
                  {section.questions?.length > 0 ? (
                    section.questions.map((question) => (
                      <div
                        key={question._id}
                        className="p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <QuestionCard question={question} />
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-500 text-sm">
                      No Questions added
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-500 text-base">
            No Sections added
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsTab;
