import { CheckCircleIcon } from '@heroicons/react/24/outline';

function CompletionScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50">
            <div className="max-w-[90rem] mx-auto py-12 px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-12 text-center transform transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative w-32 h-32 mx-auto mb-12">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="relative w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-20 w-20 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Well Done!</h2>
                    <div className="space-y-6">
                        <p className="text-xl text-gray-600">
                            Thank you for completing the assessment.
                        </p>
                        <p className="text-xl text-gray-600">
                            Your responses have been successfully submitted. We appreciate the time and effort you took to participate.
                        </p>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                            <h3 className="text-lg font-semibold text-custom-blue mb-3">Contact Us</h3>
                            <p className="text-gray-600 text-sm">
                                Need help or have questions? Reach out to us at{' '}
                                <a href="mailto:Upinterview@gmail.com" className="font-medium text-custom-blue hover:text-custom-blue/80 transition-colors">
                                    Upinterview@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.open("", "_self").close()}
                        className="mt-8 inline-flex items-center px-6 py-2 bg-gradient-to-r from-custom-blue to-custom-blue/80 text-white rounded-xl text-base font-medium hover:from-custom-blue/80 hover:to-custom-blue/80 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2"
                    >
                        <span>Close Assessment</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CompletionScreen;