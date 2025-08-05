import React from 'react';
import { Video, LogOut, MessageSquare } from 'lucide-react';
import { mockData } from '../mockData';

const CandidateView = ({ onBack }) => {
  const candidate = mockData.candidates[0];
  const interview = mockData.interviews[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#217989] to-[#1a616e] p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Back to Role Selection</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {candidate.name}!</h1>
                <p className="text-gray-600 text-base">Ready to join your interview?</p>
              </div>

              {/* Interview Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Interview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Position</p>
                      <p className="text-base font-semibold text-gray-900">{interview.position}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</p>
                      <p className="text-base font-semibold text-gray-900">{interview.company}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</p>
                      <p className="text-base font-semibold text-gray-900">{interview.scheduledTime}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                      <p className="text-base font-semibold text-gray-900">{interview.duration}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Meeting Button */}
              <button
                onClick={() => window.open(interview.meetingUrl, '_blank')}
                className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg mb-4"
              >
                <Video className="w-6 h-6" />
                Join Meeting
              </button>

              <p className="text-sm text-gray-500">
                Make sure your camera and microphone are working properly
              </p>
            </div>

            {/* Pre-Interview Checklist */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Pre-Interview Checklist</h2>
                <p className="text-sm text-gray-600">Complete these steps before joining your interview</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Test Your Equipment</h4>
                    <p className="text-sm text-gray-600">Ensure your camera and microphone are working properly. Test your audio and video quality.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Prepare Your Environment</h4>
                    <p className="text-sm text-gray-600">Find a quiet, well-lit space with a professional background. Minimize distractions.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Gather Your Materials</h4>
                    <p className="text-sm text-gray-600">Have your resume, portfolio, and any relevant documents ready to discuss or share.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Join Early</h4>
                    <p className="text-sm text-gray-600">Join the meeting 5 minutes before the scheduled time to resolve any technical issues.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">5</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Screen Sharing Ready</h4>
                    <p className="text-sm text-gray-600">Be prepared to share your screen if needed. Close unnecessary applications beforehand.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Technical Requirements */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Technical Requirements</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Stable internet connection (minimum 5 Mbps)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Chrome, Firefox, or Safari browser (latest version)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Enable camera and microphone permissions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Close unnecessary applications to free up bandwidth</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Have a backup device ready (phone/tablet)</p>
                </div>
              </div>
            </div>

            {/* Interview Etiquette */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Interview Etiquette</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Maintain professional appearance and posture</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Speak clearly and at a moderate pace</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Make eye contact by looking at the camera</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Ask questions if something is unclear</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Be respectful and courteous throughout</p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Quick Tips</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Have a glass of water nearby</p>
                <p>• Keep your phone on silent</p>
                <p>• Prepare questions about the role</p>
                <p>• Practice your elevator pitch</p>
                <p>• Research the company beforehand</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-2xl shadow-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-4">🆘 Need Help?</h3>
              <div className="space-y-2 text-sm text-red-700">
                <p>Technical issues during the interview?</p>
                <p className="font-semibold">Call: +1 (555) 123-HELP</p>
                <p className="font-semibold">Email: support@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateView;