import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';

function QuestionsTab({ sections, toggleStates, toggleArrow1 }) {
  const getDifficultyColorClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

return (
  <div className="">
    <div className="space-y-5">
      {sections?.length > 0 ? (
        sections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium shadow-xs">
                    {section.questions?.length || 0} {section.questions?.length <= 1 ? 'Question' : 'Questions'}
                  </span>
                  <h3 className="font-semibold text-gray-800">{section.sectionName.charAt(0).toUpperCase() + section.sectionName.slice(1)}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  onClick={() => toggleArrow1(index)}
                >
                  {toggleStates[index] ? (
                    <MdOutlineKeyboardArrowUp className="text-xl" />
                  ) : (
                    <MdOutlineKeyboardArrowDown className="text-xl" />
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
                      <div className="flex gap-4">
                        <div className="relative flex flex-col items-center pt-0.5">
                          <div
                            className={`w-2.5 h-10 rounded-full ${getDifficultyColorClass(
                              question.snapshot?.difficultyLevel
                            )}`}
                            title={question.snapshot?.difficultyLevel}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="text-gray-500 text-sm font-medium">
                                  {question.order}.
                                </span>
                                <p className="text-gray-800 font-medium truncate">
                                  {question.snapshot?.questionText}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.snapshot?.questionType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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