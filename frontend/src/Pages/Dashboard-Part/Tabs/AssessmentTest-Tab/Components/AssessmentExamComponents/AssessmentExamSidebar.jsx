// v1.0.0 - Ashok - Improved responsiveness and fixed minor UI issues

import { ClockIcon } from "@heroicons/react/24/outline";

function AssessmentSidebar({
  questions,
  currentSection,
  setCurrentSection,
  setCurrentQuestionIndex,
  answers,
  timeLeft,
  formatTime,
  totalQuestions,
  answeredQuestions,
}) {
  return (
    // v1.0.0 <-------------------------------------------------
    <div className="sm:w-full md:w-full w-80 flex-shrink-0">
      {/* v1.0.0 -------------------------------------------------> */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 sticky top-24">
        <div className="p-6 border-b border-gray-100">
          {/* v1.0.0 <--------------------------------------------------------------- */}
          <h2 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-900">
            Sections
          </h2>
          {/* v1.0.0 ---------------------------------------------------------------> */}
        </div>
        <nav className="p-4">
          {questions?.sections?.map((section, index) => {
            const questionCount = section?.questions?.length || 0;
            const answeredCount =
              section?.questions?.filter((q) => answers[q._id])?.length || 0;
            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentSection(index);
                  setCurrentQuestionIndex(0);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 ${
                  currentSection === index
                    ? "bg-blue-50 text-custom-blue"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {/* v1.0.0 <----------------------------------------------------------- */}
                <span className="sm:text-sm md:text-sm lg:text-md xl:text-md 2xl:text-md font-medium">
                  {section.sectionName}
                </span>
                {/* v1.0.0 -----------------------------------------------------------> */}
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    answeredCount === questionCount
                      ? "bg-custom-blue text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {answeredCount}/{questionCount}
                </span>
              </button>
            );
          })}
        </nav>
        {/* v1.0.0 <--------------------------------------------- */}
        <div className="p-6 border-t border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="sm:text-sm md:text-sm lg:text-md xl:text-md 2xl:text-md text-gray-600 ">
                Questions Answered
              </span>
              <span className="font-medium text-sm text-gray-900">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
          </div>
        </div>
        {/* v1.0.0 ---------------------------------------------> */}
      </div>
    </div>
  );
}

export default AssessmentSidebar;
