// v1.0.0 ------ Venkatesh--- added skills width to full and skills added in column wise
// v1.0.1 - Ashok - fixed displaying profile pic and added resume filed
// v1.0.2 - Ashok - added shimmer loading view

import Modal from "react-modal";
import {
  Phone,
  GraduationCap,
  School,
  Mail,
  X,
  Briefcase,
  Calendar,
  User,
  Circle,
  Edit,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCandidates } from "../../../../../apiHooks/useCandidates";

Modal.setAppElement("#root");

const CandidateFullscreen = () => {
  const { candidateData, isQueryLoading } = useCandidates({
    candidateLimit: Infinity,
  });
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({});
  const { id } = useParams();

  useEffect(() => {
    let isMounted = true; // flag to track component mount status

    const fetchCandidate = async () => {
      try {
        const selectedCandidate = candidateData.find(
          (candidate) => candidate._id === id
        );
        if (isMounted && selectedCandidate) {
          setCandidate(selectedCandidate);
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      }
    };

    fetchCandidate();

    return () => {
      isMounted = false; // cleanup function to avoid state updates after unmount
    };
  }, [id, candidateData]);

  const CandidateLoadingView = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 flex justify-between items-center z-50">
        <h2 className="text-2xl font-semibold text-custom-blue">Candidate</h2>
        <div className="flex items-center gap-2">
          <button
            className=" hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-gray-500 hover:text-custom-blue" />
          </button>

          <button className=" hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-24 h-24 shimmer rounded-full" />
            <div className="text-center space-y-2">
              <div className="w-40 h-5 shimmer rounded-md mx-auto" />
              <div className="w-28 h-4 shimmer rounded-md mx-auto" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-40 h-5 shimmer rounded mb-6" />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-20 h-3 shimmer rounded" />
                        <div className="w-28 h-4 shimmer rounded" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-24 h-3 shimmer rounded" />
                        <div className="w-28 h-4 shimmer rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-20 h-3 shimmer rounded" />
                        <div className="w-20 h-4 shimmer rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info + Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-40 h-5 shimmer rounded mb-6" />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="w-32 h-4 shimmer rounded" />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="w-24 h-4 shimmer rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-48 h-5 shimmer rounded mb-6" />

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-24 h-3 shimmer rounded" />
                        <div className="w-24 h-4 shimmer rounded" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-28 h-3 shimmer rounded" />
                        <div className="w-32 h-4 shimmer rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-20 h-3 shimmer rounded" />
                        <div className="w-24 h-4 shimmer rounded" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shimmer rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-24 h-3 shimmer rounded" />
                        <div className="w-28 h-4 shimmer rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Resume */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shimmer rounded-lg" />
                    <div className="space-y-2 w-full">
                      <div className="w-20 h-3 shimmer rounded" />
                      <div className="w-full h-4 shimmer rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="w-32 h-5 shimmer rounded mb-4" />

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex gap-2 w-full px-3 py-3 rounded-full border border-gray-200"
                  >
                    <div className="flex-1 h-6 shimmer rounded-full" />
                    <div className="flex-1 h-6 shimmer rounded-full" />
                    <div className="flex-1 h-6 shimmer rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Interview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="w-48 h-5 shimmer rounded mb-4" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="w-32 h-4 shimmer rounded" />
                  <div className="w-24 h-4 shimmer rounded" />
                </div>
                <div className="w-40 h-4 shimmer rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isQueryLoading) {
    return <CandidateLoadingView />;
  }

  const content = (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-white p-4 flex justify-between items-center z-10">
        <h2 className="text-2xl font-semibold text-custom-blue">Candidate</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/candidate/edit/${candidate._id}`)}
            className=" hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-gray-500 hover:text-custom-blue" />
          </button>

          <button
            onClick={() => navigate("/candidate")}
            className=" hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative">
              {candidate?.ImageData ? (
                // v1.0.1 <--------------------------------------------------------------------
                <img
                  src={candidate?.ImageData?.path}
                  // v1.0.1 -------------------------------------------------------------------->

                  alt={candidate?.FirstName || "Candidate"}
                  onError={(e) => {
                    e.target.src = "/default-profile.png";
                  }}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                  {candidate?.LastName?.charAt(0) || "?"}
                </div>
              )}
              {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                candidate?.Status === 'active' ? 'bg-green-100 text-green-800' :
                candidate?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {candidate?.Status ? candidate?.Status.charAt(0).toUpperCase() + candidate?.Status.slice(1) : "?"}

              </span> */}
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                {/* v1.0.1 <------------------------------------------------------------------- */}
                {/* {candidate?.FirstName
                  ? candidate?.FirstName.charAt(0).toUpperCase() +
                    candidate?.FirstName.slice(1)
                  : "N/A"}{" "}
                {candidate?.LastName
                  ? candidate?.LastName.charAt(0).toUpperCase() +
                    candidate?.LastName.slice(1)
                  : "N/A"} */}
                {candidate?.FirstName || candidate?.LastName
                  ? `${candidate?.FirstName?.charAt(0).toUpperCase() || ""}${
                      candidate?.FirstName?.slice(1) || ""
                    } ${candidate?.LastName?.charAt(0).toUpperCase() || ""}${
                      candidate?.LastName?.slice(1) || ""
                    }`.trim()
                  : "N/A"}
              </h3>
              {/* ----------------------------------------------------------------------> */}
              <p className="text-gray-600 mt-1">
                {candidate.CurrentRole || "position"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Personal Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-gray-700">
                          {candidate?.FirstName
                            ? candidate?.FirstName.charAt(0).toUpperCase() +
                              candidate?.FirstName.slice(1)
                            : "N/A"}{" "}
                          {candidate?.LastName
                            ? candidate?.LastName.charAt(0).toUpperCase() +
                              candidate?.LastName.slice(1)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-700">
                          {new Date(
                            candidate?.Date_Of_Birth
                          ).toLocaleDateString() || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Circle className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-700">
                          {candidate?.Gender || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </div>

                      <span className="text-gray-700">
                        {candidate?.Email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </div>

                      <span className="text-gray-700">{candidate?.Phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Professional Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <GraduationCap className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Qualification</p>

                        <p className="text-gray-700">
                          {candidate?.HigherQualification || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <School className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            University/College
                          </p>
                          <p className="text-gray-700">
                            {candidate?.UniversityCollege || "N/A"}{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experence</p>
                        <p className="text-gray-700">
                          {candidate?.CurrentExperience || "N/A"}{" "}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Relevent Experence
                        </p>
                        <p className="text-gray-700">
                          {candidate?.RelevantExperience || "N/A"}{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* v1.0.1 <-------------------------------------------------------------- */}
                  <div className="grid grid-cols-2">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Resume</p>

                          {candidate?.resume?.path ? (
                            <a
                              href={candidate.resume.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Resume"
                              className="text-blue-600 hover:underline break-all"
                            >
                              {candidate.resume.filename}
                            </a>
                          ) : (
                            <p className="text-gray-700 break-all">
                              Not Provided
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* v1.0.1 --------------------------------------------------------------> */}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate?.skills ? (
                  candidate.skills.map((skill, index) => (
                    <>
                      {/* <------v1.0.0 ------*/}
                      <div className="flex gap-2 justify-center w-full px-3 py-3 space-x-2 bg-custom-bg rounded-full border border-blue-100">
                        <span
                          key={index}
                          className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                        >
                          {skill.skill}
                        </span>
                        <span
                          key={index}
                          className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                        >
                          {skill.experience}
                        </span>
                        <span
                          key={index}
                          className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                        >
                          {skill.expertise}
                        </span>
                      </div>
                      {/* v1.0.0 ------->*/}
                    </>
                  ))
                ) : (
                  <span>No skills found</span>
                )}
              </div>
            </div>

            {/* have to add these feilds show case here later  */}
            {candidate.interviews && candidate.interviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Latest Interview
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {candidate.interviews[0].company}
                    </span>
                    <span className="text-gray-500">
                      {candidate.interviews[0].position}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Latest round: {candidate.interviews[0].rounds[0].round}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full  bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden">
      {content}
    </div>
  );
};

export default CandidateFullscreen;
