// import React, { useCallback, useEffect, useState } from "react";
// import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
// import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
// import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
// import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
// import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
// import { ReactComponent as IoIosArrowDownBlack } from "../../../../icons/IoIosArrowDownBlack.svg";
// // import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
// // import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
// import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
// import toast from "react-hot-toast";
// import manImage from "../../Images/man.png";
// import womanImage from "../../Images/woman.png";
// import profileImage from "../../Images/profile-image.png";
// import profile from "../../Images/profile.png";
// import axios from "axios";
// import { useMemo } from "react";
// import Tooltip from "@mui/material/Tooltip";
// import { toggleButtonClasses } from "@mui/material";
// import ShareAssessment from "./ShareAssessment";

// const ScheduledAssessmentTab = ({getScheduledAssessments,filteredScheduledAssessmentData,setFilteredScheduledAssessmentData,candidateAssessmentData,setCandidateAssessmentData,scheduledAssessmentData,setScheduledAssessmentData, assessmentId, onClickViewButtonOfScheduledAssessment }) => {
//   // const [scheduledAssessmentData, setScheduledAssessmentData] = useState([]);
//   // const [candidateAssessmentData, setCandidateAssessmentData] = useState({});
//   // const [filteredScheduledAssessmentData, setFilteredScheduledAssessmentData] =
//   //   useState([]);
//   const [isScheduledAssessmentFilterOpen, setIScheduledAssessmentFilterOpen] =
//     useState(false);

//   const [actionViewMore, setActionViewMore] = useState({});
//   const [assessmentActionViewMore, setAssessmentActionViewMore] = useState("");

//   const toggleAssessmentActionMore = (id) => {
//     setAssessmentActionViewMore((prev) => (prev === id ? null : id));
//   };

//   const toggleAction = (id) => {
//     setActionViewMore((prev) => (prev === id ? null : id));
//   };

//   const toggleScheduleAssessmentActionCancel = async (id) => {
//     setAssessmentActionViewMore("");
//     try {
//       const response = await axios.patch(
//         `${process.env.REACT_APP_API_URL}/schedule-assessment/${id}`
//       );
//       // alert(`${response.data.message}`)
//       getScheduledAssessments();
//     } catch (error) {
//       console.log("error in updating candidate assessment status");
//     }
//   };

//   const toggleCandidateAssessmentActionCancel = async (id) => {
//     setActionViewMore("");

//     try {
//       const response = await axios.patch(
//         `${process.env.REACT_APP_API_URL}/candidate-assessment/${id}`,{status:"cancelled"}
//       );
//       // alert(`${response.data.message}`)
//       getScheduledAssessments();
//     } catch (error) {
//       console.log("error in updating candidate assessment status");
//     }
//   };
//   const onClickFilterIcons = () => {
//     setIScheduledAssessmentFilterOpen(!isScheduledAssessmentFilterOpen);
//   };
//   const [selectedAssessment, setSelectedAssessment] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const itemsPerPage = 8;
//   const totalPages = Math.ceil(scheduledAssessmentData.length / itemsPerPage);

//   useEffect(() => {
//     getScheduledAssessments();
//   }, []);

//   const onClickLeftPaginationIcon = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prev) => prev - 1);
//     }
//   };

//   const onClickRightPaginationIcon = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const paginatedData = useMemo(() => {
//     return filteredScheduledAssessmentData.slice(
//       (currentPage - 1) * itemsPerPage,
//       itemsPerPage * currentPage
//     );
//   }, [filteredScheduledAssessmentData, currentPage]);

//   const fetchAssessmentCandidate = useCallback(
//     async (id) => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/candidate-assessment/${id}`
//         );
//         if (response.data.success) {
//           setCandidateAssessmentData(response.data.candidateAssessments || []);
//           // alert(`${response.data.message}`)
//         }
//       } catch (error) {
//         console.log(`${error.message}`);
//         // alert(`${error.message}`)
//       }
//     },
//     [selectedAssessment]
//   );

//   const onClickExpandArrow = (id) => {
//     // fetchAssessmentCandidate(id)
//     setSelectedAssessment(id);
//   };

//   const onClickCloseArrow = () => {
//     setSelectedAssessment("");
//   };
//   console.log("candidate assessment", candidateAssessmentData);

//   return (
//     <>
//     <div className="mt-4">
//       {/* Header */}
//       <div className="flex justify-between">
//         <div>
//           <h2 className="font-semibold text-lg">Scheduled Assessment</h2>
//         </div>
//         {/* right-side container */}
//         <div className="right-side-container">
//           <div className="flex items-center gap-6  text-gray-500">
//             <p>
//               {currentPage}/{totalPages}
//             </p>
//             <div className="flex items-center gap-2">
//               <Tooltip title="previous" enterDelay={300} leaveDelay={100} arrow>
//                 <button
//                   className={`border-[1px] border-gray-400 p-1 rounded-sm ${
//                     currentPage === 1 && "cursor-not-allowed"
//                   }`}
//                   onClick={onClickLeftPaginationIcon}
//                 >
//                   <IoIosArrowBack />
//                 </button>
//               </Tooltip>
//               <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
//                 <button
//                   className={`border-[1px] border-gray-400 p-1 rounded-sm ${
//                     currentPage === totalPages && "cursor-not-allowed disabled"
//                   }`}
//                   onClick={onClickRightPaginationIcon}
//                 >
//                   <IoIosArrowForward />
//                 </button>
//               </Tooltip>
//             </div>
//             <div>
//               <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
//                 <button
//                   onClick={onClickFilterIcons}
//                   className="p-1 rounded-sm border-[1px] border-gray-500 text-[#227a8a]"
//                 >
//                   {isScheduledAssessmentFilterOpen ? (
//                     <LuFilterX />
//                   ) : (
//                     <FiFilter />
//                   )}
//                 </button>
//               </Tooltip>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* table */}
//       <div className="mt-4 -mx-10">
//         <table className="w-full ">
//           <thead className="bg-[#afe6f1] sticky top-0 z-10  ">
//             <th className="p-1 text-md font-semibold  text-center ">
//               Assessment Id
//             </th>
//             <th className="p-1 text-md  font-semibold text-center ">
//               Candidates
//             </th>
//             <th className="p-1 text-md font-semibold  text-center ">
//               Expiry At
//             </th>
//             <th className="p-1 text-md font-semibold text-center ">Status</th>
//             <th></th>
//             <th className="p-1 text-md font-semibold text-center ">Action</th>
//           </thead>

//           <tbody className="w-full">
//             {paginatedData.length === 0 ? (
//               // <tr className="w-full h-[200px] flex justify-center items-center">
//               <tr className="mt-5 border-collapse">
//                 <td colSpan="5" className="text-center">
//                   <div className="w-full flex flex-col  justify-center items-center mt-5">
//                     <h2 className="text-lg font-semibold">
//                       You don't have any scheduled assessment
//                     </h2>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               paginatedData.map((assessment) => (
//                 <>
//                   <tr
//                     key={assessment._id}
//                     className="border-collapse border-b-[1px] border-t-[1px] border-[#8080808f]"
//                   >
//                     <td className="text-center p-2 text-[#227a8a]">
//                       assessment-{assessment._id.slice(-5, -1)}
//                     </td>
//                     <td className="text-center p-2">

//                       <div className="flex justify-center relative items-center">
//                         <div className="relative w-[80px] h-10 ">
//                           <img
//                             src={manImage}
//                             alt="First"
//                             className="w-10 rounded-full aspect-square absolute z-40 text-white  border-2 border-gray-900 "
//                           />
//                           <img
//                             src={profile}
//                             alt="Second"
//                             className="w-10 rounded-full aspect-square absolute left-[20px] z-30  border-2 border-gray-900 "
//                           />
//                           <img
//                             src={womanImage}
//                             alt="Third"
//                             className="w-10 rounded-full aspect-square absolute left-[40px] z-20  border-2 border-gray-900 "
//                           />
//                           <img
//                             src={profile}
//                             alt="Fourth"
//                             className="w-10 rounded-full aspect-square absolute left-[60px] z-10  border-2 border-gray-900 "
//                           />
//                         </div>
//                       </div>
//                     </td>
//                     {/* <td className="text-center p-2">{assessment.expiryAt}</td> */}
//                     <td className="text-center p-2">
//                       {new Intl.DateTimeFormat("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: true,
//                       })
//                         .format(new Date(assessment.expiryAt))
//                         .replace("am", "AM")
//                         .replace("pm", "PM")}
//                     </td>

//                     <td className="text-center p-2">{assessment.status}</td>
//                     <td>
//                       {selectedAssessment === assessment._id ? (
//                         <IoIosArrowUp
//                           onClick={() => onClickCloseArrow()}
//                           className="text-2xl font-bold cursor-pointer"
//                         />
//                       ) : (
//                         <IoIosArrowDown
//                           onClick={() => onClickExpandArrow(assessment._id)}
//                           className="text-2xl font-bold cursor-pointer"
//                         />
//                       )}
//                     </td>
//                     <td className="text-center p-2">
//                       <div
//                         className="flex justify-center cursor-pointer"
//                         onClick={() =>{

//                           toggleAssessmentActionMore(assessment._id)
//                         }}
//                       >
//                         <FiMoreHorizontal className="text-2xl" />
//                       </div>
//                       {assessment._id === assessmentActionViewMore && (
//                         <div className="absolute z-20 w-28 bg-white p-2 shadow-lg border border-gray-200 rounded-sm ">
//                           <div className="flex flex-col gap-2">

//                             <button
//                             onClick={()=>onClickViewButtonOfScheduledAssessment(assessment)}
//                              className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
//                               View
//                             </button>
//                             <button>Share</button>
//                             <button
//                               onClick={() =>
//                                 toggleScheduleAssessmentActionCancel(
//                                   assessment._id
//                                 )
//                               }
//                               className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
//                             >
//                               {/* Cancel */}
//                               Remove
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                   {assessment._id === selectedAssessment && (
//                     <tr className="border-collapse">
//                       <td colSpan="6" className="">
//                         <div className="mx-10 max-h-[400px] overflow-auto">
//                           <table className="w-full rounded-sm border border-[#8080808f]">
//                             <thead className="z-10 border-collapse sticky top-0 bg-white border border-[#8080808f]">
//                               <tr className="border-collapse">
//                                 <th className="p-1 text-md text-[#227a8a] font-semibold text-center">
//                                   Candidate Name
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Status
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Expiry At
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Started At
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Ended At
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Progress
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
//                                   Total Score
//                                 </th>
//                                 <th className="p-1 text-md text-[#227a8a]  font-semibold text-center bg-white">
//                                   Action
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {candidateAssessmentData[assessment._id]
//                                 .length === 0 ? (
//                                 <tr>
//                                   <td colSpan="8" className="text-center p-2">
//                                     No candidate data available
//                                   </td>
//                                 </tr>
//                               ) : (
//                                 candidateAssessmentData[assessment._id].map(
//                                   (candidateAssessment, index) => (
//                                     <tr
//                                       key={index}
//                                       className="border-b border-[#8080808f] border-collapse"
//                                     >
//                                       <td className="text-center p-2 ">
//                                         {
//                                           candidateAssessment.candidateId.FirstName
//                                         }
//                                       </td>
//                                       <td className="text-center  p-2">
//                                         {candidateAssessment.status}
//                                       </td>

//                                       <td className="text-center p-2">
//                                         {new Intl.DateTimeFormat("en-GB", {
//                                           day: "2-digit",
//                                           month: "short",
//                                           year: "numeric",
//                                           hour: "2-digit",
//                                           minute: "2-digit",
//                                           hour12: true,
//                                         })
//                                           .format(
//                                             new Date(
//                                               candidateAssessment.expiryAt
//                                             )
//                                           )
//                                           .replace("am", "AM")
//                                           .replace("pm", "PM")}
//                                       </td>
//                                       <td className="text-center  p-2">
//                                         {new Intl.DateTimeFormat("en-GB", {
//                                           day: "2-digit",
//                                           month: "short",
//                                           year: "numeric",
//                                           hour: "2-digit",
//                                           minute: "2-digit",
//                                           hour12: true,
//                                         })
//                                           .format(
//                                             new Date(
//                                               candidateAssessment.startedAt
//                                             )
//                                           )
//                                           .replace("am", "AM")
//                                           .replace("pm", "PM") || "-"}
//                                       </td>
//                                       <td className="text-center  p-2">
//                                         {new Intl.DateTimeFormat("en-GB", {
//                                           day: "2-digit",
//                                           month: "short",
//                                           year: "numeric",
//                                           hour: "2-digit",
//                                           minute: "2-digit",
//                                           hour12: true,
//                                         })
//                                           .format(
//                                             new Date(
//                                               candidateAssessment.endedAt
//                                             )
//                                           )
//                                           .replace("am", "AM")
//                                           .replace("pm", "PM") || "-"}
//                                       </td>
//                                       <td className="text-center  p-2">
//                                         {candidateAssessment.progress}
//                                       </td>
//                                       <td className="text-center  p-2">
//                                         {candidateAssessment.totalScore}
//                                       </td>
//                                       <td className="text-center p-2 ">
//                                         <div className="relative flex justify-center items-center cursor-pointer">
//                                           <button
//                                             onClick={() =>
//                                               toggleAction(
//                                                 candidateAssessment._id
//                                               )}
//                                           >
//                                             <FiMoreHorizontal className="text-2xl text-gray-600 hover:text-gray-800" />
//                                           </button>
//                                           {actionViewMore ===
//                                             candidateAssessment._id && (
//                                             <div className="   flex flex-col gap-2 absolute top-5 right-1 z-20 w-28 bg-white p-2 shadow-lg border border-gray-200 rounded-sm ">

//                                                 <button
//                                                  onClick={() =>
//                                               toggleAction(
//                                                 candidateAssessment._id
//                                               )
//                                             }
//                                             className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
//                                                   View
//                                                 </button>
//                                                 <button
//                                                   onClick={() =>
//                                                     toggleCandidateAssessmentActionCancel(
//                                                       candidateAssessment._id
//                                                     )
//                                                   }
//                                                   className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
//                                                 >
//                                                   Cancel
//                                                 </button>

//                                             </div>
//                                           )}
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   )
//                                 )
//                               )}
//                             </tbody>
//                           </table>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     <div>
//         <p>jief</p>
//     <ShareAssessment/>
//     </div>
//     <p>fjieijeij</p>
//     </>
//   );
// };

// export default ScheduledAssessmentTab;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
import { ReactComponent as IoIosArrowDownBlack } from "../../../../icons/IoIosArrowDownBlack.svg";
// import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
// import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import {
  IoIosAddCircleOutline,
  IoIosArrowDown,
  IoIosArrowUp,
} from "react-icons/io";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { ReactComponent as IoIosAddCircle } from "../../../../icons/IoIosAddCircle.svg";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoCaretDownSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import manImage from "../../Images/man.png";
import womanImage from "../../Images/woman.png";
import profileImage from "../../Images/profile-image.png";
import profile from "../../Images/profile.png";
import axios from "axios";
import { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import { toggleButtonClasses } from "@mui/material";
import { BiDownArrow } from "react-icons/bi";
import ShareAssessment from "./ShareAssessment";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { fetchFilterData } from "../../../../utils/dataUtils";
import Cookies from "js-cookie";

// const ScheduledAssessmentTab = ({showSharePopup,setShowSharePopup,getScheduledAssessments,filteredScheduledAssessmentData,setFilteredScheduledAssessmentData,candidateAssessmentData,setCandidateAssessmentData,scheduledAssessmentData,setScheduledAssessmentData, assessmentId, onClickViewButtonOfScheduledAssessment }) => {
const ScheduledAssessmentTab = ({
  fetchAssessmentData,
  linkExpiryDays,
  getScheduledAssessments,
  filteredScheduledAssessmentData,
  setFilteredScheduledAssessmentData,
  candidateAssessmentData,
  setCandidateAssessmentData,
  scheduledAssessmentData,
  setScheduledAssessmentData,
  assessmentId,
  onClickViewButtonOfScheduledAssessment,
}) => {
  const [isScheduledAssessmentFilterOpen, setIScheduledAssessmentFilterOpen] =
    useState(false);

  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(
    () => sharingPermissionscontext.candidate || {},
    [sharingPermissionscontext]
  );

  const [isCandidateSharing, setIsCandidateSharing] = useState(false);
  const [isScheduledAssessmentSharing, setIsScheduledAssessmentSharing] =
    useState(false);

  const [actionViewMore, setActionViewMore] = useState({});
  const [assessmentActionViewMore, setAssessmentActionViewMore] = useState("");

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showCandidatesDropDown, setShowCandidatesDropdown] = useState(false);
  const candidateInputRef = useRef();

  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [candidateData, setCandidateData] = useState([]);
  const candidateRef = useRef(null);
  const [candidateInput, setCandidateInput] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const handleCandidateRemove = (candidateId) => {
    setSelectedCandidates(
      selectedCandidates.filter((candidate) => candidate._id !== candidateId)
    );
  };

  const handleDropdownToggle = () => {
    setShowCandidatesDropdown((prev) => !prev);
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      // setLoading(true);
      try {
        const filteredCandidates = await fetchFilterData(
          "candidate",
          sharingPermissions
        );
        const candidatesWithImages = filteredCandidates.map((candidate) => {
          return candidate;
        });
        setCandidateData(candidatesWithImages);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchCandidateData();
  }, [sharingPermissions]);

  const toggleAssessmentActionMore = (id) => {
    setAssessmentActionViewMore((prev) => (prev === id ? null : id));
  };

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const toggleScheduleAssessmentActionCancel = async (id) => {
    setAssessmentActionViewMore("");
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/schedule-assessment/update/${id}`,
        { status: "cancelled" }
      );

      getScheduledAssessments();
    } catch (error) {
      console.log("error in updating candidate assessment status");
    }
  };

  const toggleCandidateAssessmentActionCancel = async (id) => {
    setActionViewMore("");

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/candidate-assessment/update/${id}`,
        { status: "cancelled" }
      );

      getScheduledAssessments();
    } catch (error) {
      console.log("error in updating candidate assessment status");
    }
  };
  const onClickFilterIcons = () => {
    setIScheduledAssessmentFilterOpen(!isScheduledAssessmentFilterOpen);
  };
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMainContent, setShowMainContent] = useState(true);
  const dropdownRef = useRef(null);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(scheduledAssessmentData.length / itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    getScheduledAssessments();
  }, []);

  const onClickLeftPaginationIcon = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const onClickRightPaginationIcon = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const paginatedData = useMemo(() => {
    return filteredScheduledAssessmentData.slice(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage * currentPage
    );
  }, [filteredScheduledAssessmentData, currentPage]);

  const fetchAssessmentCandidate = useCallback(
    async (id) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/candidate-assessment/scheduled-assessment/${id}`
        );
        if (response.data.success) {
          setCandidateAssessmentData(response.data.candidateAssessments || []);
          // alert(`${response.data.message}`)
        }
      } catch (error) {
        console.log(`${error.message}`);
        // alert(`${error.message}`)
      }
    },
    [selectedAssessment]
  );

  const onClickExpandArrow = (id) => {
    setSelectedAssessment(id);
  };

  const onClickCloseArrow = () => {
    setSelectedAssessment("");
  };
  console.log("candidate assessment", candidateAssessmentData);

  const onClickCandidateDropDown = (e) => {
    e.stopPropagation();
    setShowCandidatesDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        candidateInputRef.current &&
        !candidateInputRef.current.contains(event.target)
      ) {
        setShowCandidatesDropdown(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleCandidateSelect = (candidate) => {
    if (
      candidate &&
      !selectedCandidates.some((selected) => selected._id === candidate._id)
    ) {
      setSelectedCandidates([...selectedCandidates, candidate]);
      setErrors({ ...errors, Candidate: "" });
    }
    setCandidateInput("");
    setShowCandidatesDropdown(false);
  };

  const handleCandidateInputChange = (e) => {
    const inputValue = e.target.value;
    setCandidateInput(inputValue);
    const filtered = candidateData.filter((candidate) =>
      candidate.LastName.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredCandidates(filtered);
    setShowCandidatesDropdown(!showCandidatesDropDown);
  };

  const handleClearAllCandidates = () => {
    setSelectedCandidates([]);
  };

  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    setShowNewCandidateContent(true);
  };

  const handleShareClick = async () => {
    if (selectedCandidates.length === 0) {
      setErrors({
        ...errors,
        Candidate: "Please select at least one candidate.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const reqBody = {
        assessmentId,
        organizationId: Cookies.get("organizationId"),
        expiryAt: new Date(
          new Date().setDate(new Date().getDate() + linkExpiryDays)
        ),
        status: "scheduled",
        proctoringEnabled: true,
        createdBy: Cookies.get("userId"),
      };
      const scheduleAssessmentResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`,
        reqBody
      );
      const selectedCandidateIds = selectedCandidates.map(
        (candidate) => candidate._id
      );
      const candidatesPayload = selectedCandidates.map(
        (candidate) => ({ candidateId: candidate._id, emails: candidate.Email })
      );

      if (scheduleAssessmentResponse.data.success) {
        const CandidateAssessmentsList = selectedCandidateIds.map(
          (candidateId) => ({
            scheduledAssessmentId:
              scheduleAssessmentResponse.data.assessment._id,
            candidateId,
            status: "pending",
            expiryAt: new Date(
              new Date().setDate(new Date().getDate() + linkExpiryDays)
            ),
            isActive: true,
            assessmentLink: "",
          })
        );
        console.log("candidate assessment list", CandidateAssessmentsList);
        const CandidateAssessmentResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/candidate-assessment/create`,
          CandidateAssessmentsList
        );
        // if (CandidateAssessmentResponse.data.success) {
        //   const response = await axios.post(
        //     `${process.env.REACT_APP_API_URL}/candidate-assessment/send-assessment-link`,
        //     {
        //       scheduledAssessmentId:
        //         scheduleAssessmentResponse.data.assessment._id,
        //       candidateEmails: candidatesPayload,
        //     }
        //   );
        //   // alert(`${response.data.message}`)
        //   toast.success(`${response.data.message}`);
        // }
        if (CandidateAssessmentResponse.data.success) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/emailCommon/assessmentResendEmail`,
            {
              candidates: { scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id, candidatesPayload },
              category: "assessment",
              userId: Cookies.get("userId"),
              organizationId: Cookies.get("organizationId"),
              isResendOTP: false,
            }
          );
          // alert(`${response.data.message}`)
          toast.success(`${response.data.message}`);
        }

        setIsLoading(false);

        // onCloseshare();
        setSelectedCandidates([]);
        setShowSharePopup(false);
        fetchAssessmentData();
        getScheduledAssessments();
      }

      toast.success(`Assessment Scheduled`);
    } catch (error) {
      console.error(
        "error in sharing assessment from frontend in Share Assessment page",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
  // main share
  const onClickShareScheduledAssessment = async (id) => {
    // alert("share is clicked")
    try {
      setIsScheduledAssessmentSharing(true);
      console.log("candidate assessment data", candidateAssessmentData)
      const temp = candidateAssessmentData[id]
      const candidatesPayload = temp.map(item => ({ candidateId: item.candidateId._id, emails: item.candidateId.Email, assessmentLink: item.assessmentLink, recipientId: item.candidateId.ownerId, candidateName: item.candidateId.LastName,expiryAt:item.expiryAt }))
      console.log("temp", temp)
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/emailCommon/assessmentResendEmail`, {
        candidates: { scheduledAssessmentId: id, candidatesPayload },
        category: "assessment",
        isResendOTP: false,
        ownerId: Cookies.get("userId"),
        tenantId: Cookies.get("organizationId"),
        assessmentId,
        // ccEmail: userProfile.Email,
        ccEmail: "shaikmansoor1200@gmail.com"

      }
      );
      if (response.data.success) {
        toast.success(`${response.data.message}`);
      }
      setIsScheduledAssessmentSharing(false);
    } catch (error) {
      console.error("error in sharing assessment", error.message);
    } finally {
      setIsScheduledAssessmentSharing(false);
    }
  };
  // induivial share
  const onClickShareScheduledAssessmentIndividualCandidate = async (
    said,
    cid
  ) => {
    console.log("said",said,"cid",cid,"candidateAssessmentData[said]",candidateAssessmentData[said])
    try {
      setIsCandidateSharing(true);
      const temp = candidateAssessmentData[said]
      console.log("temp", temp)
      const candidatesPayload = temp.filter(item => item.candidateId._id === cid).map(item => ({ candidateId: item.candidateId._id, emails: item.candidateId.Email, assessmentLink: item.assessmentLink,recipientId: item.candidateId.ownerId, candidateName: item.candidateId.LastName,expiryAt:item.expiryAt }))
      console.log("payload", candidatesPayload)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/emailCommon/assessmentResendEmail`, {
        candidates: { scheduledAssessmentId: said, candidatesPayload },
        category: "assessment",
        isResendOTP: false,
        ownerId: Cookies.get("userId"),
        tenantId: Cookies.get("organizationId"),
        assessmentId,
        // ccEmail: userProfile.Email,
        ccEmail: "shaikmansoor1200@gmail.com"

      }
      );

      if (response.data.success) {
        toast.success(`${response.data.message}`);
        setIsCandidateSharing(false);
      }
    } catch (error) {
      console.error("error in sending link to candidate ", error.message);
    } finally {
      setIsCandidateSharing(false);
    }
  };

  // const isNotExpired = async(expiryAt,initiator,id) => {
  //   try {
  //     if (initiator==="parent"){
  //       await axios.patch(`${process.env.REACT_APP_API_URL}/schedule-assessment/${id}`,{status:"expired"})
  //   }
  //   if(initiator==="child"){
  //     await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/${id}`,{status:"expired"})

  //   }
  //   } catch (error) {
  //     console.log("error in checking status",error.message)
  //   }
  //   return expiryAt && new Date(expiryAt) > new Date();
  // };

  const isNotExpired = (expiryAt) => {
    return expiryAt && new Date(expiryAt) > new Date();
  };

  return (
    <>
      {showMainContent && (
        <div className="mt-4">
          {/* Header */}
          <div className="flex justify-end ">
            {/* <div>
          <h2 className="font-semibold text-lg">Scheduled Assessment</h2>
        </div> */}
            {/* right-side container */}
            <div className="right-side-container flex items-center gap-8 ">
              <div>
                <button
                  className="bg-[#227a8a] rounded-sm px-3 py-1 text-white shadow-md"
                  onClick={() => setShowSharePopup(true)}
                >
                  New
                </button>
              </div>
              <div className="flex items-center gap-6  text-gray-500">
                <p>
                  {currentPage}/{totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Tooltip
                    title="previous"
                    enterDelay={300}
                    leaveDelay={100}
                    arrow
                  >
                    <button
                      className={`border-[1px] border-gray-400 p-1 rounded-sm ${currentPage === 1 && "cursor-not-allowed"
                        }`}
                      onClick={onClickLeftPaginationIcon}
                    >
                      <IoIosArrowBack />
                    </button>
                  </Tooltip>
                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <button
                      className={`border-[1px] border-gray-400 p-1 rounded-sm ${currentPage === totalPages &&
                        "cursor-not-allowed disabled"
                        }`}
                      onClick={onClickRightPaginationIcon}
                    >
                      <IoIosArrowForward />
                    </button>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip
                    title="Filter"
                    enterDelay={300}
                    leaveDelay={100}
                    arrow
                  >
                    <button
                      onClick={onClickFilterIcons}
                      className="p-1 rounded-sm border-[1px] border-gray-500 text-[#227a8a]"
                    >
                      {isScheduledAssessmentFilterOpen ? (
                        <LuFilterX />
                      ) : (
                        <FiFilter />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          {/* table */}
          <div className="mt-4 -mx-10">
            <table className="w-full ">
              <thead className="bg-[#afe6f1] sticky top-0 z-10  ">
                <th className="p-1 text-md font-semibold  text-center ">
                  Assessment Id
                </th>
                <th className="p-1 text-md  font-semibold text-center ">
                  Candidates
                </th>
                <th className="p-1 text-md font-semibold  text-center ">
                  Expiry At
                </th>
                <th className="p-1 text-md font-semibold text-center ">
                  Status
                </th>
                <th></th>
                <th className="p-1 text-md font-semibold text-center ">
                  Action
                </th>
              </thead>

              <tbody className="w-full">
                {paginatedData.length === 0 ? (
                  // <tr className="w-full h-[200px] flex justify-center items-center">
                  <tr className="mt-5 border-collapse">
                    <td colSpan="5" className="text-center">
                      <div className="w-full flex flex-col  justify-center items-center mt-5">
                        <h2 className="text-lg font-semibold">
                          You don't have any scheduled assessment
                        </h2>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((assessment) => (
                    <>
                      <tr
                        key={assessment._id}
                        className="border-collapse border-b-[1px] border-t-[1px] border-[#8080808f]"
                      >
                        <td className="text-center p-2 text-[#227a8a]">
                          assessment-{assessment._id.slice(-5, -1)}
                        </td>
                        <td className="text-center p-2">
                          <div className="flex justify-center relative items-center">
                            <div className="relative w-[80px] h-10 ">
                              <img
                                src={manImage}
                                alt="First"
                                className="w-10 rounded-full aspect-square absolute z-40 text-white  border-2 border-gray-900 "
                              />
                              <img
                                src={profile}
                                alt="Second"
                                className="w-10 rounded-full aspect-square absolute left-[20px] z-30  border-2 border-gray-900 "
                              />
                              <img
                                src={womanImage}
                                alt="Third"
                                className="w-10 rounded-full aspect-square absolute left-[40px] z-20  border-2 border-gray-900 "
                              />
                              <img
                                src={profile}
                                alt="Fourth"
                                className="w-10 rounded-full aspect-square absolute left-[60px] z-10  border-2 border-gray-900 "
                              />
                            </div>
                          </div>
                        </td>
                        {/* <td className="text-center p-2">{assessment.expiryAt}</td> */}
                        <td className="text-center p-2">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                            .format(new Date(assessment.expiryAt))
                            .replace("am", "AM")
                            .replace("pm", "PM")}
                        </td>

                        <td className="text-center p-2">{assessment.status}</td>
                        <td>
                          {selectedAssessment === assessment._id ? (
                            <IoIosArrowUp
                              onClick={() => onClickCloseArrow()}
                              className="text-2xl font-bold cursor-pointer"
                            />
                          ) : (
                            <IoIosArrowDown
                              onClick={() => onClickExpandArrow(assessment._id)}
                              className="text-2xl font-bold cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="text-center p-2">
                          <div
                            className="flex justify-center cursor-pointer"
                            onClick={() => {
                              toggleAssessmentActionMore(assessment._id);
                            }}
                          >
                            <FiMoreHorizontal className="text-2xl" />
                          </div>
                          {assessment._id === assessmentActionViewMore && (
                            <div className="absolute z-20 w-28 bg-white p-2 shadow-lg border border-gray-200 rounded-sm ">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() =>
                                    onClickViewButtonOfScheduledAssessment(
                                      assessment
                                    )
                                  }
                                  className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                  View
                                </button>

                                {assessment.expiryAt &&
                                  isNotExpired(assessment.expiryAt) ? (
                                  assessment.status !== "cancelled" && <button
                                    onClick={() =>
                                      onClickShareScheduledAssessment(
                                        assessment._id
                                      )
                                    }
                                    className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                  >
                                    {isScheduledAssessmentSharing
                                      ? "Sharing..."
                                      : "Share"}
                                  </button>
                                ) : (
                                  <button className="py-2 px-4 text-red-500 text-sm bg-gray-100 rounded-md">
                                    Expired
                                  </button>
                                )}

                                {assessment.status !== "completed" &&
                                  assessment.status !== "cancelled" && (
                                    <button
                                      onClick={() =>
                                        toggleScheduleAssessmentActionCancel(
                                          assessment._id
                                        )
                                      }
                                      className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                    >
                                      Cancel
                                    </button>
                                  )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                      {assessment._id === selectedAssessment && (
                        <tr className="border-collapse">
                          <td colSpan="6" className="">
                            <div className="mx-10 max-h-[400px] overflow-auto">
                              <table className="w-full rounded-sm border border-[#8080808f]">
                                <thead className="z-10 border-collapse sticky top-0 bg-white border border-[#8080808f]">
                                  <tr className="border-collapse">
                                    <th className="p-1 text-md text-[#227a8a] font-semibold text-center">
                                      Candidate Name
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Status
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Expiry At
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Started At
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Ended At
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Progress
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                      Total Score
                                    </th>
                                    <th className="p-1 text-md text-[#227a8a]  font-semibold text-center bg-white">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {candidateAssessmentData[assessment._id]
                                    .length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan="8"
                                        className="text-center p-2"
                                      >
                                        No candidate data available
                                      </td>
                                    </tr>
                                  ) : (
                                    candidateAssessmentData[assessment._id].map(
                                      (candidateAssessment, index) => (
                                        <tr
                                          key={index}
                                          className="border-b border-[#8080808f] border-collapse"
                                        >
                                          <td className="text-center p-2 ">
                                            {
                                              candidateAssessment.candidateId
                                                .FirstName
                                            }
                                          </td>
                                          <td className="text-center  p-2">
                                            {candidateAssessment.status}
                                          </td>

                                          <td className="text-center p-2">
                                            {candidateAssessment.expiryAt &&
                                              !isNaN(
                                                new Date(
                                                  candidateAssessment.expiryAt
                                                )
                                              )
                                              ? new Intl.DateTimeFormat(
                                                "en-GB",
                                                {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                }
                                              )
                                                .format(
                                                  new Date(
                                                    candidateAssessment.expiryAt
                                                  )
                                                )
                                                .replace("am", "AM")
                                                .replace("pm", "PM")
                                              : "Invalid Date"}
                                          </td>
                                          <td className="text-center  p-2">
                                            {candidateAssessment.startedAt ? (
                                              new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                              })
                                                .format(
                                                  new Date(
                                                    candidateAssessment.startedAt
                                                  )
                                                )
                                                .replace(/\bam\b/, "AM")
                                                .replace(/\bpm\b/, "PM")
                                            ) : (
                                              <p className="text-[gray]">
                                                Yet to start
                                              </p>
                                            )}
                                          </td>
                                          <td className="text-center  p-2">
                                            {candidateAssessment.endedAT
                                              ? new Intl.DateTimeFormat(
                                                "en-GB",
                                                {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                }
                                              )
                                                .format(
                                                  new Date(
                                                    candidateAssessment.endedAt
                                                  )
                                                )
                                                .replace("am", "AM")
                                                .replace("pm", "PM")
                                              : "-"}
                                          </td>
                                          <td className="text-center  p-2">
                                            {candidateAssessment.progress}
                                          </td>
                                          <td className="text-center  p-2">
                                            {candidateAssessment.totalScore}
                                          </td>
                                          <td className="relative text-center p-2 ">
                                            <div className=" flex justify-center items-center cursor-pointer">
                                              <button
                                                onClick={() =>
                                                  toggleAction(
                                                    candidateAssessment._id
                                                  )
                                                }
                                              >
                                                <FiMoreHorizontal className="text-2xl text-gray-600 hover:text-gray-800" />
                                              </button>
                                              {/* {actionViewMore ===
                                                candidateAssessment._id && (
                                                <div className="   flex flex-col gap-2 absolute top-5 right-1 z-20 w-28 bg-white p-2 shadow-lg border border-gray-200 rounded-sm ">
                                                  <button
                                                    onClick={() =>
                                                      toggleAction(
                                                        candidateAssessment._id
                                                      )
                                                    }
                                                    className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                  >
                                                    View
                                                  </button>

                                                  {candidateAssessment.status !==
                                                    "expired" &&
                                                  candidateAssessment.status !==
                                                    "cancelled" &&
                                                  isNotExpired(
                                                    candidateAssessment.expiryAt,
                                                    "parent",
                                                    candidateAssessment._id
                                                  ) &&
                                                  isNotExpired(
                                                    assessment.expiryAt,
                                                    "child",
                                                    assessment._id
                                                  ) ? (
                                                    candidateAssessment.status !==
                                                      "completed" && (
                                                      <button
                                                        className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                        onClick={() =>
                                                          onClickShareScheduledAssessmentIndividualCandidate(
                                                            assessment._id,
                                                            candidateAssessment
                                                              .candidateId._id
                                                          )
                                                        }
                                                      >
                                                        {isCandidateSharing
                                                          ? "Sharing..."
                                                          : "Share"}
                                                      </button>
                                                    )
                                                  ) : candidateAssessment.status !=="cancelled" && (
                                                    <button className="py-2 px-4 text-red-500 text-sm bg-gray-100 rounded-md">
                                                      Expired
                                                    </button>
                                                  )}

                                                  {candidateAssessment.status !==
                                                    "completed" &&
                                                    candidateAssessment.status !==
                                                      "cancelled" && (
                                                      <button
                                                        onClick={() =>
                                                          toggleCandidateAssessmentActionCancel(
                                                            candidateAssessment._id
                                                          )
                                                        }
                                                        className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                                      >
                                                        Cancel
                                                      </button>
                                                    )}
                                                </div>
                                              )} */}
                                            </div>
                                            {actionViewMore ===
                                              candidateAssessment._id && (
                                                <div className="   flex flex-col gap-2 fixed   right-1 z-20 w-28 bg-white p-2 shadow-lg border border-gray-200 rounded-sm ">
                                                  <button
                                                    onClick={() =>
                                                      toggleAction(
                                                        candidateAssessment._id
                                                      )
                                                    }
                                                    className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                  >
                                                    View
                                                  </button>

                                                  {candidateAssessment.status !==
                                                    "expired" &&
                                                    candidateAssessment.status !==
                                                    "cancelled" &&
                                                    isNotExpired(
                                                      candidateAssessment.expiryAt,
                                                      "parent",
                                                      candidateAssessment._id
                                                    ) &&
                                                    isNotExpired(
                                                      assessment.expiryAt,
                                                      "child",
                                                      assessment._id
                                                    ) ? (
                                                    candidateAssessment.status !==
                                                    "completed" && (
                                                      <button
                                                        className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                        onClick={() =>
                                                          onClickShareScheduledAssessmentIndividualCandidate(
                                                            assessment._id,
                                                            candidateAssessment
                                                              .candidateId._id
                                                          )
                                                        }
                                                      >
                                                        {isCandidateSharing
                                                          ? "Sharing..."
                                                          : "Share"}
                                                      </button>
                                                    )
                                                  ) : candidateAssessment.status !== "cancelled" && (
                                                    <button className="py-2 px-4 text-red-500 text-sm bg-gray-100 rounded-md">
                                                      Expired
                                                    </button>
                                                  )}

                                                  {candidateAssessment.status !==
                                                    "completed" &&
                                                    candidateAssessment.status !==
                                                    "cancelled" && (
                                                      <button
                                                        onClick={() =>
                                                          toggleCandidateAssessmentActionCancel(
                                                            candidateAssessment._id
                                                          )
                                                        }
                                                        className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                                      >
                                                        Cancel
                                                      </button>
                                                    )}
                                                </div>
                                              )}
                                          </td>
                                        </tr>
                                      )
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed top-0 right-0 bg-black  bg-opacity-50 flex items-center justify-end z-[999] w-1/2 h-full">
          <div className=" w-full flex justify-center h-full items-center">
            <span className="bg-white p-4  rounded shadow-lg">
              Sending email...
            </span>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg">
            Email sent successfully!
          </div>
        </div>
      )}

      {showSharePopup && (
        <div className="fixed z-50  inset-0 top-0 right-0 left-0 h-full bg-[#8080805c] flex justify-end">
          <div className="w-1/2 bg-white ">
            <div className="bg-[#227a8a] px-8 py-4 ">
              <div className="flex justify-between items-center text-white">
                <h2>New Scheduled Assessment</h2>
                <button
                  className="text-lg"
                  onClick={() => setShowSharePopup(false)}
                >
                  <IoIosCloseCircleOutline className="text-lg" />
                </button>
              </div>
            </div>
            <div
              className="grid grid-cols-[20%_70%] justify-between mb-5 relative px-8 py-16"
              ref={candidateRef}
            >
              <div>
                <label
                  htmlFor="Candidate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Select Candidates <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow ">
                <div
                  className={`border-b focus:border-black focus:outline-none mb-5 w-full h-auto flex items-start flex-wrap ${errors.Candidate ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  {selectedCandidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="bg-slate-200 rounded-lg flex px-1 py-1 mr-1 mb-1 text-xs"
                    >
                      {candidate.LastName}
                      <button
                        onClick={() => handleCandidateRemove(candidate._id)}
                        className="ml-1 bg-slate-300 rounded px-2"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    id="Candidate"
                    className="border-none focus:outline-none flex-grow min-w-[100px]"
                    value={candidateInput}
                    onChange={handleCandidateInputChange}
                    onClick={() => {
                      setShowCandidatesDropdown(!showCandidatesDropDown);
                      if (!candidateInput) {
                        setFilteredCandidates(candidateData);
                      }
                    }}
                    autoComplete="off"
                  />
                  {errors.Candidate && (
                    <p className="text-red-500 text-sm absolute mt-7">
                      {errors.Candidate}
                    </p>
                  )}
                  {selectedCandidates.length > 0 && (
                    <button
                      onClick={handleClearAllCandidates}
                      className="text-gray-500 text-lg cursor-pointer top-0 right-0 mt-1"
                    >
                      X
                    </button>
                  )}
                  <div className="absolute right-10">
                    <MdArrowDropDown
                      onClick={handleDropdownToggle}
                      className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Dropdown */}
                {showCandidatesDropDown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-30 -mt-5 w-full rounded-md bg-white shadow-lg"
                  >
                    <p className="p-1 font-medium">Recent Candidates</p>
                    <ul className="">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.slice(0, 4).map((candidate) => (
                          // filteredCandidates.map((candidate) => (
                          <li
                            key={candidate._id}
                            className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                            onClick={() => handleCandidateSelect(candidate)}
                          >
                            {candidate.LastName}
                          </li>
                        ))
                      ) : (
                        <li className="bg-white border-b cursor-pointer p-1">
                          No matching candidates found
                        </li>
                      )}
                      <li
                        className="flex bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                        onClick={handleAddNewCandidateClick}
                      >
                        <IoIosAddCircle className="text-2xl" />
                        <span>Add New Candidate</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="fixed bottom-0 right-0 w-1/2 border-t flex justify-end  p-2 cursor-pointer">
              <div className="py-2 px-4 text-white rounded-md flex gap-4">
                <button
                  className="py-1 px-4 border border-[#227a8a] text-[#227a8a]  rounded-sm "
                  onClick={() => setShowSharePopup(false)}
                >
                  Cancel
                </button>
                <button
                  className="py-2 px-4 bg-custom-blue text-white rounded-sm "
                  onClick={handleShareClick}
                >
                  share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduledAssessmentTab;
