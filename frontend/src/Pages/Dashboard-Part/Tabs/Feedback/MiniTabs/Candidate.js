// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Fixed responsiveness issues

import React, { useState } from "react";

import { useLocation } from "react-router-dom";
import {
  Award,
  Briefcase,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  User,
  Video,
} from "lucide-react";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
import { useMemo } from "react";
import {
  extractUrlData,
  // useCandidateDetails,
} from "../../../../../apiHooks/useVideoCall";

// import { useFeedbackData } from "../../../../../apiHooks/useFeedbacks";
import { useMockInterviewById } from "../../../../../apiHooks/useMockInterviews";
import { useInterviews } from "../../../../../apiHooks/useInterviews";
// import { Users, Video, LogOut, User, MessageSquare, FileText } from 'lucide-react';
const CandidateMiniTab = ({
  selectedData: propsSelecteData,
  isAddMode,
  decodedData: propsDecodedData,
  isViewMode,
  roundId,
  interviewType
}) => {
  useScrollLock(true);
  const location = useLocation();
  const feedback = location.state?.feedback || {};

  const { useInterviewDetails } = useInterviews();

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );

  const isMockInterview = urlData?.interviewType === "mockinterview" || interviewType === "mockinterview";

  console.log("isMockInterview", isMockInterview)

  // ✅ ALWAYS call hooks
  const {
    mockInterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: !isMockInterview,
  });
  console.log("roundId", roundId)

  console.log("interviewData interviewData CandidateMiniTab", interviewData);

  const candidateData =
    propsSelecteData?.candidate || interviewData?.candidateId || mockInterview
      ? propsSelecteData?.candidate ||
      interviewData?.candidateId ||
      mockInterview
      : feedback.candidateId || {};

  const safeSkills = candidateData?.skills ?? [];
  const safeCertificates = candidateData?.certificates ?? [];
  const safeProjects = candidateData?.projects ?? [];

  const positionData = !isMockInterview
    ? propsSelecteData?.position || interviewData?.positionId
      ? propsSelecteData?.position || interviewData?.positionId
      : feedback.positionId || {}
    : null;

  console.log("candidateData candidateData CandidateMiniTab", candidateData);
  console.log("positionData in candidate details ", positionData);
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

  // Mock position data since it's not in the candidate object
  // const position = {
  //   title: positionData.title,
  //   //department: "Engineering"
  // };

  // // Use candidate data directly
  // const candidateDetails = {
  //   skills: candidateData.skills || [],
  //   certificates: candidateData.certificates || [],
  //   projects: candidateData.projects || [],
  // };

  const meetingId =
    interviewData?.rounds[0]?.meetingId ||
    mockInterview?.rounds[0]?.meetingId ||
    "";

  const isLoading = isInterviewLoading || isMockLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-custom-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  return (
    // v1.0.0 <-----------------------------------------------------------
    <div className="sm:px-0 px-5 space-y-6 min-h-screen">
      {/* v1.0.0 <----------------------------------------------------------- */}
      {/* Basic Info */}

      {isAddMode && (
        <div className="top-14 right-4 z-40 pt-3">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  meetingId,
                  // interviewData?.interviewRound?.meetingId,
                  // decodedData.meetLink
                  "_blank",
                )
              }
              className="text-sm bg-custom-blue hover:bg-custom-blue/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        </div>
      )}

      {/* v1.0.0 <----------------------------------------------------------------- */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mt-2">
        <div className="flex items-center mb-4">
          <User
            className="h-5 w-5 mr-2"
            style={{ color: "rgb(33, 121, 137)" }}
          />
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
            Candidate Information
          </h3>
        </div>
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-gray-900">
              {candidateData?.FirstName || candidateData?.LastName
                ? candidateData?.FirstName + " " + candidateData?.LastName
                : candidateData?.candidateName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Experience</p>
            <p className="text-gray-900">
              {candidateData?.CurrentExperience
                ? candidateData?.CurrentExperience + " years"
                : candidateData?.currentExperience + " years"}
            </p>
          </div>

          {!isMockInterview && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Position Applied
                </p>
                <p className="text-gray-900">{positionData?.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Company Name
                </p>
                <p className="text-gray-900">
                  {positionData?.companyname?.name || "Not Available"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {/* v1.0.0 -----------------------------------------------------------------> */}

      {/* Skills */}
      {/* v1.0.0 <----------------------------------------------------------------- */}
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
            <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
              Skills & Expertise
            </h3>
          </div>
          {expandedSections.skills ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {safeSkills.length === 0 ? (
          <p className="text-sm text-gray-500">No skills found.</p>
        ) : (
          expandedSections?.skills && (
            <div className="mt-4 space-y-3">
              {safeSkills?.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="sm:text-sm font-medium text-gray-900">
                      {skill.skill || skill}
                    </p>
                    {!isMockInterview && (
                      <p className="text-sm text-gray-500">
                        {skill.experience} experience
                      </p>
                    )}
                  </div>
                  {!isMockInterview && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${skill.expertise === "Expert"
                        ? "bg-green-100 text-green-800"
                        : skill.expertise === "Advanced"
                          ? "bg-blue-100 text-blue-800"
                          : skill.expertise === "Basic"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {skill.expertise}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
      {/* v1.0.0 -----------------------------------------------------------------> */}

      {/* Certificates */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <button
          onClick={() => toggleSection("certificates")}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <GraduationCap
              className="h-5 w-5 mr-2"
              style={{ color: "rgb(33, 121, 137)" }}
            />
            {/* v1.0.0 <----------------------------------------------------------------- */}
            <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
              Certifications
            </h3>
            {/* v1.0.0 -----------------------------------------------------------------> */}
          </div>
          {expandedSections?.certificates ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expandedSections?.certificates && safeCertificates?.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">No certificates found.</p>
        ) : (
          expandedSections?.certificates && (
            <div className="mt-4 space-y-3">
              {safeCertificates?.map((cert, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{cert?.name}</p>
                  <p className="text-sm text-gray-500">
                    {cert?.issuer} • {new Date(cert?.date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Projects */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <button
          onClick={() => toggleSection("projects")}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Briefcase
              className="h-5 w-5 mr-2"
              style={{ color: "rgb(33, 121, 137)" }}
            />
            {/* v1.0.0 <-------------------------------------------------------------------------------------------------------------- */}
            <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
              Projects
            </h3>
            {/* v1.0.0 --------------------------------------------------------------------------------------------------------------> */}
          </div>
          {expandedSections?.projects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expandedSections?.projects && (
          <div className="mt-4 space-y-4">
            {safeProjects && safeProjects.length === 0 ? (
              <p className="text-sm text-gray-500">No projects found.</p>
            ) : (
              safeProjects?.map((project, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900">{project?.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {project?.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project?.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Duration: {project?.duration}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateMiniTab;
