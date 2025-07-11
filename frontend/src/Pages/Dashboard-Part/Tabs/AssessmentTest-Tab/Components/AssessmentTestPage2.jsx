import React, { useEffect, useState } from 'react'
import {
    ClipboardDocumentListIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

const AssessmentTestPage2 = ({
    assessment,
    candidate,
    assessmentQuestions,
    setCurrentStep,
    isVerified
}) => {

    // Remove console logs to prevent loops
    // console.log('assessment', assessment);
    // console.log('candidate', candidate);
    // console.log('assessmentQuestions', assessmentQuestions);

    const [hasStartedTest, setHasStartedTest] = useState(false);

    const handleStartAssessment = () => {
        setHasStartedTest(true);
    };

    useEffect(() => {
        if (hasStartedTest) {
            setCurrentStep(3);
        }
    }, [hasStartedTest, setCurrentStep]);

    if (!assessmentQuestions) {
        return <div>Loading assessment questions...</div>;
    }

    return (
        <React.Fragment>
            <div className="max-w-[90rem] mx-auto py-8 px-8">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
                    <div className="bg-custom-blue p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMC0xMmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-10" />
                        <div className="relative">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <UserIcon className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-lg font-medium text-white">Candidate Profile</h2>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">
                                {assessment?.assessmentId?.AssessmentTitle}
                            </h2>
                            <p className="text-white text-lg mt-4 font-light">Complete your profile to begin the assessment</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                        <UserIcon className="h-6 w-6 text-custom-blue" />
                                    </div>
                                    <h3 className="ml-4 text-xl font-semibold text-gray-900">Candidate Profile</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {candidate?.FirstName} {candidate?.LastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {candidate?.Email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {candidate?.Phone}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Position</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {assessment?.assessmentId?.Position && (
                                            <>
                                                Position: {(assessment?.assessmentId?.Position?.title || 'Position Title Not Available')}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-custom-blue" />
                                </div>
                                <h3 className="ml-4 text-xl font-semibold text-gray-900">Assessment Sections</h3>
                            </div>
                            <div className="space-y-4">
                                {assessmentQuestions?.sections?.length > 0 ? (
                                    assessmentQuestions.sections.map((section, index) => (
                                        <div
                                            key={section._id || index}
                                            className="group bg-gray-50 p-6 rounded-xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-medium text-gray-900">
                                                    {section.sectionName || `Section ${index + 1}`}
                                                </h4>
                                                <span className="px-4 py-2 bg-blue-100 text-custom-blue rounded-xl text-sm font-medium group-hover:bg-custom-blue group-hover:text-white transition-colors">
                                                    {section.questions?.length || 0} Questions
                                                </span>
                                            </div>
                                            <p className="text-base text-gray-600 mt-2">
                                                Pass Score: {section.passScore || 0}
                                                {section.passScoreType === "Percentage" ? '%' : ''}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No sections found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-b from-transparent to-gray-50/50 border-t border-gray-100">
                        <div className="flex justify-between">

                            <div></div>
                            <button
                                onClick={handleStartAssessment}
                                // disabled={!isVerified}
                                className={`group inline-flex items-center px-6 py-2 rounded-xl text-lg font-medium transition-all duration-300 ${isVerified
                                    ? 'text-white bg-custom-blue hover:bg-custom-blue/80'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Start Assessment
                                <ChevronRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* <div className="max-w-[90rem] mx-auto py-8 px-8">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
                    <div className="p-8">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                                <ClipboardDocumentListIcon className="h-6 w-6 text-custom-blue" />
                            </div>
                            <h3 className="ml-4 text-xl font-semibold text-gray-900">Assessment Sections</h3>
                        </div>
                        <div className="space-y-4">
                            {assessmentQuestions?.sections?.length > 0 ? (
                                assessmentQuestions.sections.map((section, index) => (
                                    <div
                                        key={section._id || index}
                                        className="group bg-gray-50 p-6 rounded-xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {section.sectionName || `Section ${index + 1}`}
                                            </h4>
                                            <span className="px-4 py-2 bg-blue-100 text-custom-blue rounded-xl text-sm font-medium group-hover:bg-custom-blue group-hover:text-white transition-colors">
                                                {section.questions?.length || 0} Questions
                                            </span>
                                        </div>
                                        <p className="text-base text-gray-600 mt-2">
                                            Pass Score: {section.passScore || 0}
                                            {section.passScoreType === "Percentage" ? '%' : ''}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No sections found</p>
                            )}
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-gradient-to-b from-transparent to-gray-50/50 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back
                            </button>
                            <button
                                onClick={handleStartAssessment}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-blue-700"
                            >
                                Start Assessment
                                <ChevronRightIcon className="h-4 w-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}
        </React.Fragment>
    )
}

export default AssessmentTestPage2