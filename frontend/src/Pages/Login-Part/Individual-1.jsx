// Login.jsx
// v1.0.0 - Mansoor - Initial modern UI implementation
// v1.0.1 - Mansoor - Added responsive styles for sm, md, lg, xl, 2xl breakpoints
// v1.0.2 - Ashok - added padding to the cards container for mobile

import React from "react";
import Layout from "./Layout.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleIndividualLogin = () => {
    navigate("/individual-login", { state: { from: "login" } });
  };

  const handleOrganizationLogin = () => {
    navigate("/organization-login", { state: { from: "login" } });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-20 xl:mb-20 2xl:mb-20">
            <h1 className="px-6 text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8 leading-tight">
              Accelerate Your
              <span className="text-custom-blue ml-3">Interview Process</span>
            </h1>
            <p className="px-6 text-sm sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg text-gray-600 max-w-3xl sm:max-w-3xl md:max-w-4xl lg:max-w-4xl xl:max-w-4xl 2xl:max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-12 xl:mb-12 2xl:mb-12 leading-relaxed">
              Connect with expert freelance interviewers or manage your internal
              team. Schedule technical interviews instantly without waiting for
              your team's availability.
            </p>
            {/* <div className="flex flex-row sm:flex-col gap-4 sm:gap-6 md:gap-6 lg:gap-6 xl:gap-6 2xl:gap-6 justify-center">
                            <button
                                onClick={handleIndividualLogin}
                                className="bg-custom-blue text-white text-sm sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-medium px-6 sm:px-8 md:px-8 lg:px-8 xl:px-8 2xl:px-8 py-3 sm:py-4 md:py-4 lg:py-4 xl:py-4 2xl:py-4 rounded-lg hover:bg-custom-blue/90 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-opacity-50"
                                aria-label="Individual Login"
                            >
                                Join as Interviewer
                            </button>
                            <button
                                onClick={handleOrganizationLogin}
                                className="bg-white text-custom-blue text-base sm:text-lg md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-medium px-6 sm:px-8 md:px-8 lg:px-8 xl:px-8 2xl:px-8 py-3 sm:py-4 md:py-4 lg:py-4 xl:py-4 2xl:py-4 rounded-lg border-2 border-custom-blue hover:bg-custom-blue/10 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-opacity-50"
                                aria-label="Organization Login"
                            >
                                Get Started - Organization
                            </button>
                        </div> */}
          </div>

          {/* Value Proposition Cards */}
          <div className=" flex sm:flex-col md:flex-col justify-center lg:space-x-14 xl:space-x-14 2xl:space-x-14 sm:space-y-10 md:space-y-10 mb-8 items-center sm:px-6 md:px-6">
            {/* for individual */}
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl p-6 shadow-lg border-l-4 border-custom-blue hover:shadow-2xl transition-all duration-300">
              <div className="w-16 sm:w-20 md:w-20 lg:w-20 xl:w-20 2xl:w-20 h-16 sm:h-20 md:h-20 lg:h-20 xl:h-20 2xl:h-20 bg-custom-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8">
                <svg
                  className="w-8 sm:w-10 md:w-10 lg:w-10 xl:w-10 2xl:w-10 h-8 sm:h-10 md:h-10 lg:h-10 xl:h-10 2xl:h-10 text-custom-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 md:mb-6 lg:mb-6 xl:mb-6 2xl:mb-6">
                For Individual
              </h3>
              <p className="text-md text-gray-600 mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8 leading-relaxed">
                Join our network of skilled freelance interviewers. Monetize
                your expertise by conducting technical interviews for leading
                companies. Flexible scheduling, competitive rates.
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-4 xl:space-y-4 2xl:space-y-4 mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8 text-left">
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Flexible interview scheduling</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Competitive hourly rates</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Work with top-tier companies</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Build your professional network</span>
                </div>
              </div>
              <button
                onClick={handleIndividualLogin}
                className="w-full bg-custom-blue text-white text-base font-medium py-3 rounded-lg hover:bg-custom-blue/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
            </div>
            {/* for organization */}
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl p-6 shadow-lg border-l-4 border-custom-blue hover:shadow-2xl transition-all duration-300">
              <div className="w-16 sm:w-20 md:w-20 lg:w-20 xl:w-20 2xl:w-20 h-16 sm:h-20 md:h-20 lg:h-20 xl:h-20 2xl:h-20 bg-custom-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8">
                <svg
                  className="w-8 sm:w-10 md:w-10 lg:w-10 xl:w-10 2xl:w-10 h-8 sm:h-10 md:h-10 lg:h-10 xl:h-10 2xl:h-10 text-custom-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-4a1 1 0 011-1h4a1 1 0 011 1v4M7 7h10M7 11h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 md:mb-6 lg:mb-6 xl:mb-6 2xl:mb-6">
                For Organization
              </h3>
              <p className="text-md text-gray-600 mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8 leading-relaxed">
                Scale your hiring without delays. Access our network of expert
                interviewers or manage your internal team. Schedule interviews
                instantly and accelerate your recruitment.
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-4 xl:space-y-4 2xl:space-y-4 mb-6 sm:mb-8 md:mb-8 lg:mb-8 xl:mb-8 2xl:mb-8 text-left">
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Instant interview scheduling</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Access to expert interviewers</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Manage internal team availability</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 sm:w-5 md:w-5 lg:w-5 xl:w-5 2xl:w-5 h-4 sm:h-5 md:h-5 lg:h-5 xl:h-5 2xl:h-5 text-custom-blue mr-2 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-3 2xl:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Reduce time-to-hire by 60%</span>
                </div>
              </div>
              <button
                onClick={handleOrganizationLogin}
                className="w-full bg-custom-blue text-white text-base font-medium py-3 rounded-lg hover:bg-custom-blue/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Login;
