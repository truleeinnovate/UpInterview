import { ClockIcon } from '@heroicons/react/24/outline';

function AssessmentSidebar({ questions, currentSection, setCurrentSection, setCurrentQuestionIndex, answers, timeLeft, formatTime, totalQuestions, answeredQuestions }) {
    return (
        <div className="w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 sticky top-24">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
                </div>
                <nav className="p-4">
                    {questions?.sections?.map((section, index) => {
                        const questionCount = section?.questions?.length || 0;
                        const answeredCount = section?.questions?.filter(q => answers[q._id])?.length || 0;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentSection(index);
                                    setCurrentQuestionIndex(0);
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 ${currentSection === index
                                    ? 'bg-blue-50 text-custom-blue'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium">{section.sectionName}</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${answeredCount === questionCount
                                    ? 'bg-custom-blue text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {answeredCount}/{questionCount}
                                </span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-6 border-t border-gray-100">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Questions Answered</span>
                            <span className="font-medium text-gray-900">
                                {answeredQuestions} / {totalQuestions}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssessmentSidebar;