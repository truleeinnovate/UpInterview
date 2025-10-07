// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Fixed style issue

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function SubmitConfirmation({
  questions,
  answers,
  totalQuestions,
  answeredQuestions,
  handleStartReview,
  handleConfirmSubmit,
}) {
  return (
    // v1.0.0 <----------------------------------------------------------------------------
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
      <div className="max-w-[90rem] mx-auto py-12 sm:px-3 px-8">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl sm:p-4 p-12 border border-white/20">
          <div className="text-center mb-8">
            <div className="sm:w-16 sm:h-16 md:w-20 md:h-20 w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="sm:h-8 sm:w-8 md:h-10 md:w-10 h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 mb-4">
              Ready to Submit?
            </h2>
            {/* v1.0.1 <-------------------------------------------------------------------------- */}
            <p className="sm:text-sm md:text-md lg:text-md xl:text-md 2xl:text-md text-gray-600">
              {/* v1.0.1 --------------------------------------------------------------------------> */}
              You have answered {answeredQuestions} out of {totalQuestions}{" "}
              questions.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl sm:p-4 p-6 mb-8">
            <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900 mb-4">
              Assessment Summary
            </h3>
            <div className="space-y-4">
              {questions?.sections?.map((section, index) => {
                const sectionQuestions = section?.questions?.length || 0;
                const answeredInSection =
                  section?.questions?.filter((q) => answers[q._id])?.length ||
                  0;
                const percentage =
                  sectionQuestions > 0
                    ? Math.round((answeredInSection / sectionQuestions) * 100)
                    : 0;
                return (
                  <div
                    key={index}
                    className="flex sm:flex-col sm:items-start sm:justify-start items-center justify-between p-4 bg-white rounded-xl"
                  >
                    <div className="max-w-xs">
                      <h4 className="font-medium text-gray-900 break-words">
                        {section.sectionName}
                      </h4>
                      <p className="text-sm text-gray-500 break-words">
                        {answeredInSection} of {sectionQuestions} questions
                        answered
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:w-full">
                      <div className="sm:w-full w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-custom-blue rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* v1.0.1 <---------------------------------------------------------------------- */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStartReview}
              className="sm:px-3 px-4 sm:py-2 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue transition-all duration-200"
            >
              Review Answers
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="sm:px-3 px-4 sm:py-2 py-3 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              Submit Assessment
            </button>
          </div>
          {/* v1.0.1 ----------------------------------------------------------------------> */}
        </div>
      </div>
    </div>
    // v1.0.0 ---------------------------------------------------------------------------->
  );
}

export default SubmitConfirmation;
