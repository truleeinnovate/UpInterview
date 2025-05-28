import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  ChevronRightIcon,
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { config } from '../../../../../config';

const AssessmentTestPage1 = ({
  scheduledAssessmentId,
  setCurrentStep,
  candidate,
  candidateId,
  setIsVerified,
  assessment,
  isVerified,
  calculatedScores,
  candidateAssessmentId,
}) => {
  console.log('candidateAssessmentId', candidateAssessmentId);

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [timer, setTimer] = useState(30);

  const handleProceed = () => {
    if (isVerified && isAgreed) {
      setCurrentStep(2);
    } else {
      toast.error('Please verify your email and agree to the terms.');
    }
  };

  useEffect(() => {
    const countdown = timer > 0 && setInterval(() => setTimer(timer - 1), 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const verifyOtp = async (candidateAssessmentId, otp) => {
    const url = `${config.REACT_APP_API_URL}/candidate-assessment/verify-otp`;
    try {
      const response = await axios.post(url, { candidateAssessmentId, otp });
      return response.data.isValid;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP.');
      return false;
    }
  };

  const handleChange = async (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (element.value && index < 4) {
      const nextInput = element.parentElement.nextSibling.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Submit if all fields are filled
    if (newOtp.every((digit) => digit !== '')) {
      const isValid = await verifyOtp(candidateAssessmentId, newOtp.join(''));
      if (isValid) {
        setIsVerified(true);
        setShowOtpInput(false);
        toast.success('OTP verified successfully');
      } else {
        toast.error('Invalid OTP');
        setOtp(['', '', '', '', '']);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.target.parentElement.previousSibling.querySelector('input');
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setOtp(['', '', '', '', '']); // Clear existing OTP inputs
    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/send-otp/${scheduledAssessmentId}/${candidateId}/${candidateAssessmentId}`
      );
      if (response.data.success) {
        setTimer(30);
        toast.success('OTP resent successfully!');
      } else {
        toast.error('Failed to resend OTP.');
      }
    } catch (error) {
      toast.error('Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/send-otp/${scheduledAssessmentId}/${candidateId}/${candidateAssessmentId}`
      );
      if (response.data.success) {
        setShowOtpInput(true);
        setTimer(30);
        toast.success('OTP sent successfully!');
      } else {
        toast.error('Failed to send OTP.');
      }
    } catch (error) {
      toast.error('Failed to send OTP.');
    }
  };

  return (
    <React.Fragment>
      <div className="max-w-[90rem] mx-auto py-8 px-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="bg-custom-blue p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMC0xMmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA6IDYgNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-10" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <LightBulbIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-sm font-medium text-blue-100">
                    {assessment?.assessmentId?.AssessmentType?.join(', ')}
                  </h2>
                </div>
                <div className="flex items-center space-x-8">
                  {[
                    { icon: ClockIcon, value: assessment?.assessmentId?.Duration },
                    { icon: DocumentTextIcon, value: `${assessment?.assessmentId?.NumberOfQuestions} Questions` },
                    {
                      icon: AcademicCapIcon,
                      value: calculatedScores
                        ? `${calculatedScores.passScore}${calculatedScores.showPercentage ? '%' : ''} Pass Score`
                        : 'Loading...',
                    },
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <stat.icon className="h-4 w-4 text-blue-200" />
                      <span className="text-sm font-medium text-blue-100">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                  {assessment?.assessmentId?.AssessmentTitle}
                </h1>
                {assessment?.assessmentId?.Position && (
                  <p className="text-blue-100 text-lg font-light">
                    Position: <span className="font-medium text-white">{assessment?.assessmentId?.Position}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Instructions and Notes */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Instructions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <BookOpenIcon className="h-5 w-5 text-custom-blue" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Instructions</h2>
                </div>
                <div className="prose prose-blue max-w-none">
                  {assessment?.assessmentId?.Instructions?.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-600 text-base leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>

              {!showOtpInput && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <ShieldCheckIcon className="h-6 w-6 text-custom-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Verify Your Email</h3>
                      <p className="text-gray-500 mt-1">Enter the code sent to {candidate?.Email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    className="text-custom-blue font-medium flex items-center"
                  >
                    Send Code
                  </button>
                </div>
              )}

              {showOtpInput && !isVerified && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <ShieldCheckIcon className="h-6 w-6 text-custom-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Verify Your Email</h3>
                      <p className="text-gray-500 mt-1">Enter the code sent to {candidate?.Email}</p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 mb-8">
                    {otp?.map((digit, index) => (
                      <div key={index} className="w-12">
                        <input
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-full h-14 text-center text-2xl font-semibold border-2 rounded-xl focus:border-custom-blue focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    {timer > 0 ? (
                      <p className="text-gray-500">Resend code in {timer}s</p>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-custom-blue font-medium flex items-center"
                      >
                        {isResending ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            Resending...
                          </>
                        ) : (
                          'Resend Code'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Email Verified</h3>
                      <p className="text-gray-500 mt-1">Your email has been successfully verified.</p>
                    </div>
                  </div>
                </div>
              )}

              {assessment?.assessmentId?.AdditionalNotes && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-custom-blue" />
                    </div>
                    <h2 className="ml-3 text-lg font-semibold text-gray-900">Additional Notes</h2>
                  </div>
                  <div className="prose prose-indigo max-w-none">
                    {assessment?.assessmentId?.AdditionalNotes?.split('\n').map((line, index) => (
                      <p key={index} className="text-gray-600 text-base leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <ShieldCheckIcon className="h-5 w-5 text-custom-blue" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Terms and Conditions</h2>
                </div>
                <div className="mb-4">
                  <label className="flex items-start space-x-4">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="h-5 w-5 text-custom-blue focus:ring-custom-blue border-gray-300 rounded-lg transition-colors"
                        />
                      </div>
                    </div>
                    <span className="text-gray-700 text-base">
                      I understand and agree to the following terms:
                      <ul className="list-none mt-3 space-y-2">
                        {[
                          'I will complete the assessment honestly and independently',
                          'I will not use any external resources unless explicitly permitted',
                          'I will not share or distribute any assessment content',
                          'I understand that my responses will be monitored and recorded',
                          'I agree to the time limit and submission requirements',
                        ].map((term, index) => (
                          <li key={index} className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {term}
                          </li>
                        ))}
                      </ul>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-b from-transparent to-gray-50/50 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                onClick={handleProceed}
                disabled={!isVerified || !isAgreed}
                className={`
                  group inline-flex items-center px-6 py-3 rounded-xl text-base font-medium
                  transition-all duration-300 transform
                  ${
                    isVerified && isAgreed
                      ? 'text-white bg-custom-blue hover:bg-custom-blue/90'
                      : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                Continue to Profile
                <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AssessmentTestPage1;