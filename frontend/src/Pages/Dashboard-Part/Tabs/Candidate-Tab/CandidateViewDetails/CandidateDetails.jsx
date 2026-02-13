// // v1.0.0 ------ Venkatesh--- added skills width to full and skills added in column wise
// //v1.0.1 ------ Ranjith---- added some fullscreen mode ato this ui
// // v1.0.2  - Ashok - fixed form scroll and transition issues
// // v1.0.3  - Ashok - removed form left border and outline
// // v1.0.4  - Ashok - Improved responsiveness and added common popup in the place of modal
// // v1.0.5  - Ashok - Fixed issues regarding responsiveness
// // v1.0.6  - Ashok - Fixed responsiveness issues
// // v1.0.7  - Ashok - Fixed scrollbar issue
// // v1.0.8  - Ashok - modified edit path
// // v1.0.9  - Ashok - fixed navigation to edit popup
// // v2.0.0  - Ashok - fixed style issue

// import Modal from "react-modal";
// import {
//   Phone,
//   GraduationCap,
//   School,
//   Mail,
//   Briefcase,
//   User,
//   Calendar,
//   Circle,
//   FileText,
//   IdCard,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useCandidateById } from "../../../../../apiHooks/useCandidates";
// // v1.0.2 <------------------------------------------------------------------------
// import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
// // v1.0.2 ------------------------------------------------------------------------->
// // v1.0.4 <-------------------------------------------------------------------------
// import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
// import Cookies from "js-cookie";
// // v1.0.4 ------------------------------------------------------------------------->
// Modal.setAppElement("#root");

// const CandidateDetails = ({ mode, candidateId, onClose }) => {
//   const navigate = useNavigate();
//   const [candidate, setCandidate] = useState({});
//   // const { id } = useParams();
//   const params = useParams();

//   useLocation();
//   const id = candidateId || params?.id;
//   const { candidate: fetchedCandidate } = useCandidateById(id);

//   useScrollLock(!!id);

//   useEffect(() => {
//     if (id && fetchedCandidate) {
//       setCandidate(fetchedCandidate);
//     }
//   }, [id, fetchedCandidate]);

//   // Get user token information and check organization field
//   const tokenPayload = decodeJwt(Cookies.get("authToken"));
//   const isOrganization = tokenPayload?.organization === true;

// const content = (
//   <div>
//     <div className="flex-1">
//       {/* v1.0.5 <--------------------------------------------- */}
//       {/* <div className="p-6"> */}
//       {/* v1.0.6 <---------------------------------------------- */}
//       <div className="sm:p-0 p-6 mb-10">
//         {/* v1.0.6 ---------------------------------------------> */}
//         <div className="flex justify-center items-center gap-4 mb-4">
//           <div className="relative">
//             {candidate?.ImageData ? (
//               <img
//                 // src={`http://localhost:5000/${candidate?.ImageData?.path}`}
//                 src={candidate?.ImageData?.path} // Added by Ashok
//                 alt={candidate?.FirstName || "Candidate"}
//                 onError={(e) => {
//                   e.target.src = "/default-profile.png";
//                 }}
//                 // v1.0.5 <--------------------------------------------------------------------------------------------
//                 // className="sm:w-20 sm:h-20 w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
//                 className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-24 xl:h-24 2xl:w-24 2xl:h-24 rounded-full object-cover border-4 border-white shadow-lg"
//               // v1.0.5 -------------------------------------------------------------------------------------------->
//               />
//             ) : (
//               // v1.0.4 <-----------------------------------------------------------------------------------------------------------------------------------
//               // <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
//               // v1.0.5 <-----------------------------------------------------------------------------------------------------------------------------------
//               // <div className="sm:w-20 sm:h-20 w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white sm:text-2xl text-3xl font-semibold shadow-lg">
//               <div className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-24 xl:h-24 2xl:w-24 2xl:h-24 rounded-full bg-custom-blue flex items-center justify-center text-white sm:text-2xl text-3xl font-semibold shadow-lg">
//                 {candidate?.LastName?.charAt(0).toUpperCase() || "?"}
//               </div>
//               // v1.0.5 ----------------------------------------------------------------------------------------------------------------------------------->
//               // v1.0.4 ----------------------------------------------------------------------------------------------------------------------------------->
//               //
//             )}
//             {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
//               candidate?.Status === 'active' ? 'bg-green-100 text-green-800' :
//               candidate?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
//               'bg-red-100 text-red-800'
//             }`}>
//               {candidate?.Status ? candidate?.Status.charAt(0).toUpperCase() + candidate?.Status.slice(1) : "?"}

//             </span> */}
//           </div>
//           {/* v1.0.4 <-------------------------------------------------------- */}
//           {/* <div className="text-center"> */}
//           <div>
//             {/* <h3 className="text-2xl font-bold text-gray-900"> */}
//             {/* v1.0.5 <--------------------------------------------------------------------- */}
//             {/* <h3 className="sm:text-xl text-2xl font-bold text-gray-900"> */}
//             <h3
//               className="sm:text-sm md:text-md lg:text-2xl xl:text-2xl 2xl:text-2xl sm:font-semibold font-bold text-gray-900 truncate max-w-[360px] cursor-default"
//               title={`${candidate?.FirstName} ${candidate?.LastName}`}
//             >
//               {/* v1.0.5 ---------------------------------------------------------------------> */}
//               {candidate?.FirstName
//                 ? candidate.FirstName.charAt(0).toUpperCase() +
//                 candidate.FirstName.slice(1)
//                 : ""}{" "}
//               {candidate?.LastName
//                 ? candidate.LastName.charAt(0).toUpperCase() +
//                 candidate.LastName.slice(1)
//                 : ""}
//             </h3>

//             <p className="text-gray-600 mt-1 sm:text-sm text-lg">
//               {candidate?.roleDetails?.roleLabel || "position"}
//             </p>
//           </div>
//           {/* v1.0.4 --------------------------------------------------------> */}
//         </div>

//         <div className="space-y-3">
//           <div className="grid grid-cols-1 gap-6">
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               {/* v1.0.5 <---------------------------------------------------------------- */}
//               {/* <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4"> */}
//               <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
//                 {/* v1.0.5 ----------------------------------------------------------------> */}
//                 Personal Details
//               </h4>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   {/* name */}
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <User className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Name</p>
//                       <p
//                         className="text-gray-700 truncate cursor-default max-w-[200px]"
//                         title={`${candidate?.FirstName} ${candidate?.LastName}`}
//                       >
//                         {candidate?.FirstName
//                           ? candidate.FirstName.charAt(0).toUpperCase() +
//                           candidate.FirstName.slice(1)
//                           : "N/A"}{" "}
//                         {candidate?.LastName
//                           ? candidate.LastName.charAt(0).toUpperCase() +
//                           candidate.LastName.slice(1)
//                           : "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                   {/* dob */}
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Calendar className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Date of Birth</p>
//                       <p className="text-gray-700">
//                         {new Date(
//                           candidate?.Date_Of_Birth
//                         ).toLocaleDateString() || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Circle className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Gender</p>
//                       <p className="text-gray-700">
//                         {candidate?.Gender || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-3">
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               {/* v1.0.5 <-------------------------------------------------------- */}
//               {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
//               <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
//                 {/* v1.0.5 --------------------------------------------------------> */}
//                 Contact Information
//               </h4>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Mail className="w-5 h-5 text-gray-500" />
//                     </div>
//                     {/* v1.0.4 <------------------------------------------------------------------------------- */}
//                     <span
//                       title={candidate?.Email}
//                       className="text-gray-700 truncate max-w-[200px] cursor-default"
//                     >
//                       {candidate?.Email || "N/A"}
//                     </span>
//                     {/* v1.0.4 <-------------------------------------------------------------------------------> */}
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Phone className="w-5 h-5 text-gray-500" />
//                     </div>

//                     <span className="text-gray-700">{candidate?.Phone}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               {/* v1.0.5 <----------------------------------------------------- */}
//               {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
//               <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
//                 {/* v1.0.5 -----------------------------------------------------> */}
//                 Professional Details
//               </h4>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <GraduationCap className="w-5 h-5" />
//                     </div>

