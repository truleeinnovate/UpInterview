// v1.0.0 - Ashok - Improved responsiveness

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function QuestionNavigation({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  currentSection,
  setCurrentSection,
  questions,
}) {
  const currentSectionData = questions?.sections?.[currentSection];
  // v1.0.0 <-----------------------------------------------------------------------------
  return (
    <div className="px-8 py-6 bg-gray-50/50 rounded-b-2xl flex justify-between items-center">
      <button
        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
        disabled={currentQuestionIndex === 0}
        className={`inline-flex items-center sm:px-3 px-6 py-2 rounded-xl sm:text-sm md:text-sm lg:text-lg xl:text-lg 2xl:text-lg text-lg font-medium transition-all duration-300 ${
          currentQuestionIndex === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
        }`}
      >
        <ChevronLeftIcon className="sm:h-4 sm:w-4 h-5 w-5 mr-2" />
        Previous
      </button>
      <button
        onClick={() => {
          if (
            currentQuestionIndex ===
            currentSectionData?.questions?.length - 1
          ) {
            if (currentSection < questions?.sections?.length - 1) {
              setCurrentSection((prev) => prev + 1);
              setCurrentQuestionIndex(0);
            }
          } else {
            setCurrentQuestionIndex((prev) => prev + 1);
          }
        }}
        disabled={
          currentQuestionIndex === currentSectionData?.questions?.length - 1 &&
          currentSection === questions?.sections?.length - 1
        }
        title={
          currentQuestionIndex === currentSectionData?.questions?.length - 1 &&
          currentSection === questions?.sections?.length - 1
            ? "You're in the last question. Click 'Review & Submit' to review your answers."
            : undefined
        }
        className={`inline-flex items-center px-6 py-2 rounded-xl sm:text-sm md:text-sm lg:text-lg xl:text-lg 2xl:text-lg text-lg font-medium transition-all duration-300 ${
          currentQuestionIndex === currentSectionData?.questions?.length - 1 &&
          currentSection === questions?.sections?.length - 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
        }`}
      >
        Next
        <ChevronRightIcon className="sm:h-4 sm:w-4 h-5 w-5 ml-2" />
      </button>
    </div>
  );
  // v1.0.0 ----------------------------------------------------------------------------->
}

export default QuestionNavigation;
