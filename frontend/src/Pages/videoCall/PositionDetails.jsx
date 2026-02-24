// v1.0.0 - Ashok - Improved responsiveness

import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Award,
  Briefcase,
  ChevronUp,
  ChevronDown,
  Building2,
  Clock,
  MapPin,
} from "lucide-react";
import { useInterviews } from "../../apiHooks/useInterviews";
import { useMockInterviewById } from "../../apiHooks/useMockInterviews";
import {
  extractUrlData,
  // useCandidateDetails,
} from "../../apiHooks/useVideoCall";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const PositionDetails = () => {
  const location = useLocation();
  const feedback = location.state?.feedback || {};

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );

  const isMockInterview =
    urlData?.interviewType === "mockinterview" || feedback?.isMockInterview;

  const { useInterviewDetails } = useInterviews();

  const {
    mockInterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview
      ? urlData.interviewRoundId || feedback?.interviewRoundId
      : null,
    enabled: isMockInterview,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview
      ? urlData.interviewRoundId || feedback?.interviewRoundId
      : null,
    enabled: !isMockInterview,
  });

  console.log("INTERVIEW DATA ======================> ", interviewData);

  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    certificates: false,
    projects: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expertiseStyles = {
    Expert: "bg-emerald-100 text-emerald-800",
    Advanced: "bg-blue-100 text-blue-800",
    Intermediate: "bg-amber-100 text-amber-800",
    Basic: "bg-purple-100 text-purple-800",
    Beginner: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="sm:px-0 px-5 py-6 space-y-6 min-h-screen">
      {/* Basic Info */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mt-2">
        <div className="flex items-center mb-4">
          <Briefcase
            className="sm:h-4 sm:w-4 md:h-4 md:w-4 h-5 w-5 mr-2"
            style={{ color: "rgb(33, 121, 137)" }}
          />
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
            Position Information
          </h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Position */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p
                  className="text-sm text-gray-900 truncate cursor-default max-w-[200px]"
                  title={capitalizeFirstLetter(
                    interviewData?.positionId?.title,
                  )}
                >
                  {capitalizeFirstLetter(interviewData?.positionId?.title) || "Not Provided"}
                </p>
              </div>
            </div>
            {/* Company */}
            <div className="flex items-center gap-3 cursor-default">
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p
                  className="text-sm text-gray-900 truncate max-w-[200px]"
                  title={capitalizeFirstLetter(
                    interviewData?.positionId?.companyname?.name,
                  )}
                >
                  {capitalizeFirstLetter(
                    interviewData?.positionId?.companyname?.name,
                  ) || "Not Available"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Position */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p
                  className="text-sm text-gray-900 truncate cursor-default max-w-[200px]"
                  title={capitalizeFirstLetter(
                    interviewData?.positionId?.Location,
                  )}
                >
                  {capitalizeFirstLetter(interviewData?.positionId?.Location) || "Not Provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <button
          onClick={() => toggleSection("skills")}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Award
              className="h-5 w-5 mr-2"
              style={{ color: "rgb(33, 121, 137)" }}
            />
            <h3 className="text-lg font-medium text-gray-900">
              Skills & Expertise
            </h3>
          </div>
          {expandedSections.skills ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expandedSections.skills && (
          <div className="mt-4 space-y-3">
            {interviewData?.positionId?.skills.map((skill, index) => (
              <div
                key={skill._id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
              >
                <div className="flex flex-col items-start">
                  <p className="sm:text-sm font-semibold text-gray-900">
                    {skill.skill}
                  </p>
                  {!isMockInterview && (
                    <p
                      className={`px-2 py-1 rounded-full text-xs font-medium ${expertiseStyles[skill.expertise] || "bg-gray-100 text-gray-800"}`}
                    >
                      {skill.expertise}
                    </p>
                  )}
                </div>

                {!isMockInterview && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight ${
                      skill.requirement_level === "REQUIRED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : skill.requirement_level === "PREFERRED"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : skill.requirement_level === "NICE_TO_HAVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {skill.requirement_level?.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    // v1.0.0 ------------------------------------------------------------------------>
  );
};

export default PositionDetails;
