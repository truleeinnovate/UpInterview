// v1.0.0 ------ Venkatesh--- added skills width to full and skills added in column wise
//v1.0.1 ------ Ranjith---- added some fullscreen mode ato this ui
// v1.0.2  - Ashok - fixed form scroll and transition issues
// v1.0.3  - Ashok - removed form left border and outline
// v1.0.4  - Ashok - Improved responsiveness and added common popup in the place of modal
// v1.0.5  - Ashok - Fixed issues regarding responsiveness
// v1.0.6  - Ashok - Fixed responsiveness issues
// v1.0.7  - Ashok - Fixed scrollbar issue

import Modal from "react-modal";
import {
  Phone,
  GraduationCap,
  School,
  Mail,
  ExternalLink,
  X,
  Briefcase,
  User,
  Calendar,
  Expand,
  Minimize,
  Eye,
} from "lucide-react";
// import { useCustomContext } from '../../../../../Context/Contextfetch';
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../../../../../Components/Loading";
import { useCandidates } from "../../../../../apiHooks/useCandidates";
import { FaGenderless } from "react-icons/fa";
import { LiaGenderlessSolid } from "react-icons/lia";
import { GrDocumentText } from "react-icons/gr";
import { ReactComponent as FaEdit } from "../../../../../icons/FaEdit.svg";
import classNames from "classnames";
// v1.0.2 <------------------------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.2 ------------------------------------------------------------------------->
// v1.0.4 <-------------------------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.4 ------------------------------------------------------------------------->
Modal.setAppElement("#root");

const CandidateDetails = ({ mode, candidateId }) => {
  const { candidateData } = useCandidates();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const { id } = useParams();
  const params = useParams();

  const location = useLocation();
  const id = candidateId || params?.id;
  // v1.0.2 <--------------------------------------------------------------------
  // v1.0.6 <--------------------------------------------------------------------
  // v1.0.7 <--------------------------------------------------------------------
  // useScrollLock(true);
  useScrollLock(!!id);
  // v1.0.7 -------------------------------------------------------------------->
  // v1.0.6 -------------------------------------------------------------------->
  // v1.0.2 -------------------------------------------------------------------->

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

  console.log("candidate Details", candidate);

  // v1.0.4 <-----------------------------------------------------------------
  // With this:
  // const getFromPath = () => {
  //   // if (mode === "Assessment") {
  //   //   // If coming from assessment, go back to assessment details
  //   //   return `/assessment-details/${location.state?.assessmentId}`;
  //   // }
  //   if (mode === "Assessment") return -1;
  //   if (mode === "Interview") return null;
  //   // Default to candidate list or use the stored from path
  //   return location.state?.from || "/candidate";
  // };

  // const fromPath = getFromPath();

  // if (!candidate || loading) return <Loading />
  const content = (
    <div>
      <div className="flex-1">
        {/* v1.0.5 <--------------------------------------------- */}
        {/* <div className="p-6"> */}
        {/* v1.0.6 <---------------------------------------------- */}
        <div className="sm:p-0 p-6 mb-10">
          {/* v1.0.6 ---------------------------------------------> */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative">
              {candidate?.ImageData ? (
                <img
                  // src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                  src={candidate?.ImageData?.path} // Added by Ashok
                  alt={candidate?.FirstName || "Candidate"}
                  onError={(e) => {
                    e.target.src = "/default-profile.png";
                  }}
                  // v1.0.5 <--------------------------------------------------------------------------------------------
                  // className="sm:w-20 sm:h-20 w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-24 xl:h-24 2xl:w-24 2xl:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  // v1.0.5 -------------------------------------------------------------------------------------------->
                />
              ) : (
                // v1.0.4 <-----------------------------------------------------------------------------------------------------------------------------------
                // <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                // v1.0.5 <-----------------------------------------------------------------------------------------------------------------------------------
                // <div className="sm:w-20 sm:h-20 w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white sm:text-2xl text-3xl font-semibold shadow-lg">
                <div className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-24 xl:h-24 2xl:w-24 2xl:h-24 rounded-full bg-custom-blue flex items-center justify-center text-white sm:text-2xl text-3xl font-semibold shadow-lg">
                  {candidate?.LastName?.charAt(0).toUpperCase() || "?"}
                </div>
                // v1.0.5 ----------------------------------------------------------------------------------------------------------------------------------->
                // v1.0.4 ----------------------------------------------------------------------------------------------------------------------------------->
                //
              )}
              {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                candidate?.Status === 'active' ? 'bg-green-100 text-green-800' :
                candidate?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {candidate?.Status ? candidate?.Status.charAt(0).toUpperCase() + candidate?.Status.slice(1) : "?"}

              </span> */}
            </div>
            {/* v1.0.4 <-------------------------------------------------------- */}
            {/* <div className="text-center"> */}
            <div>
              {/* <h3 className="text-2xl font-bold text-gray-900"> */}
              {/* v1.0.5 <--------------------------------------------------------------------- */}
              {/* <h3 className="sm:text-xl text-2xl font-bold text-gray-900"> */}
              <h3 className="sm:text-sm md:text-md lg:text-2xl xl:text-2xl 2xl:text-2xl sm:font-semibold font-bold text-gray-900">
                {/* v1.0.5 ---------------------------------------------------------------------> */}
                {candidate?.FirstName
                  ? candidate.FirstName.charAt(0).toUpperCase() +
                    candidate.FirstName.slice(1)
                  : ""}{" "}
                {candidate?.LastName
                  ? candidate.LastName.charAt(0).toUpperCase() +
                    candidate.LastName.slice(1)
                  : ""}
              </h3>

              <p className="text-gray-600 mt-1 sm:text-sm text-lg">
                {candidate.CurrentRole || "position"}
              </p>
            </div>
            {/* v1.0.4 --------------------------------------------------------> */}
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                {/* v1.0.5 <---------------------------------------------------------------- */}
                {/* <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4"> */}
                <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                  {/* v1.0.5 ----------------------------------------------------------------> */}
                  Personal Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                    {/* name */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-gray-700">
                          {candidate?.FirstName
                            ? candidate.FirstName.charAt(0).toUpperCase() +
                              candidate.FirstName.slice(1)
                            : "N/A"}{" "}
                          {candidate?.LastName
                            ? candidate.LastName.charAt(0).toUpperCase() +
                              candidate.LastName.slice(1)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {/* dob */}
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
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <LiaGenderlessSolid className="w-5 h-5 text-gray-500" />
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

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                {/* v1.0.5 <-------------------------------------------------------- */}
                {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
                <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                  {/* v1.0.5 --------------------------------------------------------> */}
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </div>
                      {/* v1.0.4 <------------------------------------------------------------------------------- */}
                      <span className="text-gray-700 sm:truncate md:truncate md:max-w-[180px] lg:truncate lg:max-w-[180px]">
                        {candidate?.Email || "N/A"}
                      </span>
                      {/* v1.0.4 <-------------------------------------------------------------------------------> */}
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
                {/* v1.0.5 <----------------------------------------------------- */}
                {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
                <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                  {/* v1.0.5 -----------------------------------------------------> */}
                  Professional Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
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

                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
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
                          Relevant Experience
                        </p>
                        <p className="text-gray-700">
                          {candidate?.RelevantExperience || "N/A"}{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <div className="grid grid-cols-2">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <GrDocumentText className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Resume</p>
                          <p className="text-gray-700 break-all">
                            {candidate?.resume?.filename || "N/A"}
                          </p>
                        </div>
                      </div>

                      {candidate?.resume?.path && (
                        <button
                          title="View Resume"
                          type="button"
                          onClick={() =>
                            window.open(candidate.resume.path, "_blank")
                          }
                          className="text-custom-blue"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div> */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <GrDocumentText className="w-5 h-5" />
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
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* v1.0.5 <--------------------------------------------------------- */}
              {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
              <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                {/* v1.0.5 ---------------------------------------------------------> */}
                Skills
              </h4>
              {/* v1.0.4 <---------------------------------------------------------------------------------------------------- */}
              <div className="flex flex-wrap gap-3">
                {candidate?.skills ? (
                  candidate.skills.map((skill, index) => (
                    <>
                      {/* <------v1.0.0 ------*/}
                      <div
                        key={skill._id || `${skill.skill}-${index}`}
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-2 w-full px-3 py-3 bg-custom-bg rounded-lg md:rounded-full lg:rounded-full xl:rounded-full 2xl:rounded-full border border-blue-100"
                      >
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.skill}
                          </span>
                        </span>
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.experience}
                          </span>
                        </span>
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.expertise}
                          </span>
                        </span>
                      </div>

                      {/* v1.0.0 ------->*/}
                      {/* v1.0.4 ----------------------------------------------------------------------------------------------------> */}
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
    <>
      <SidebarPopup
        title="Candidate"
        onClose={() => navigate(-1)}
        id={candidate._id}
        showEdit
        showExternal
      >
        {content}
      </SidebarPopup>
    </>
  );
};
// v1.0.4 ----------------------------------------------------------------->

export default CandidateDetails;