//                     <div>
//                       <p className="text-sm text-gray-500">Qualification</p>

//                       <p className="text-gray-700">
//                         {candidate?.HigherQualification || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-custom-bg rounded-lg">
//                         <School className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">
//                           University/College
//                         </p>
//                         <p className="text-gray-700">
//                           {candidate?.UniversityCollege || "N/A"}{" "}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Briefcase className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">
//                         Total Experience
//                       </p>
//                       <p className="text-gray-700">
//                         {candidate?.CurrentExperience || "N/A"}{" "}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Briefcase className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">
//                         Relevant Experience
//                       </p>
//                       <p className="text-gray-700">
//                         {candidate?.RelevantExperience || "N/A"}{" "}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 {/* <div className="grid grid-cols-2">
//                   <div className="flex items-center justify-between gap-3 w-full">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-custom-bg rounded-lg">
//                         <FileText className="w-5 h-5" />
//                       </div>

//                       <div>
//                         <p className="text-sm text-gray-500">Resume</p>
//                         <p className="text-gray-700 break-all">
//                           {candidate?.resume?.filename || "N/A"}
//                         </p>
//                       </div>
//                     </div>

//                     {candidate?.resume?.path && (
//                       <button
//                         title="View Resume"
//                         type="button"
//                         onClick={() =>
//                           window.open(candidate.resume.path, "_blank")
//                         }
//                         className="text-custom-blue"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div> */}
//                 <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
//                   {/* <div className="flex items-center justify-between gap-3 w-full"> */}
//                   {/* <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <Briefcase className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Technology</p>
//                       <p className="text-gray-700">
//                         {candidate?.technologyLabel || "N/A"}{" "}
//                       </p>
//                     </div>
//                   </div> */}

//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-custom-bg rounded-lg">
//                       <FileText className="w-5 h-5" />
//                     </div>

//                     <div>
//                       <p className="text-sm text-gray-500">Resume</p>

//                       {candidate?.resume?.path ? (
//                         <a
//                           href={candidate.resume.path}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           title="View Resume"
//                           className="text-blue-600 hover:underline break-all"
//                         >
//                           {candidate.resume.filename}
//                         </a>
//                       ) : (
//                         <p className="text-gray-700 break-all">
//                           Not Provided
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                   {/* </div> */}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//             {/* v1.0.5 <--------------------------------------------------------- */}
//             {/* <h4 className="text-lg font-semibold text-gray-800 mb-4"> */}
//             <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
//               {/* v1.0.5 ---------------------------------------------------------> */}
//               Skills
//             </h4>
//             {/* v1.0.4 <---------------------------------------------------------------------------------------------------- */}
//             <div className="flex flex-wrap gap-3">
//               {candidate?.skills ? (
//                 candidate.skills.map((skill, index) => (
//                   // v1.0.0 ------
//                   <div
//                     key={skill._id || `${skill.skill}-${index}`}
//                     className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-2 w-full px-3 py-3 bg-custom-bg rounded-lg md:rounded-full lg:rounded-full xl:rounded-full 2xl:rounded-full border border-blue-100"
//                   >
//                     <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
//                       <span className="truncate max-w-full">
//                         {skill.skill}
//                       </span>
//                     </span>
//                     <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
//                       <span className="truncate max-w-full">
//                         {skill.experience}
//                       </span>
//                     </span>
//                     <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
//                       <span className="truncate max-w-full">
//                         {skill.expertise}
//                       </span>
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <span>No skills found</span>
//               )}
//             </div>
//           </div>

//           {/* have to add these feilds show case here later  */}
//           {candidate.interviews && candidate.interviews.length > 0 && (
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               <h4 className="text-lg font-semibold text-gray-800 mb-4">
//                 Latest Interview
//               </h4>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-700">
//                     {candidate.interviews[0].company}
//                   </span>
//                   <span className="text-gray-500">
//                     {candidate.interviews[0].position}
//                   </span>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Latest round: {candidate.interviews[0].rounds[0].round}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* External ID Field - Only show for organization users */}
//           {candidate?.externalId && isOrganization && (
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               <h4 className="text-lg font-semibold text-gray-800 mb-4">
//                 External ID
//               </h4>
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-custom-bg rounded-lg">
//                   <IdCard className="w-5 h-5 text-gray-500" />
//                 </div>
//                 <span className="text-gray-700">{candidate?.externalId}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// );

//   const onCloseSlide = () => {
//     if (mode === "Interview") {
//       onClose();
//     } else {
//       navigate(-1);
//     }
//   };

//   return (
//     <>
//       {/* v1.0.8 <----------------------------------------------------------- */}
//       <SidebarPopup
//         title="Candidate"
//         onClose={onCloseSlide}
//         id={candidate._id}
//         showEdit
//         onEdit={() => navigate(`/candidates/edit/${candidate._id}`)}
//         showExternal
//       >
//         {content}
//       </SidebarPopup>
//       {/* v1.0.8 -----------------------------------------------------------> */}
//     </>
//   );
// };
// // v1.0.4 ----------------------------------------------------------------->

// export default CandidateDetails;

import {
  Phone,
  GraduationCap,
  School,
  Mail,
  User,
  Calendar,
  FileText,
  X,
  Edit,
  LayoutDashboard,
  Briefcase,
  Rss,
  ArrowLeft,
  Plus,
  Clock,
  Target,
  ExternalLink,
  Download,
  Award,
  Dot,
  IndianRupee,
  MapPin,
  Languages,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCandidateById } from "../../../../../apiHooks/useCandidates";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import ActivityComponent from "../../../Tabs/CommonCode-AllTabs/Activity";
import ApplyPositionPopup from "./ApplyPositionPopup.jsx";
import { useApplicationsByCandidate } from "../../../../../apiHooks/useApplications";
import Breadcrumb from "../../../Tabs/CommonCode-AllTabs/Breadcrumb.jsx";
import { Button } from "../../../../../Components/Buttons/Button.jsx";
import { Loader2 } from "lucide-react";
import ApplicationView from "../../Position-Tab/ApplicationView";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";

// Resumes Tab Component
const ResumesTab = ({ candidateId, candidateName }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/candidate/${candidateId}/resumes`,
        );
        setResumes(response.data);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchResumes();
    }
  }, [candidateId]);

  const handleDownload = async (url, filename) => {
    if (!url) {
      console.error("No URL provided for download");
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "resume.pdf";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  const handlePreview = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    if (!bytes) return "Unknown size";

    const k = 1024;
    const dm = 2; // Decimal places
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    // Calculate which unit index to use
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Ensure we don't exceed the array length
    const unitIndex = i < sizes.length ? i : sizes.length - 1;

    return (
      parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm)) +
      " " +
      sizes[unitIndex]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">No Resumes Found</p>
        <p className="text-sm text-gray-400 mt-2">
          No resumes have been uploaded for this candidate yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume, index) => {
        const versionLabel = resume.version
          ? `v${resume.version}`
          : `v${resumes.length - index}`;
        return (
          <div
            key={resume._id}
            className={`bg-white rounded-lg border ${resume.isActive ? "border-[rgb(33,121,137)] shadow-sm" : "border-gray-200"} p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${resume.isActive ? "bg-[rgb(33,121,137)] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      Resume {versionLabel}
                    </span>
                    {resume.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                      <span>Uploaded:</span>
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                    {resume?.source === "UPLOAD" &&
                      resume?.resume?.fileSize && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-sm">
                            {formatSize(resume?.resume?.fileSize)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {resume?.source === "UPLOAD" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePreview(resume.resume?.path)}
                    className="text-sm text-gray-500 hover:text-[rgb(33,121,137)] hover:underline cursor-pointer transition-colors max-w-[200px] truncate"
                    title="Preview Resume"
                  >
                    {resume?.resume?.filename}
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        // resume.fileUrl,
                        resume.resume?.path,
                        `${(candidateName || "Candidate").replace(/\s+/g, "_")}_Resume_${versionLabel}.pdf`,
                      )
                    }
                    className="p-2 text-gray-500 hover:text-[rgb(33,121,137)] hover:bg-gray-50 rounded-full transition-colors"
                    title="Download Resume"
                  >
                    <Download size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Applications Tab Component
const ApplicationsTab = ({ candidateId, onOpenApplication }) => {
  const { applications, isLoading } = useApplicationsByCandidate(candidateId);
  const navigate = useNavigate();
  // ... existing helper functions

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "SCREENED":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEWING":
        return "bg-yellow-100 text-yellow-800";
      case "OFFERED":
        return "bg-orange-100 text-orange-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "HIRED":
        return "bg-green-100 text-green-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScreeningColor = (screening) => {
    switch (screening) {
      case "Strong Yes":
        return "text-green-700 font-semibold";
      case "Yes":
        return "text-green-600";
      case "Maybe":
        return "text-yellow-600";
      case "No":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getMatchColor = (match) => {
    if (match >= 80) return "text-green-600 font-semibold";
    if (match >= 60) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const handleOpenApplication = (application) => {
    navigate(`/application/view-details/${application._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">
          No Applications Found
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Apply Position" to create an application for this candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden my-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resume
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Screening
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interview
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {application.applicationNumber || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.positionId?.title || "Unknown"}
                  </div>
                  {application.positionId?.companyname?.companyName && (
                    <div className="text-xs text-gray-500">
                      {application.positionId.companyname.companyName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {application.resumeVersion || "Resume v1"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${getMatchColor(application.screeningScore || 0)}`}
                  >
                    {application.screeningScore || 0}%
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${getScreeningColor(application.screeningResult || "Pending")}`}
                  >
                    {application.screeningResult || "Pending"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(application.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.currentStage || "N/A"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {application.interviewStatus || "Not Started"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}
                  >
                    {application.status || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleOpenApplication(application)}
                    className="flex items-center gap-2 px-3 py-1 text-white rounded hover:opacity-90"
                    style={{ backgroundColor: "rgb(33, 121, 137)" }}
                  >
                    <ExternalLink size={16} />
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WorkExperience = ({ candidate }) => {
  const formatResponsibilitiesToList = (text) => {
    if (!text) return [];
    return text.split("\n").filter((line) => line.trim() !== "");
  };

  const EmptyState = ({ message }) => (
    <p className="text-sm text-gray-400 italic py-2 ml-4">{message}</p>
  );

  const sections = [
    {
      title: "Professional Summary",
      icon: <FileText size={20} className="text-custom-blue" />,
      content:
        formatResponsibilitiesToList(candidate?.professionalSummary).length >
          0 ? (
          <ul className="list-disc list-inside space-y-1 ml-4">
            {formatResponsibilitiesToList(candidate?.professionalSummary).map(
              (point, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 break-words leading-relaxed"
                >
                  {capitalizeFirstLetter(point?.replace(/^[•\s*-]+/, ""))}
                </li>
              ),
            )}
          </ul>
        ) : (
          <EmptyState message="No professional summary provided." />
        ),
    },
    {
      title: "Projects",
      icon: <Briefcase size={20} className="text-green-600" />,
      content:
        candidate.workExperience?.length > 0 ? (
          /* Timeline Container */
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-2.5 before:h-full before:w-0.5 before:bg-gray-100 ml-1.5">
            {candidate.workExperience.map((project, index) => (
              <div key={index} className="relative pl-8 group">
                {/* Timeline Dot Marker */}
                <div className="absolute left-1 top-0 w-4 h-4 rounded-full border-2 border-custom-blue bg-white group-hover:border-custom-blue/90 transition-colors z-10" />

                <h5
                  className="font-bold text-md text-gray-800 truncate max-w-[260px] mb-1"
                  title={project?.projectName}
                >
                  {capitalizeFirstLetter(project?.projectName)}
                </h5>

                <div className="flex items-center gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-gray-500 h-3.5 w-3.5" />
                    <p className="text-xs text-gray-700 font-semibold truncate max-w-[200px]">
                      {capitalizeFirstLetter(project?.role)}
                    </p>
                  </div>
                  <Dot className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{project?.fromDate?.split("-")[0]}</span>
                    <span>-</span>
                    <span>
                      {project?.toDate
                        ? project.toDate.split("-")[0]
                        : "Present"}
                    </span>
                  </div>
                </div>

                {/* Responsibilities list with slightly adjusted padding for timeline alignment */}
                <ul className="list-disc list-inside mt-3 space-y-1.5">
                  {formatResponsibilitiesToList(project?.responsibilities).map(
                    (point, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 break-words leading-relaxed pl-1"
                      >
                        {capitalizeFirstLetter(point?.replace(/^[•\s*-]+/, ""))}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No projects listed." />
        ),
    },
    {
      title: "Key Achievements",
      icon: <Award size={20} className="text-purple-600" />,
      content:
        formatResponsibilitiesToList(candidate?.keyAchievements).length > 0 ? (
          <ul className="list-disc list-inside space-y-1 ml-4">
            {formatResponsibilitiesToList(candidate?.keyAchievements).map(
              (point, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 break-words leading-relaxed"
                >
                  {capitalizeFirstLetter(point?.replace(/^[•\s*-]+/, ""))}
                </li>
              ),
            )}
          </ul>
        ) : (
          <EmptyState message="No key achievements provided." />
        ),
    },
  ];

  return (
    <div className="w-full space-y-8 relative">
      {sections?.map((section, index) => (
        <div
          key={index}
          className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-50 rounded-lg">{section?.icon}</div>
            <h4 className="font-bold text-gray-800 text-lg">
              {section?.title}
            </h4>
          </div>

          <div className="text-sm text-gray-600 leading-relaxed">
            {section?.content}
          </div>
        </div>
      ))}
    </div>
  );
};

const CandidateDetails = ({ mode, candidateId, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState({});
  const [activeTab, setActiveTab] = useState("Overview");
  const params = useParams();

  const id = candidateId || params?.id;
  const { candidate: fetchedCandidate, isLoading } = useCandidateById(id);

  const [showApplyPositionPopup, setShowApplyPositionPopup] = useState(false);

  useScrollLock(!!id);

  useEffect(() => {
    if (id && fetchedCandidate) {
      setCandidate(fetchedCandidate);
    }
  }, [id, fetchedCandidate]);

  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const isOrganization = tokenPayload?.organization === true;

  const handleClose = () => {
    if (mode === "Interview" && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const tabs = [
    { id: "Overview", name: "Overview" },
    ...(isOrganization ? [{ id: "Applications", name: "Applications" }] : []),
    { id: "Resumes", name: "Resumes" },
    { id: "Feeds", name: "Feeds" },
  ];

  if (isLoading || !candidate?._id) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
      </div>
    );
  }

  const formatToK = (value) => {
    // Handle null, undefined, empty string, invalid input
    if (value == null || value === "") return "N/A";

    const num = Number(value);
    if (isNaN(num) || num <= 0) return "N/A";

    // For values < 1000 we can show full number or still use K — your choice
    if (num < 1000) return num.toLocaleString("en-IN");

    // const inThousands = Math.round(num / 1000);

    // Shows 1 decimal place if it exists, e.g., 85.5K instead of 86K
    const inThousands = (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1);
    return `${inThousands}K`;
  };

  const breadcrumbItems = [
    {
      label: "Candidate",
      path: "/candidates",
    },
    {
      label: candidate?.title || "Candidate Details",
      path: `/candidates/view-details/${id}`,
      status: candidate?.status,
    },
  ];

  const noticePeriodOptions = [
    { value: "Immediate", label: "Immediate (0 days)" },
    { value: "7days", label: "7 Days" },
    { value: "15days", label: "15 Days" },
    { value: "30days", label: "30 Days" },
    { value: "45days", label: "45 Days" },
    { value: "60days", label: "60 Days" },
    { value: "90days", label: "90 Days" },
    { value: "Morethan90days", label: "More than 90 Days" },
    { value: "Negotiable", label: "Negotiable" },
  ];

  const getNoticePeriodLabel = (value) => {
    const option = noticePeriodOptions.find((opt) => opt.value === value);
    return option ? option.label : value || "N/A";
  };

  return (
    <div className="fixed top-[62px] left-0 right-0 bottom-0 z-40 bg-gray-50 flex flex-col overflow-hidden">
      {/* Main Container - matching PositionSlideDetails max-width style */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 bg-white shadow-sm min-h-screen">
          {/* Header/Back Navigation Section */}
          <div className="flex flex-row items-center justify-between gap-4 py-6 px-8 sm:px-0">
            <button
              onClick={handleClose}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="sm:hidden inline text-sm sm:text-base font-medium">
                Back to {mode === "Interview" ? "Interview" : "Candidates"}
              </span>
            </button>
          </div>

          <div className="px-8">{<Breadcrumb items={breadcrumbItems} />}</div>
          {/* Tabs Navigation - Structured like PositionSlideDetails */}
          <div className="mx-8 border-b border-gray-200 sm:px-0">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? "border-custom-blue text-custom-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content Section */}
          <div className="py-6 px-8 sm:px-0">
            {activeTab === "Overview" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Profile Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-6 p-6">
                    <div className="relative">
                      {candidate?.ImageData ? (
                        <img
                          src={candidate?.ImageData?.path}
                          alt={candidate?.FirstName}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                          {candidate?.LastName?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="sm:text-md md:text-md lg:text-lg xl:text-2xl 2xl:text-2xl font-bold text-gray-900">
                        {capitalizeFirstLetter(candidate?.FirstName)}{" "}
                        {capitalizeFirstLetter(candidate?.LastName)}
                      </h3>
                      <p className="text-gray-600 font-medium mt-1">
                        {capitalizeFirstLetter(
                          candidate?.roleDetails?.roleLabel,
                        ) || "Not Specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      title="Edit Candidate"
                      onClick={() =>
                        navigate(`/candidates/edit/${candidate._id}`)
                      }
                      className="inline-flex items-center border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                      <span className="sm:hidden inline ml-1">Candidate</span>
                    </Button>
                    {isOrganization && (
                      <Button
                        title="Apply Position"
                        onClick={() => setShowApplyPositionPopup(true)}
                        className="inline-flex items-center border text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Apply
                        <span className="sm:hidden inline ml-1">Position</span>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                  {/* Personal Column & Contact Details */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-4">
                        Personal Details
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.Gender || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Date of Birth
                            </p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.Date_Of_Birth
                                ? new Date(
                                  candidate.Date_Of_Birth,
                                ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-4">
                        Contact Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Phone Number
                            </p>
                            <p className="flex items-center text-sm gap-1 font-medium text-gray-800">
                              <span>{candidate?.CountryCode}</span>
                              {candidate?.Phone || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-custom-blue mt-1" />
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500">
                              Email Address
                            </p>
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {candidate?.Email || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-custom-blue mt-1"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect width="4" height="12" x="2" y="9" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">
                              LinkedIn URL
                            </p>

                            {candidate?.linkedInUrl ? (
                              <a
                                href={
                                  candidate.linkedInUrl.startsWith("http")
                                    ? candidate.linkedInUrl
                                    : `https://${candidate.linkedInUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-custom-blue hover:underline break-all"
                              >
                                {candidate.linkedInUrl}
                              </a>
                            ) : (
                              <p className="font-medium text-sm text-gray-800">
                                N/A
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Expectations / Availability & Education Details */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-4">
                        Education & Experience Details
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex gap-3">
                          <GraduationCap className="w-5 h-5 text-custom-blue" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Qualification
                            </p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.HigherQualification || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <School className="w-5 h-5 text-custom-blue" />
                          <div>
                            <p className="text-xs text-gray-500">University</p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.UniversityCollege || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-start gap-3">
                          <Briefcase className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Current Role
                            </p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.roleDetails?.roleLabel || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Total Experience
                            </p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.CurrentExperience || 0} Years
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Target className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Relevant Experience
                            </p>
                            <p className="font-medium text-sm text-gray-800">
                              {candidate?.RelevantExperience || 0} Years
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Experience Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-4">
                        Additional Details
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-custom-blue mt-1" />
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500">
                              Current Location
                            </p>
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {candidate?.location || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Languages className="w-4 h-4 text-custom-blue mt-1" />
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500">Languages</p>
                            <p
                              className="font-medium text-sm text-gray-800 truncate"
                              title={
                                Array.isArray(candidate?.languages)
                                  ? candidate.languages
                                    .map((lang) =>
                                      capitalizeFirstLetter(lang),
                                    )
                                    .join(", ")
                                  : "N/A"
                              }
                            >
                              {Array.isArray(candidate?.languages) &&
                                candidate.languages.length > 0
                                ? candidate.languages
                                  .map((lang) => capitalizeFirstLetter(lang))
                                  .join(", ")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <IndianRupee className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Salary Expectation (Annual)
                            </p>

                            <p className="flex items-center gap-1 text-sm font-medium text-gray-800">
                              {candidate?.minSalary != null ||
                                candidate?.maxSalary != null ? (
                                <>
                                  {formatToK(candidate?.minSalary ?? 0)} –{" "}
                                  {formatToK(candidate?.maxSalary ?? 0)}
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-custom-blue mt-1" />
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500">
                              Notice Period
                            </p>
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {getNoticePeriodLabel(candidate?.noticePeriod)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-custom-blue font-bold text-sm">
                            #
                          </span>
                          <div>
                            <p className="text-sm text-gray-500">External ID</p>
                            <p className="font-medium text-gray-800">
                              {candidate.externalId || "N/A"}{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Skills Section - Standard List Style */}
                <div className="bg-white rounded-xl sm:shadow-none shadow-sm sm:border-none border border-gray-100 sm:p-0 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Skills
                  </h4>
                  <div className="flex flex-wrap sm:gap-4 gap-2">
                    {candidate?.skills?.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <div
                          key={skill._id || `skill-${index}`}
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
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        No skills found
                      </span>
                    )}
                  </div>
                </div>
                {/* Certifications */}
                <div className="bg-white rounded-xl sm:shadow-none shadow-sm sm:border-none border border-gray-100 sm:p-0 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6">
                    Certifications
                  </h4>

                  {Array.isArray(candidate?.certifications) &&
                    candidate?.certifications?.length > 0 ? (
                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                      {candidate.certifications.map((cert, index) => (
                        <div key={index} className="relative pl-8">
                          <div className="absolute -left-[16px] top-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ring-4 ring-white">
                            <Award className="w-4 h-4 text-custom-blue" />
                          </div>
                          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800 group-hover:text-custom-blue transition-colors">
                                {typeof cert === 'string' ? capitalizeFirstLetter(cert) : capitalizeFirstLetter(cert?.name || "")}
                              </span>
                              {typeof cert !== 'string' && (
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  {cert?.issuingFrom && (
                                    <span>{capitalizeFirstLetter(cert.issuingFrom)}</span>
                                  )}
                                  {cert?.issuingFrom && cert?.issuingYear && <span>•</span>}
                                  {cert?.issuingYear && (
                                    <span>{cert.issuingYear}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-3">
                      <span className="text-sm text-gray-500 italic">
                        No certifications listed
                      </span>
                    </div>
                  )}
                </div>
                {/* Work Experience */}
                <div className="bg-white rounded-xl sm:shadow-none shadow-sm sm:border-none border border-gray-100 sm:p-0 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Work Experience
                  </h4>
                  <div>
                    <WorkExperience candidate={fetchedCandidate} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Applications" && (
              <ApplicationsTab candidateId={candidate._id} />
            )}

            {activeTab === "Resumes" && (
              <ResumesTab
                candidateId={candidate._id}
                candidateName={`${candidate.FirstName} ${candidate.LastName}`}
              />
            )}

            {activeTab === "Feeds" && (
              <ActivityComponent
                parentId={candidate?._id}
                candidateId={candidate._id}
                candidateName={`${candidate.FirstName} ${candidate.LastName}`} // Pass candidate name
              />
            )}
          </div>
        </div>
      </div>

      {showApplyPositionPopup && (
        <ApplyPositionPopup
          candidate={candidate}
          onClose={() => setShowApplyPositionPopup(false)}
          onSuccess={() => {
            // Optionally show success toast or refresh data
          }}
        />
      )}
    </div>
  );
};

export default CandidateDetails;
