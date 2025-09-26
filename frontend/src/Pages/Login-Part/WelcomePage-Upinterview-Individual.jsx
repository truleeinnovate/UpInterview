// v1.0.0  -  Mansoor  -  replaces the old ui with new ui
// v1.0.1  -  Ashok    -  changed logo url from local to cloud storage url
import React, { useState } from "react";
import Slideshow from "./Slideshow";
import { config } from "../../config";
import { Link } from "react-router-dom";
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
// import Layout from './Layout';

const WelcomePageUpinterviewIndividual = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInLogin = () => {
    setIsLoading(true);
    console.log("1. Starting LinkedIn login flow...");

    try {
      // Capture returnUrl from current query if present (set by SessionExpiration)
      const params = new URLSearchParams(window.location.search);
      const existingReturnUrl = params.get('returnUrl');

      // Build OAuth state payload to carry returnUrl through the LinkedIn flow
      const csrfToken = Math.random().toString(36).substring(7);
      const statePayload = { csrf: csrfToken, returnUrl: existingReturnUrl || null };
      const encodedState = encodeURIComponent(btoa(JSON.stringify(statePayload)));

      const authUrl =
        `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code` +
        `&client_id=${config.REACT_APP_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(config.REACT_APP_REDIRECT_URI)}` +
        `&scope=${encodeURIComponent("openid profile email")}` +
        `&state=${encodedState}`;

      console.log("2. Redirecting to LinkedIn auth URL:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error during LinkedIn authentication:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* <--------------- v1.0.0 */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-1 items-center">
                <div>
                    <Slideshow />
                </div>
                <div className="flex text-sm flex-col items-center sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]">
                    <p className="text-2xl mb-7 text-center">
                        Welcome to Upinterview,
                        <br />
                        Individual Interviewer!
                    </p>
                    <p className="text-sm mb-7 text-gray-500 text-center">
                        Enhance Your Interviewing journey with structured,
                        <br />
                        seamless scheduling and evaluation.
                    </p>
                        <button
                            onClick={handleLinkedInLogin}
                            disabled={isLoading}
                            className={`bg-custom-blue text-white py-2 rounded-full transition w-[300px] flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-custom-blue/80'}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                'Sign Up with LinkedIn'
                            )}
                        </button>
                </div>
            </div> */}
      {/* <Layout showBackButton={true} backPath="/"> */}
      <div className="min-h-screen flex">
        {/* Left side - Hero Image and Content */}
        <div className="hidden lg:flex lg:w-1/2 xl:flex xl:w-1/2 2xl:flex 2xl:w-1/2 bg-gradient-to-br from-custom-blue/90 via-custom-blue to-custom-blue/80 relative overflow-hidden rounded-r-3xl">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Professional interview setting"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-custom-blue/90 via-custom-blue/80 to-custom-blue/70"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-4 lg:px-8 py-8 lg:py-12 text-white animate-fade-in">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">
                  500+ Active Interviewers Online
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Join the Future of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                  Technical Interviews
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-2">
                Connect with leading companies and monetize your technical
                expertise. Conduct professional interviews on your schedule.
              </p>
              <div className="flex items-center text-white/70 text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Trusted by professionals from Google, Meta, Amazon
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                  $75-150
                </div>
                <div className="text-sm text-white/80">Per Hour</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                  500+
                </div>
                <div className="text-sm text-white/80">Active Interviewers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                  200+
                </div>
                <div className="text-sm text-white/80">Partner Companies</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                  10k+
                </div>
                <div className="text-sm text-white/80">Interviews Done</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Flexible Schedule</h4>
                  <p className="text-white/80 text-sm">
                    Set your own availability and work when you want
                  </p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    Premium Compensation
                  </h4>
                  <p className="text-white/80 text-sm">
                    Earn competitive rates for your expertise
                  </p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Top-Tier Companies</h4>
                  <p className="text-white/80 text-sm">
                    Work with leading tech companies and startups
                  </p>
                </div>
              </div>
            </div>

            {/* Company Logos */}
            <div className="mb-4">
              <p className="text-sm text-white/60 mb-4">
                Trusted by interviewers from:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-all duration-300">
                  <span className="text-sm font-medium">Google</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-all duration-300">
                  <span className="text-sm font-medium">Meta</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-all duration-300">
                  <span className="text-sm font-medium">Amazon</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-all duration-300">
                  <span className="text-sm font-medium">Netflix</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 flex items-start justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white pt-8">
          <div className="max-w-lg lg:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[60%] w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                {/* v1.0.1 <------------------------------------------------------------------------------------------------------------------------------------------- */}
                {/* <img src={logo} alt="Upinterview Logo" className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300" /> */}
                <img
                  src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                  alt="Upinterview Logo"
                  className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300"
                />
                {/* v1.0.1 -------------------------------------------------------------------------------------------------------------------------------------------> */}
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome Back! 👋
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sign in to access your interviewer dashboard and start earning
                </p>
                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  Ready to start interviewing
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-4 mb-6 border border-primary-200/50">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-primary-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  🚀 Quick Access To:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                    Your interview schedule and upcoming sessions
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                    Earnings dashboard and payment history
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                    New interview opportunities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                    Performance metrics and feedback
                  </li>
                </ul>
              </div>

              <button
                onClick={handleLinkedInLogin}
                className="w-full bg-custom-blue hover:bg-custom-blue/80 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className="w-6 h-6 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn ✨
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  🔒 We use LinkedIn to verify your professional background and
                  ensure quality matches.
                </p>
                {/* <p className="text-sm text-gray-500">
                  New to our platform?{' '}
                  <Link to="/" className="text-custom-blue hover:text-custom-blue/80 font-medium hover:underline transition-all duration-200">
                    Learn more about UpInterview
                  </Link>
                </p> */}
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-gray-600 font-medium">
                  🛡️ Secure & Verified Platform
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </Layout> */}
      {/* v1.0.0 ------------------> */}
    </div>
  );
};

export default WelcomePageUpinterviewIndividual;
