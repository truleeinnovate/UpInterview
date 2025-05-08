import React from 'react';
import { FaEye, FaPencilAlt, FaShareAlt } from 'react-icons/fa';

const AssessmentList = ({ assessments, onView, onEdit, onShare }) => (
    <div className="w-full bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">All Assessments</h3>
            <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
                {assessments.length} {assessments.length === 1 ? 'Assessment' : 'Assessments'}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
            {assessments.map((assessment) => (
                <div
                    key={assessment._id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h4
                            className="text-lg font-medium text-blue-600 cursor-pointer hover:underline truncate max-w-[70%]"
                            onClick={() => onView(assessment)}
                            title={assessment.AssessmentTitle}
                        >
                            {assessment.AssessmentTitle}
                        </h4>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => onShare(assessment)} 
                                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" 
                                title="Share"
                            >
                                <FaShareAlt className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onView(assessment)} 
                                className="text-green-500 hover:bg-green-50 p-2 rounded-lg transition-colors" 
                                title="View"
                            >
                                <FaEye className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onEdit(assessment)} 
                                className="text-purple-500 hover:bg-purple-50 p-2 rounded-lg transition-colors" 
                                title="Edit"
                            >
                                <FaPencilAlt className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center text-sm text-gray-600">
                        <span className="flex items-center">
                            <span className="text-gray-400 mr-1">Exp. Date:</span>
                            <span className="font-medium">
                                {new Date(assessment.ExpiryDate).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                }).replace(/(\w{3}) (\d{4})/, '$1, $2')}
                            </span>
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="flex items-center">
                            <span className="text-gray-400 mr-1">Duration:</span>
                            <span className="font-medium">{assessment.Duration}</span>
                        </span>
                    </div>

                    <div className="text-gray-700 space-y-2 mt-auto">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium text-right">
                                {Array.isArray(assessment.AssessmentType) ? 
                                    assessment.AssessmentType.join(', ') : 
                                    assessment.AssessmentType}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Questions:</span>
                            <span className="font-medium">{assessment.NumberOfQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Difficulty:</span>
                            <span className="font-medium capitalize">{assessment.DifficultyLevel?.toLowerCase()}</span>
                        </div>
                        {assessment.totalScore && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Score:</span>
                                <span className="font-medium">{assessment.totalScore}</span>
                            </div>
                        )}
                        {(assessment.passScore !== null && assessment.passScore !== undefined && assessment.passScore > 0) && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pass Score:</span>
                                <span className="font-medium">{assessment.passScore}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default AssessmentList;