import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function SubmitConfirmation({ questions, answers, totalQuestions, answeredQuestions, handleStartReview, handleConfirmSubmit }) {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
            <div className="max-w-[90rem] mx-auto py-12 px-8">
                <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Submit?</h2>
                        <p className="text-xl text-gray-600">
                            You have answered {answeredQuestions} out of {totalQuestions} questions.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Summary</h3>
                        <div className="space-y-4">
                            {questions?.sections?.map((section, index) => {
                                const sectionQuestions = section?.questions?.length || 0;
                                const answeredInSection = section?.questions?.filter(q => answers[q._id])?.length || 0;
                                const percentage = sectionQuestions > 0 ? Math.round((answeredInSection / sectionQuestions) * 100) : 0;
                                return (
                                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{section.sectionName}</h4>
                                            <p className="text-sm text-gray-500">
                                                {answeredInSection} of {sectionQuestions} questions answered
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
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
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleStartReview}
                            className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            Review Answers
                        </button>
                        <button
                            onClick={handleConfirmSubmit}
                            className="px-6 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        >
                            Submit Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmitConfirmation;