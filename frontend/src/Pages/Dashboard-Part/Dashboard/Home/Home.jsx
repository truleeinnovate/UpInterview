// /* eslint-disable no-unused-vars */
// import { NavLink, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";

// // import axios from "axios";
// import React from 'react';
// import "./Home.scss";
// import AppViewMore from "./AppViewMore.jsx";
// // import CandidateProfileDetails from "../Tabs/Candidate-Tab/CandidateProfileDetails.js";
// // import PositionProfileDetails from "../Tabs/Position-Tab/PositionProfileDetails";
// // import TeamProfileDetails from "../Tabs/Team-Tab/TeamProfileDetails";
// // import Internalprofiledetails from "../Tabs/Interviews/Internalprofiledetails";
// // import { fetchMultipleData } from "../../../utils/dataUtils";
// // import { fetchFilterData } from '../../../utils/dataUtils';
// import { Bar } from 'react-chartjs-2';
// import { parse, isValid } from 'date-fns';
// import maleImage from '../../Dashboard-Part/Images/man.png';
// import femaleImage from '../../Dashboard-Part/Images/woman.png';
// import genderlessImage from '../../Dashboard-Part/Images/transgender.png';
// import { useRef } from "react";
// import Sidebar from "../Dashboard/NewInterviewRequest.jsx";
// import Cookies from "js-cookie";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// import { ReactComponent as LuFilter } from '../../../icons/LuFilter.svg';
// import { ReactComponent as FcBusinessman } from '../../../icons/FcBusinessman.svg';
// import { ReactComponent as IoMdLaptop } from '../../../icons/IoMdLaptop.svg';
// import { ReactComponent as FaBook } from '../../../icons/FaBook.svg';
// import { ReactComponent as BsQuestionCircle } from '../../../icons/BsQuestionCircle.svg';
// import { ReactComponent as IoIosPerson } from '../../../icons/IoIosPerson.svg';
// import { ReactComponent as GoOrganization } from '../../../icons/GoOrganization.svg';
// import { ReactComponent as RiTeamFill } from '../../../icons/RiTeamFill.svg';
// import { ReactComponent as SiGoogleanalytics } from '../../../icons/SiGoogleanalytics.svg';
// import { ReactComponent as ImProfile } from '../../../icons/ImProfile.svg';
// import { ReactComponent as FiMoreHorizontal } from '../../../icons/FiMoreHorizontal.svg';
// import { ReactComponent as MdMoreVert } from '../../../icons/MdMoreVert.svg';
// import { ReactComponent as MdOutlineContactPage } from '../../../icons/MdOutlineContactPage.svg';
// import { ReactComponent as FaBuildingUser } from '../../../icons/FaBuildingUser.svg';
// import { ReactComponent as BsBuildingCheck } from '../../../icons/BsBuildingCheck.svg';
// import { ReactComponent as MdOutlineSchedule } from '../../../icons/MdOutlineSchedule.svg';
// import { ReactComponent as FaArrowRightSvg } from '../../../icons/FaArrowRight.svg';
// // import { usePermissions } from "../../../Context/PermissionsContext.js";
// import { setAuthCookies } from '../../../utils/AuthCookieManager/AuthCookieManager.jsx';
// import { useCustomContext } from "../../../Context/Contextfetch.js";
// import NotificationSection from "../Dashboard/NotificationTab/NotificationsSection.jsx"

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const Home = () => {

//   const {
//     interviewData,
//     fetchInterviewData,
//     //loading,
//   } = useCustomContext();
//   console.log("Interview Data:", interviewData);
//   console.log("Home");

//   // Add a function to manually fetch interview data
//   const handleRefreshInterviewData = () => {
//     console.log("Manually refreshing interview data...");
//     fetchInterviewData();
//   };

//   // Use only the real interview data
//   const effectiveInterviewData = interviewData;

//   // Debug interview data structure
//   useEffect(() => {
//     console.log("=== DEBUG INTERVIEW DATA ===");
//     if (effectiveInterviewData && effectiveInterviewData.length > 0) {
//       console.log("Rounds in first interview:", effectiveInterviewData[0].rounds);
//       console.log("All interview rounds:", effectiveInterviewData.map(interview => interview.rounds));
//     }
//   }, [effectiveInterviewData]);

//   // Extract rounds data from interviewData
//   useEffect(() => {
//     if (effectiveInterviewData && effectiveInterviewData.length > 0) {
//       console.log("Processing interview data for rounds");
//       const rounds = {};

//       // First, let's log a sample interview to see its structure
//       console.log("Sample interview structure:", effectiveInterviewData[0]);

//       effectiveInterviewData.forEach((interview, index) => {
//         console.log(`Processing interview ${index}:`, interview._id);

//         // Check if rounds exists directly in the interview object
//         if (interview.rounds && Array.isArray(interview.rounds)) {
//           console.log(`Interview ${index} has ${interview.rounds.length} rounds`);

//           // Store rounds directly in the interview object for easy access
//           interview.rounds.forEach((round, roundIndex) => {
//             console.log(`Round ${roundIndex} in interview ${index}:`, round);

//             // Generate a unique key for this round
//             const roundKey = `${interview._id}_${roundIndex}`;

//             // Debug the round and interview data
//             console.log('Round data:', round);
//             console.log('Interview position:', interview.Position);
//             console.log('Interview positionId:', interview.positionId);
//             console.log('Interviewers:', round.interviewers);

//             // Store the round with additional interview context
//             rounds[roundKey] = {
//               id: roundKey,
//               roundObject: round, // Store the original round object
//               dateTime: round.dateTime || interview.DateTime || "No date available",
//               interviewTitle: interview.Title || "Interview",
//               roundTitle: round.roundTitle || "", // Add roundTitle from the round object
//               interviewId: interview._id,
//               candidateName: interview.Candidate,
//               position: interview.positionId && typeof interview.positionId === 'object' ?
//                 interview.positionId.title : interview.Position,
//               roundIndex: roundIndex,
//               interviewers: round.interviewers,
//               status: round.status || interview.Status || "Pending" // Add the status field
//             };

//             // Debug the round status
//             console.log(`Adding round ${roundKey} with status:`, round.status);

//             // Also store a reference to this round in the interview object
//             if (!interview.roundKeys) {
//               interview.roundKeys = [];
//             }
//             interview.roundKeys.push(roundKey);
//           });
//         } else {
//           console.log(`Interview ${index} has no rounds or rounds is not an array`);
//         }
//       });

//       console.log("Final rounds data:", rounds);
//       setRoundsData(rounds);

//       // We don't need to update the interviewData state since we're modifying the objects directly
//       // The roundKeys have been added to each interview object in-place
//     }
//   }, [effectiveInterviewData]);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get('token');

//     if (token) {
//       console.log("Setting auth cookie on new domain...");
//       setAuthCookies(token);
//     }
//   }, []);
//   const freelancer = Cookies.get("freelancer");
//   // const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();


//   const apps = [
//     {
//       to: "/internalinterview",
//       icon: <FcBusinessman className="text-4xl" />,
//       title: "Internal Interviews",
//       description: "Internal interviews are conducted by internal team members",
//     },
//     {
//       to: "/outsourceinterview",
//       icon: <IoMdLaptop className="text-4xl" />,
//       title: "Outsource Interviews",
//       description: "Outsource interviews are conducted by external interviewers.",
//     },
//     {
//       to: "/assessment",
//       icon: <FaBook className="text-4xl" />,
//       title: "Assessments",
//       description: "Simplify evaluations with our user-friendly assessment app.",
//     },
//     {
//       to: "/interview-question",
//       icon: <BsQuestionCircle className="text-4xl" />,
//       title: "Question Bank",
//       description: "Explore questions easily with our Question Bank app.",
//     },
//     {
//       to: "/candidates",
//       icon: <IoIosPerson className="text-4xl" />,
//       title: "Candidates",
//       description: "Manage candidates easily with our Candidates app.",
//     },
//     {
//       to: "/positions",
//       icon: <GoOrganization className="text-4xl" />,
//       title: "Positions",
//       description: "Organize positions efficiently with the Position app.",
//     },
//     {
//       to: "/team",
//       icon: <RiTeamFill className="text-4xl" />,
//       title: "Teams",
//       description: "Easily add team members with our Teams app.",
//     },
//     {
//       to: "/analytics",
//       icon: <SiGoogleanalytics className="text-4xl" />,
//       title: "Analytics",
//       description: "Explore data with our Analytics app.",
//     },
//     {
//       to: "",
//       icon: <ImProfile className="text-4xl" />,
//       title: "Profile",
//       description: "Manage profile easily with our profile app and add new profile easily"
//     },
//   ];

//   const [loading, setLoading] = useState(true);
//   const [candidateData, setCandidateData] = useState([]);
//   const [teamsData, setTeamsData] = useState([]);
//   //const [interviewData, setInterviewData] = useState([]);
//   const [skillsData, setSkillsData] = useState([]);
//   const [lastFetchedCandidates, setLastFetchedCandidates] = useState([]);
//   const [lastFetchedPositions, setLastFetchedPositions] = useState([]);
//   const [lastFetchedTeams, setLastFetchedTeams] = useState([]);
//   const [lastFetchedInterviews, setLastFetchedInterviews] = useState([]);
//   const [notificationsData, setNotificationsData] = useState([]);


//   const data = {
//     labels: ["1 Week", "2 Week", "3 Week", "4 Week"],
//     datasets: [
//       {
//         label: "Tasks",
//         data: [20, 25, 15, 20],
//         backgroundColor: "#F8D598",
//         borderColor: 'transparent',
//         borderWidth: 2.5,
//         barPercentage: 0.4,
//       },
//       {
//         label: "Meetings",
//         data: [25, 20, 20, 15],
//         backgroundColor: "#AAC2ED",
//         borderColor: 'transparent',
//         borderWidth: 2.5,
//         barPercentage: 0.4,
//       },
//       {
//         label: "Reports",
//         data: [20, 15, 25, 20],
//         backgroundColor: "#CEA0EB",
//         borderColor: 'transparent',
//         borderWidth: 2.5,
//         barPercentage: 0.4,
//       }
//     ]
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: 'Reports',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           stepSize: 10,
//         },
//       },
//       x: {
//         grid: {
//           display: false,
//         }
//       }
//     }
//   };

//   const [showAllInterviewsPopup, setShowAllInterviewsPopup] = useState(false);
//   const [roundsData, setRoundsData] = useState({});


//   // Improved date extraction function to handle various formats including DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM and DD-MM-YYYY HH:MM
//   const extractDate = (dateTimeStr) => {
//     console.log("Extracting date from:", dateTimeStr);
//     if (!dateTimeStr || dateTimeStr === "No date available") {
//       console.log("Invalid date string");
//       return null;
//     }

//     try {
//       // Split by space and take the first part which should be the date (DD-MM-YYYY)
//       const [date] = dateTimeStr.split(' ');
//       console.log("Date part:", date);

//       // Parse the date using the correct format
//       const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
//       console.log("Parsed date:", parsedDate);

//       if (!isValid(parsedDate)) {
//         console.log("Date parsing failed");
//         return null;
//       }

//       // Log the full date string to help with debugging
//       console.log("Full dateTime string:", dateTimeStr);
//       console.log("Successfully parsed date:", parsedDate.toISOString());

//       return parsedDate;
//     } catch (error) {
//       console.error("Error parsing date:", error);
//       return null;
//     }
//   };

//   // Improved time extraction function to handle the format: DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM
//   const extractTime = (dateTimeStr) => {
//     console.log("Extracting time from:", dateTimeStr);
//     if (!dateTimeStr || dateTimeStr === "No date available") {
//       console.log("Invalid time string");
//       return null;
//     }

//     try {
//       // Extract the time part (HH:MM AM/PM)
//       const parts = dateTimeStr.split(' ');
//       if (parts.length < 3) {
//         console.log("Time format incorrect");
//         return null;
//       }

//       const time = parts[1] + ' ' + parts[2];
//       console.log("Time part:", time);

//       // Parse the time
//       const parsedTime = parse(time, 'h:mm a', new Date());
//       console.log("Parsed time:", parsedTime);

//       if (!isValid(parsedTime)) {
//         console.log("Time parsing failed");
//         return null;
//       }

//       return parsedTime;
//     } catch (error) {
//       console.error("Error parsing time:", error);
//       return null;
//     }
//   };

//   // Display the date and time in a readable format
//   const displayDateTime = (dateTimeStr) => {
//     if (!dateTimeStr || dateTimeStr === "No date available") {
//       return "No date available";
//     }

//     // Just display the date and start time (before the dash)
//     const dashIndex = dateTimeStr.indexOf(' - ');
//     if (dashIndex > 0) {
//       return dateTimeStr.substring(0, dashIndex);
//     }

//     // If no dash, just return the original string
//     return dateTimeStr;
//   };

//   // Debug roundsData after it's populated
//   useEffect(() => {
//     console.log("=== DEBUG ROUNDS DATA ===");
//     console.log("roundsData keys:", Object.keys(roundsData));
//     console.log("roundsData full:", roundsData);
//   }, [roundsData]);

//   // Format date for comparison (returns a new Date object)
//   const formatDateForComparison = (date) => {
//     if (!date || !isValid(date)) {
//       console.log("Invalid date passed to formatDateForComparison:", date);
//       return null;
//     }

//     // Create a new date object with just the date part (no time)
//     const formattedDate = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       0,
//       0,
//       0,
//       0
//     );

//     console.log(`Formatting date: ${date.toISOString()} -> ${formattedDate.toISOString()}`);
//     return formattedDate;
//   };

//   // Get current date for comparison
//   const getCurrentDate = () => {
//     const now = new Date();
//     return new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate(),
//       now.getHours(),
//       now.getMinutes(),
//       0,
//       0
//     );
//   };

//   const sortedInterviews = effectiveInterviewData
//     .filter(interview => {
//       console.log("Filtering interview:", interview._id);

//       // Check if interview has roundKeys (added in our useEffect)
//       if (!interview.roundKeys || interview.roundKeys.length === 0) {
//         console.log("Interview has no round keys, skipping:", interview._id);
//         return false;
//       }

//       // Find a round with a valid date
//       let validRound = null;
//       let validRoundKey = null;

//       // Check all rounds for this interview to find one with a valid future date
//       for (const roundKey of interview.roundKeys) {
//         const round = roundsData[roundKey];
//         if (!round || !round.dateTime || round.dateTime === "No date available") continue;

//         console.log(`Checking round ${roundKey} with dateTime: ${round.dateTime}`);

//         const interviewDate = extractDate(round.dateTime);
//         if (!interviewDate) continue;

//         // Format dates for comparison
//         const formattedInterviewDate = formatDateForComparison(interviewDate);
//         const currentDate = getCurrentDate();

//         console.log("Formatted interview date:", formattedInterviewDate);
//         console.log("Current date:", currentDate);

//         // Get the current date and time
//         const now = new Date();
//         // Set to beginning of today for fair comparison
//         const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

//         // Compare the raw dates directly
//         const isCurrentOrFuture = interviewDate >= today;

//         console.log(`Raw date comparison: Interview date (${interviewDate.toISOString()}) >= Today (${today.toISOString()})? ${isCurrentOrFuture}`);

//         if (isCurrentOrFuture) {
//           console.log("Found future round:", roundKey);
//           validRound = round;
//           validRoundKey = roundKey;
//           break;
//         }
//       }

//       if (validRound) {
//         // Store the valid round key as the first one for this interview
//         // This ensures we use this round for display
//         if (interview.roundKeys[0] !== validRoundKey) {
//           const index = interview.roundKeys.indexOf(validRoundKey);
//           if (index > 0) {
//             // Move the valid round to the first position
//             interview.roundKeys.splice(index, 1);
//             interview.roundKeys.unshift(validRoundKey);
//           }
//         }
//         console.log("Interview has future round, including");
//         return true;
//       }

//       console.log("No future rounds found for interview, excluding");
//       return false;
//     })
//     .sort((a, b) => {
//       // Use roundKeys instead of rounds
//       const roundA = a.roundKeys && a.roundKeys.length > 0 ? roundsData[a.roundKeys[0]] : null;
//       const roundB = b.roundKeys && b.roundKeys.length > 0 ? roundsData[b.roundKeys[0]] : null;

//       if (!roundA || !roundB) return 0;

//       const dateA = extractDate(roundA.dateTime);
//       const dateB = extractDate(roundB.dateTime);

//       if (!dateA || !dateB) {
//         return 0;
//       }

//       const dateComparison = dateA - dateB;
//       if (dateComparison !== 0) {
//         return dateComparison;
//       }

//       const timeA = extractTime(roundA.dateTime);
//       const timeB = extractTime(roundB.dateTime);

//       if (!timeA || !timeB) {
//         return 0;
//       }

//       return timeA - timeB;
//     });

//   // Keep track of sorted interviews
//   useEffect(() => {
//     // Process sorted interviews if needed
//   }, [sortedInterviews]);

//   const [outsourceInterviews, setOutsourceInterviews] = useState([]);


//   // for candidate profile details
//   const [selectedCandidate, setSelectedCandidate] = useState(null);

//   const handleCandidateClick = (candidate) => {
//     // if (objectPermissions.candidate?.View) {
//     setSelectedCandidate(candidate);
//     // } else {
//     //   console.warn("Candidate data is not available or view permission is not available.");
//     // }
//   };

//   const handleCloseProfile = () => {
//     setSelectedCandidate(null);
//   };

//   // for position profile details
//   const [selectedPosition, setSelectedPosition] = useState(null);

//   const handlePositionClick = (position) => {
//     // if (objectPermissions.position?.View) {
//     setSelectedPosition(position);
//     // } else {
//     //   console.warn("Position data is not available or view permission is not available.");
//     // }
//   };

//   const handleClosePositionProfile = () => {
//     setSelectedPosition(null);
//   };

//   // for team profile details
//   const [selectedTeam, setSelectedTeam] = useState(null);

//   const handleTeamClick = (team) => {
//     // if (objectPermissions.team?.View) {
//     setSelectedTeam(team);
//     // } else {
//     //   console.warn("Team data is not available or view permission is not available.");
//     // }
//   };

//   const handleCloseTeamProfile = () => {
//     setSelectedTeam(null);
//   };

//   // for internal interviews profile details
//   const [selectedInterview, setSelectedInterview] = useState(null);


//   const handleInterviewClick = async (interview) => {
//     // if (objectPermissions.interviews?.View) {
//     setSelectedInterview(interview);
//     // }
//   };

//   const handleCloseInterviewProfile = () => {
//     setSelectedInterview(false);
//   };

//   const navigate = useNavigate();

//   // State for popup menus
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [isPopupOpenRequest, setIsPopupOpenRequest] = useState(false);
//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [showAllTasksModal, setShowAllTasksModal] = useState(false);
//   const [taskSearchQuery, setTaskSearchQuery] = useState('');
//   const [showTaskFilters, setShowTaskFilters] = useState(false);

//   const handleViewMoreClick = () => {
//     setIsPopupOpen(!isPopupOpen);
//   };

//   const handleViewMoreRequestClick = () => {
//     setIsPopupOpenRequest(!isPopupOpenRequest);
//   };

//   const handleViewButtonClick = () => {
//     setIsPopupOpen(false);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const closePopup = () => {
//     setOpenPopup(null);
//     setIsPopupUpcomingInterviewsOpen(false);
//     setIsPopupTasksOpen(false);
//     setShowAllInterviewsPopup(false);
//   };

//   const [isPopupNotificationOpen, setIsPopupNotificationOpen] = useState(false);

//   const handleMoreNotificationClick = () => {
//     setIsPopupNotificationOpen(!isPopupNotificationOpen);
//   };

//   const handleViewNotificationClick = () => {
//     setIsPopupNotificationOpen(false);
//     navigate("/notifications");
//   }

//   const [isPopupUpcomingInterviewsOpen, setIsPopupUpcomingInterviewsOpen] = useState(false);

//   const handleMoreUpcomingInterviewsClick = () => {
//     setIsPopupUpcomingInterviewsOpen(!isPopupUpcomingInterviewsOpen);
//   }

//   // Handle view all upcoming interviews button click
//   const handleViewUpcomingInterviewsButtonClick = () => {
//     setShowAllInterviewsPopup(true);
//     setIsPopupUpcomingInterviewsOpen(false);
//   };

//   // State for modal filters and search
//   const [modalFilterCriteria, setModalFilterCriteria] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showFilters, setShowFilters] = useState(false);


//   // All Upcoming Interviews Modal
//   const AllUpcomingInterviewsModal = () => {
//     if (!showAllInterviewsPopup) return null;

//     // Handle search input change
//     const handleSearchChange = (e) => {
//       const value = e.target.value;
//       setSearchQuery(value);
//     };

//     // Prevent form submission when Enter is pressed
//     const handleKeyDown = (e) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         e.stopPropagation();
//       }
//     };

//     // Toggle filter visibility
//     const handleFilterToggle = () => {
//       setShowFilters(!showFilters);
//     };

//     // Reset all filters and search
//     const resetFilters = () => {
//       setSearchQuery('');
//       setModalFilterCriteria('all');
//       setShowFilters(false);
//     };

//     // Get all upcoming rounds (same logic as in the dashboard, but without the limit)
//     const allUpcomingRounds = [];
//     const processedRoundKeys = new Set(); // Track processed rounds to avoid duplicates

//     // Process rounds directly from uniqueRoundKeys to avoid duplicates
//     // First, collect all unique round keys and their associated interviews
//     const roundKeyToInterview = new Map();

//     filteredInterviews.forEach(interview => {
//       if (interview.roundKeys && interview.roundKeys.length > 0) {
//         interview.roundKeys.forEach(roundKey => {
//           // Only store the first interview that references this round
//           if (!roundKeyToInterview.has(roundKey)) {
//             roundKeyToInterview.set(roundKey, interview);
//           }
//         });
//       }
//     });

//     // Process each unique round key only once
//     roundKeyToInterview.forEach((interview, roundKey) => {
//       // Skip if we've already processed this round (extra safety check)
//       if (processedRoundKeys.has(roundKey)) return;

//       const round = roundsData[roundKey];
//       if (!round) return;

//       const roundDate = extractDate(round.dateTime);
//       if (!roundDate) return;

//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

//       // Compare dates by components
//       const roundYear = roundDate.getFullYear();
//       const roundMonth = roundDate.getMonth();
//       const roundDay = roundDate.getDate();

//       const todayYear = today.getFullYear();
//       const todayMonth = today.getMonth();
//       const todayDay = today.getDate();

//       // Check if round is today or in the future
//       const isBeforeToday = (roundYear < todayYear) ||
//         (roundYear === todayYear && roundMonth < todayMonth) ||
//         (roundYear === todayYear && roundMonth === todayMonth && roundDay < todayDay);

//       if (!isBeforeToday) {
//         allUpcomingRounds.push({
//           round: round,
//           interview: interview,
//           date: roundDate,
//           roundKey: roundKey
//         });

//         // Mark this round as processed
//         processedRoundKeys.add(roundKey);
//       }
//     });

//     // Sort all rounds by date (earliest first)
//     allUpcomingRounds.sort((a, b) => a.date - b.date);

//     // Apply filters to the rounds
//     const filteredRounds = allUpcomingRounds.filter(item => {
//       const roundDate = item.date;
//       if (!roundDate) return false;

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       // Calculate start of this week (Sunday)
//       const startOfWeek = new Date(today);
//       startOfWeek.setDate(today.getDate() - today.getDay());

//       // Calculate end of this week (Saturday)
//       const endOfWeek = new Date(today);
//       endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
//       endOfWeek.setHours(23, 59, 59, 999);

//       // Calculate start of next week
//       const startOfNextWeek = new Date(startOfWeek);
//       startOfNextWeek.setDate(startOfWeek.getDate() + 7);

//       // Calculate end of next week
//       const endOfNextWeek = new Date(endOfWeek);
//       endOfNextWeek.setDate(endOfWeek.getDate() + 7);

//       // Get the first day of the current month
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//       // Get the last day of the current month
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);

//       // Apply date filter based on selected criteria
//       let passesDateFilter = true;
//       switch (modalFilterCriteria) {
//         case 'thisWeek':
//           passesDateFilter = roundDate >= startOfWeek && roundDate <= endOfWeek;
//           break;
//         case 'nextWeek':
//           passesDateFilter = roundDate >= startOfNextWeek && roundDate <= endOfNextWeek;
//           break;
//         case 'thisMonth':
//           passesDateFilter = roundDate >= startOfMonth && roundDate <= endOfMonth;
//           break;
//         case 'all':
//         default:
//           passesDateFilter = true;
//           break;
//       }

//       // Apply search query filter
//       let passesSearchFilter = true;
//       if (searchQuery.trim() !== '') {
//         const query = searchQuery.toLowerCase();
//         const { round, interview } = item;

//         // Search in round title
//         const roundTitle = round.roundTitle?.toLowerCase() || '';

//         // Search in candidate name
//         const candidateName =
//           (interview.candidate?.FirstName?.toLowerCase() || '') + ' ' +
//           (interview.candidate?.LastName?.toLowerCase() || '');

//         // Search in position title
//         const positionTitle = typeof interview.positionId === 'object' ?
//           (interview.positionId?.title?.toLowerCase() || '') :
//           (interview.Position?.toLowerCase() || '');

//         // Search in interviewers
//         const interviewers = round.interviewers && Array.isArray(round.interviewers) ?
//           round.interviewers.map(interviewer => {
//             if (typeof interviewer === 'object' && interviewer.name) {
//               return interviewer.name.toLowerCase();
//             } else if (typeof interviewer === 'string') {
//               return interviewer.toLowerCase();
//             }
//             return '';
//           }).join(' ') : '';

//         passesSearchFilter =
//           roundTitle.includes(query) ||
//           candidateName.includes(query) ||
//           positionTitle.includes(query) ||
//           interviewers.includes(query);
//       }

//       return passesDateFilter && passesSearchFilter;
//     });

//     // Function to handle filter changes in the modal
//     const handleModalFilterChange = (criteria) => {
//       setModalFilterCriteria(criteria);
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl max-h-[80vh] overflow-y-auto">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-[#217989]">All Upcoming Interviews</h2>
//             <button
//               onClick={() => setShowAllInterviewsPopup(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Search and Filters */}
//           <div className="mb-6">
//             <div className="flex flex-row items-stretch sm:items-center gap-4 mb-4">
//               <div className="relative flex-1">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search interviews..."
//                   value={searchQuery}
//                   onChange={handleSearchChange}
//                   onKeyDown={(e) => e.stopPropagation()}
//                   onClick={(e) => e.stopPropagation()}
//                   onFocus={(e) => e.stopPropagation()}
//                   autoFocus
//                   className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#217989]"
//                 />
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={handleFilterToggle}
//                   className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//                   </svg>
//                   <span className="text-sm text-gray-600">Filters</span>
//                   <svg xmlns="http://www.w3.org/2000/svg" className={`text-gray-500 transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={resetFilters}
//                   className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
//                   title="Reset Filters"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Filter buttons */}
//             <div className={`flex flex-wrap gap-2 transition-all duration-300 ${showFilters ? 'opacity-100 max-h-20 mb-4' : 'opacity-0 max-h-0 overflow-hidden'}`}>
//               <button
//                 className={`px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${modalFilterCriteria === 'all' ? 'bg-[#217989] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
//                 onClick={() => handleModalFilterChange('all')}
//               >
//                 All
//               </button>
//               <button
//                 className={`px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${modalFilterCriteria === 'thisWeek' ? 'bg-[#217989] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
//                 onClick={() => handleModalFilterChange('thisWeek')}
//               >
//                 This Week
//               </button>
//               <button
//                 className={`px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${modalFilterCriteria === 'nextWeek' ? 'bg-[#217989] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
//                 onClick={() => handleModalFilterChange('nextWeek')}
//               >
//                 Next Week
//               </button>
//               <button
//                 className={`px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${modalFilterCriteria === 'thisMonth' ? 'bg-[#217989] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
//                 onClick={() => handleModalFilterChange('thisMonth')}
//               >
//                 This Month
//               </button>
//             </div>
//           </div>

//           {filteredRounds.length === 0 ? (
//             <p className="text-center p-3">No upcoming interviews found for the selected filter.</p>
//           ) : (
//             <div className="grid sm:grid-cols-1 md:grid-cols-2 grid-cols-2 gap-4">
//               {filteredRounds.map((item, index) => {
//                 const { round, interview } = item;
//                 if (!round) return null;

//                 // Determine which status to use (prefer round.status if available)
//                 const statusToShow = round.status || interview.Status || 'Pending';

//                 // Set color based on status
//                 let statusTextColor;
//                 switch (statusToShow) {
//                   case 'Reschedule':
//                     statusTextColor = 'text-violet-500';
//                     break;
//                   case 'Scheduled':
//                     statusTextColor = 'text-yellow-300';
//                     break;
//                   case 'ScheduleCancel':
//                     statusTextColor = 'text-red-500';
//                     break;
//                   case 'Completed':
//                     statusTextColor = 'text-green-500';
//                     break;
//                   case 'Pending':
//                     statusTextColor = 'text-blue-500';
//                     break;
//                   default:
//                     statusTextColor = 'text-black';
//                 }

//                 return (
//                   <div key={index} className="border border-[#217989] bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                     {/* Header with date and status */}
//                     <div className="bg-gradient-to-r from-[#217989] to-[#2a96a8] px-4 py-2 flex justify-between items-center text-white">
//                       <div className="flex items-center space-x-2">
//                         <p className="text-sm font-medium">Scheduled: {displayDateTime(round.dateTime)}</p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusTextColor} bg-white`}>
//                         {statusToShow}
//                       </span>
//                     </div>

//                     {/* Content */}
//                     <div className="p-4">
//                       <div className="flex items-start space-x-4">
//                         {/* Candidate image with badge */}
//                         <div className="relative">
//                           {interview.candidate?.imageUrl ? (
//                             <img
//                               src={interview.candidate.imageUrl}
//                               alt="Candidate"
//                               className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]"
//                             />
//                           ) : (
//                             interview.candidate?.Gender === "Male" ? (
//                               <img src={maleImage} alt="Male Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                             ) : interview.candidate?.Gender === "Female" ? (
//                               <img src={femaleImage} alt="Female Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                             ) : (
//                               <img src={genderlessImage} alt="Other Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                             )
//                           )}
//                           <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full border-2 border-[#217989]">
//                             <img
//                               className="w-6 h-6 rounded-full"
//                               src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?semt=ais_hybrid"
//                               alt="Interviewer"
//                             />
//                           </div>
//                         </div>

//                         {/* Interview details */}
//                         <div className="flex-1">
//                           <h3 className="font-bold text-gray-800 text-lg mb-1">{round.roundTitle || 'Interview Round'}</h3>
//                           <div className="flex items-center text-gray-600 mb-1">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                             </svg>
//                             <span className="text-sm">{interview.positionId && typeof interview.positionId === 'object' ? interview.positionId.title : (interview.Position || 'No Position')}</span>
//                           </div>
//                           <div className="flex items-center text-gray-600">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                             </svg>
//                             <span className="text-sm truncate">
//                               {round.interviewers && Array.isArray(round.interviewers) && round.interviewers.length > 0 ?
//                                 round.interviewers.map(interviewer => {
//                                   if (typeof interviewer === 'object' && interviewer.name) {
//                                     return interviewer.name;
//                                   } else if (typeof interviewer === 'string') {
//                                     return interviewer;
//                                   }
//                                   return '';
//                                 }).filter(Boolean).join(', ') : 'None assigned'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const [isPopupOutsourceInterviewsOpen, setIsPopupOutsourceInterviewsOpen] = useState(false);

//   const handleMoreOutsourceInterviewsClick = () => {
//     setIsPopupOutsourceInterviewsOpen(!isPopupOutsourceInterviewsOpen);
//   };

//   const handleViewOutsourceInterviewsButtonClick = () => {
//     setIsPopupOutsourceInterviewsOpen(false);
//     navigate("/outsourceinterview");
//   };

//   const [isPopupTasksOpen, setIsPopupTasksOpen] = useState(false);



//   const [taskData, setTaskData] = useState([]);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`);
//         setTaskData(response.data);
//       } catch (error) {
//         console.error('Error fetching tasks:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTasks();
//   }, []);

//   // Helper function to get status color for tasks
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'New':
//         return 'bg-blue-100 text-blue-800';
//       case 'In Progress':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Completed':
//         return 'bg-green-100 text-green-800';
//       case 'No Response':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Handle adding a new task
//   const handleAddTaskClick = () => {
//     setShowTaskForm(true);
//   };

//   // Count the number of interviews for each status
//   const statusCounts = interviewData.reduce((acc, interview) => {
//     acc[interview.Status] = (acc[interview.Status] || 0) + 1;
//     return acc;
//   }, {});

//   // // Default to 0 if no records are found for a status
//   const noShowCount = statusCounts['No Show'] || 0;
//   const scheduledCount = statusCounts['Scheduled'] || 0;
//   const completedCount = statusCounts['Completed'] || 0;
//   const cancelledCount = statusCounts['ScheduleCancel'] || 0;



//   const [openPopup, setOpenPopup] = useState(null);

//   const handleFilterNotificationClick = () => {
//     setOpenPopup(openPopup === 'notification' ? null : 'notification');
//   };

//   const handleFilterUpcomingInterviewsClick = () => {
//     setOpenPopup(openPopup === 'upcomingInterviews' ? null : 'upcomingInterviews');
//   };

//   const handleFilterOutsourceInterviewsClick = () => {
//     setOpenPopup(openPopup === 'outsourceInterviews' ? null : 'outsourceInterviews');
//   };

//   const handleFilterTasksClick = () => {
//     setOpenPopup(openPopup === 'tasks' ? null : 'tasks');
//   };

//   const [filterCriteria, setFilterCriteria] = useState('all');

//   const handleFilterChange = (criteria) => {
//     setFilterCriteria(criteria);
//     setOpenPopup(null);
//   };

//   // This function is no longer needed as we're using getCurrentDate instead
//   // const getNewCurrentDate = () => new Date();

//   // First ensure we only have present and future interviews in sortedInterviews
//   const filteredInterviews = sortedInterviews.filter(interview => {
//     console.log("Filtering sorted interview:", interview._id);

//     // Use roundKeys instead of rounds
//     if (!interview.roundKeys || interview.roundKeys.length === 0) {
//       console.log("No round keys found for filtered interview");
//       return false;
//     }

//     const round = roundsData[interview.roundKeys[0]];
//     if (!round) {
//       console.log("No round data found for filtered interview");
//       return false;
//     }

//     if (!round.dateTime || round.dateTime === "No date available") {
//       console.log("No valid dateTime in round for filtered interview");
//       return false;
//     }

//     const interviewDate = extractDate(round.dateTime);
//     if (!interviewDate) {
//       console.log("Could not extract date from:", round.dateTime);
//       return false;
//     }

//     // IMPORTANT: First check if the date is present or future
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

//     // Compare dates by components to handle timezone issues
//     const interviewYear = interviewDate.getFullYear();
//     const interviewMonth = interviewDate.getMonth();
//     const interviewDay = interviewDate.getDate();

//     const todayYear = today.getFullYear();
//     const todayMonth = today.getMonth();
//     const todayDay = today.getDate();

//     // Calculate if the interview date is before today
//     // First check if the year is less than today's year
//     // If years are equal, check if month is less than today's month
//     // If years and months are equal, check if day is less than today's day
//     const isBeforeToday = (interviewYear < todayYear) ||
//       (interviewYear === todayYear && interviewMonth < todayMonth) ||
//       (interviewYear === todayYear && interviewMonth === todayMonth && interviewDay < todayDay);

//     // For debugging
//     console.log("Date comparison components:");
//     console.log("Interview: Year=", interviewYear, "Month=", interviewMonth, "Day=", interviewDay);
//     console.log("Today: Year=", todayYear, "Month=", todayMonth, "Day=", todayDay);
//     console.log("Is before today?", isBeforeToday);

//     console.log(`Formatted interview date: ${interviewDate.toISOString()}`);
//     console.log(`Current date: ${now.toISOString()}`);
//     console.log(`Raw date comparison: Interview date (${interviewDate.toISOString()}) >= Today (${today.toISOString()})? ${!isBeforeToday}`);

//     // Only include present and future dates
//     if (isBeforeToday) {
//       console.log(`EXCLUDING PAST DATE: Interview date ${interviewDate.toISOString()} is before today ${today.toISOString()}`);
//       return false;
//     }

//     console.log(`Found future round: ${interview.roundKeys[0]}`);

//     // Format date for consistent comparison
//     const formattedInterviewDate = formatDateForComparison(interviewDate);
//     if (!formattedInterviewDate) {
//       console.log("Could not format interview date for comparison");
//       return false;
//     }

//     console.log("Filter criteria:", filterCriteria);
//     // getCurrentDate is used directly in the case statements below

//     switch (filterCriteria) {
//       case 'all': {
//         // For 'all', we just return true to include all interviews
//         // We've already filtered out past interviews earlier
//         return true;
//       }
//       case 'today': {
//         // Get today's date
//         const today = new Date();

//         // Check if the interview date is today by comparing year, month, and day
//         const interviewYear = interviewDate.getFullYear();
//         const interviewMonth = interviewDate.getMonth();
//         const interviewDay = interviewDate.getDate();

//         const todayYear = today.getFullYear();
//         const todayMonth = today.getMonth();
//         const todayDay = today.getDate();

//         const isToday = interviewYear === todayYear &&
//           interviewMonth === todayMonth &&
//           interviewDay === todayDay;

//         // console.log("Checking if interview is today:");
//         // console.log("Interview date:", interviewDate.toISOString());
//         // console.log("Today's date:", today.toISOString());
//         // console.log("Interview components:", interviewYear, interviewMonth, interviewDay);
//         // console.log("Today components:", todayYear, todayMonth, todayDay);
//         // console.log("Is interview today?", isToday);

//         return isToday;
//       }
//       case 'tomorrow': {
//         // Get tomorrow's date
//         const today = new Date();
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);

//         // Check if the interview date is tomorrow by comparing year, month, and day
//         const interviewYear = interviewDate.getFullYear();
//         const interviewMonth = interviewDate.getMonth();
//         const interviewDay = interviewDate.getDate();

//         const tomorrowYear = tomorrow.getFullYear();
//         const tomorrowMonth = tomorrow.getMonth();
//         const tomorrowDay = tomorrow.getDate();

//         const isTomorrow = interviewYear === tomorrowYear &&
//           interviewMonth === tomorrowMonth &&
//           interviewDay === tomorrowDay;

//         // console.log("Checking if interview is tomorrow:");
//         // console.log("Interview date:", interviewDate.toISOString());
//         // console.log("Tomorrow's date:", tomorrow.toISOString());
//         // console.log("Interview components:", interviewYear, interviewMonth, interviewDay);
//         // console.log("Tomorrow components:", tomorrowYear, tomorrowMonth, tomorrowDay);
//         // console.log("Is interview tomorrow?", isTomorrow);

//         return isTomorrow;
//       }
//       case 'thisWeek': {
//         // Get today's date
//         const today = new Date();

//         // Calculate the start of the week (Sunday)
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(today.getDate() - today.getDay());
//         startOfWeek.setHours(0, 0, 0, 0);

//         // Calculate the end of the week (Saturday)
//         const endOfWeek = new Date(today);
//         endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
//         endOfWeek.setHours(23, 59, 59, 999);

//         // Format dates for comparison
//         const formattedStartOfWeek = formatDateForComparison(startOfWeek);
//         const formattedEndOfWeek = formatDateForComparison(endOfWeek);

//         // console.log("This week range:", formattedStartOfWeek, "to", formattedEndOfWeek);
//         // console.log("Formatted interview date:", formattedInterviewDate);

//         return formattedInterviewDate >= formattedStartOfWeek && formattedInterviewDate <= formattedEndOfWeek;
//       }
//       case 'nextWeek': {
//         // Get today's date
//         const today = new Date();

//         // Calculate the start of next week (next Sunday)
//         const startOfNextWeek = new Date(today);
//         startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()));
//         startOfNextWeek.setHours(0, 0, 0, 0);

//         // Calculate the end of next week (next Saturday)
//         const endOfNextWeek = new Date(today);
//         endOfNextWeek.setDate(today.getDate() + (13 - today.getDay()));
//         endOfNextWeek.setHours(23, 59, 59, 999);

//         // Format dates for comparison
//         const formattedStartOfNextWeek = formatDateForComparison(startOfNextWeek);
//         const formattedEndOfNextWeek = formatDateForComparison(endOfNextWeek);

//         // console.log("Next week range:", formattedStartOfNextWeek, "to", formattedEndOfNextWeek);
//         // console.log("Formatted interview date:", formattedInterviewDate);

//         return formattedInterviewDate >= formattedStartOfNextWeek && formattedInterviewDate <= formattedEndOfNextWeek;
//       }
//       case 'thisMonth': {
//         // Get today's date
//         const today = new Date();

//         // Calculate the start of the month
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

//         // Calculate the end of the month
//         const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

//         // Format dates for comparison
//         const formattedStartOfMonth = formatDateForComparison(startOfMonth);
//         const formattedEndOfMonth = formatDateForComparison(endOfMonth);

//         // console.log("This month range:", formattedStartOfMonth, "to", formattedEndOfMonth);
//         // console.log("Formatted interview date:", formattedInterviewDate);

//         return formattedInterviewDate >= formattedStartOfMonth && formattedInterviewDate <= formattedEndOfMonth;
//       }
//       default:
//         return true;
//     }
//   })
//     .sort((a, b) => {
//       // Use roundKeys instead of rounds
//       const roundA = a.roundKeys && a.roundKeys.length > 0 ? roundsData[a.roundKeys[0]] : null;
//       const roundB = b.roundKeys && b.roundKeys.length > 0 ? roundsData[b.roundKeys[0]] : null;

//       if (!roundA || !roundB) return 0;

//       const dateA = extractDate(roundA.dateTime);
//       const dateB = extractDate(roundB.dateTime);

//       if (!dateA || !dateB) {
//         return 0;
//       }

//       const dateComparison = dateA - dateB;
//       if (dateComparison !== 0) {
//         return dateComparison;
//       }

//       const timeA = extractTime(roundA.dateTime);
//       const timeB = extractTime(roundB.dateTime);

//       if (!timeA || !timeB) {
//         return 0;
//       }

//       return timeA - timeB;
//     });

//   // Debug filtered interviews
//   useEffect(() => {
//     // console.log("=== DEBUG FILTERED INTERVIEWS ===");
//     // console.log("filteredInterviews length:", filteredInterviews.length);
//     // console.log("filteredInterviews:", filteredInterviews);
//     // console.log("Using sample data:", interviewData.length === 0);
//   }, [filteredInterviews, filterCriteria, interviewData.length]);

//   const [outsourceFilterCriteria, setOutsourceFilterCriteria] = useState('all');

//   const handleOutsourceFilterChange = (criteria) => {
//     setOutsourceFilterCriteria(criteria);
//     setOpenPopup(null);
//   };

//   const filteredOutsourceInterviews = outsourceInterviews.filter(interview => {
//     const interviewDate = new Date(interview.createdAt);
//     const currentDate = new Date();

//     switch (outsourceFilterCriteria) {
//       case 'thisWeek':
//         const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
//         const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
//         return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
//       case 'nextWeek':
//         const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
//         const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
//         return interviewDate >= startOfNextWeek && interviewDate <= endOfNextWeek;
//       case 'thisMonth':
//         return interviewDate.getMonth() === currentDate.getMonth() && interviewDate.getFullYear() === currentDate.getFullYear();
//       default:
//         return true;
//     }
//   });

//   const [taskFilterCriteria, setTaskFilterCriteria] = useState('all');

//   const handleTaskFilterChange = (criteria) => {
//     setTaskFilterCriteria(criteria);
//     setOpenPopup(null);
//   };

//   const filteredTasks = taskData.filter(task => {
//     const taskDate = new Date(task.dueDate);
//     const currentDate = new Date();

//     switch (taskFilterCriteria) {
//       case 'thisWeek':
//         const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
//         const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
//         return taskDate >= startOfWeek && taskDate <= endOfWeek;
//       case 'nextWeek':
//         const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
//         const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
//         return taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
//       case 'thisMonth':
//         return taskDate.getMonth() === currentDate.getMonth() && taskDate.getFullYear() === currentDate.getFullYear();
//       default:
//         return true;
//     }
//   });

//   const [notificationFilterCriteria, setNotificationFilterCriteria] = useState('all');

//   const handleNotificationFilterChange = (criteria) => {
//     setNotificationFilterCriteria(criteria);
//     setOpenPopup(null);
//   };

//   const filteredNotifications = notificationsData.filter(notification => {
//     const notificationDate = new Date(notification.CreatedDate);
//     const currentDate = new Date();

//     switch (notificationFilterCriteria) {
//       case 'thisWeek':
//         const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
//         const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
//         return notificationDate >= startOfWeek && notificationDate <= endOfWeek;
//       case 'nextWeek':
//         const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
//         const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
//         return notificationDate >= startOfNextWeek && notificationDate <= endOfNextWeek;
//       case 'thisMonth':
//         return notificationDate.getMonth() === currentDate.getMonth() && notificationDate.getFullYear() === currentDate.getFullYear();
//       default:
//         return true;
//     }
//   });

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const handleClick = () => {
//     navigate("/newinterviewviewpage");
//   };

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const sidebarRef = useRef(null);
//   const handleOutsideClick = (event) => {
//     if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//       closeSidebar();
//     }
//   };

//   useEffect(() => {
//     if (sidebarOpen) {
//       document.addEventListener("mousedown", handleOutsideClick);
//     } else {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sidebarOpen]);

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//   };
//   return (

//     <>

//       <div className="lg:mx-auto lg:container xl:mx-auto xl:container 2xl:mx-auto 2xl:container mb-5 md:pt-7">
//         <div className="sm:py-0 sm:mx-0 md:mx-0">
//           {freelancer && (
//             <div className=" sm:mx-0 md:mx-0">
//               <div className="mb-5">
//                 <div className="py-3">
//                   <div className="flex justify-between items-center mb-2 mx-4">
//                     <p className="font-bold text-lg">New Interview Requests</p>
//                     <div className="flex items-center gap-2">
//                       <p><LuFilter /></p>
//                       <span className="cursor-pointer text-2xl" onClick={handleViewMoreRequestClick}><FiMoreHorizontal /></span>
//                     </div>
//                   </div>
//                   {isPopupOpenRequest && (
//                     <div className="absolute right-4 -mt-3 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <button
//                         onClick={handleClick}
//                         className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
//                       >
//                         View All
//                       </button>
//                     </div>
//                   )}
//                   <div className="border rounded-md p-3 mx-3 bg-[#F5F9FA]">
//                     <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-1 gap-4">
//                       {interviewData.slice(0, 4).map((interview, index) => (
//                         // eslint-disable-next-line react/jsx-key
//                         <div className="border bg-white shadow rounded-md p-2">
//                           <div className="flex items-center gap-4 text-sm">
//                             <div>
//                               <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
//                             </div>
//                             <div>
//                               <p className="cursor-pointer text-custom-blue">
//                                 Senior Java Developer
//                               </p>
//                               <p>30 Oct, 2024 . 10:00 AM</p>
//                               <p>Java, Node JS</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                 </div>
//               </div>
//               {sidebarOpen && (
//                 <div>
//                   <Sidebar onClose={closeSidebar} onOutsideClick={handleOutsideClick} />
//                 </div>
//               )}
//             </div>
//           )}
//           <div className="grid grid-cols-9 gap-4 mx-2 sm:mx-0 md:mx-0 sm:grid-cols-1 md:grid-cols-9 lg:grid-cols-9">
//             {/* left column */}
//             {/* <div className="col-span-2 hidden md:hidden sm:col-span-9 md:col-span-9 w-[94%] p-2 rounded-md">
//               <div className="flex justify-between items-center mb-2">
//                 <p className="font-bold text-lg">Tabs</p>
//                 <span className="cursor-pointer text-2xl" onClick={handleViewMoreClick}><MdMoreVert /></span>
//               </div>
//               {isPopupOpen && (
//                 <div className="absolute left-52 -mt-2 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                   <button
//                     onClick={handleViewButtonClick}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
//                   >
//                     View All
//                   </button>
//                 </div>
//               )}

//               <div className="grid grid-cols-1 gap-4">
//                 {apps.map((app, index) => (
//                   <div
//                     key={index}
//                     className="p-1 rounded-md shadow-md hover:shadow-lg border border-[#217989] flex flex-col bg-[#217989] bg-opacity-5"
//                   >
//                     <NavLink to={app.to} className="flex-grow">
//                       <div className="grid grid-cols-5 cursor-pointer gap-1 h-full">
//                         <div className="col-span-1 flex items-center px-2">
//                           {app.icon}
//                         </div>
//                         <div className="col-span-4 flex items-center">
//                           <div>
//                             <p className="text-sm font-bold text-black">{app.title}</p>
//                             <p className="text-sm text-black line-clamp-2">{app.description}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </NavLink>
//                   </div>
//                 ))}
//               </div>

             
//               <div className="border mt-9 rounded-md border-[#217989]">
//                 <div className="bg-[#217989] bg-opacity-5 p-2 rounded-md">
//                   <p className="mb-2 font-bold">Newly added</p>
//                   <div className="flex gap-5 mb-2 text-2xl">
//                     <div className="font-bold w-9"><MdOutlineContactPage /></div>
//                     <div className="text-sm">
//                       {loading ? (
//                         <p>Loading...</p>
//                       ) : (
//                         <>
//                           {candidateData.length > 0 && (
//                             <p className="cursor-pointer text-custom-blue" onClick={() => handleCandidateClick(candidateData[0])}>
//                               {candidateData[0].LastName}
//                             </p>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex gap-5 mb-2 text-2xl">
//                     <div className="font-bold w-9"><FaBuildingUser /></div>
//                     <div className="text-sm">
//                       {loading ? (
//                         <p>Loading...</p>
//                       ) : (
//                         <>
//                           {lastFetchedPositions.length > 0 && (
//                             <p className="cursor-pointer text-custom-blue" onClick={() => handlePositionClick(lastFetchedPositions[0])}>
//                               {lastFetchedPositions[0].title}
//                             </p>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex gap-5 mb-2 text-2xl">
//                     <div className="font-bold w-9"><BsBuildingCheck /></div>
//                     <div className="text-sm">
//                       {loading ? (
//                         <p>Loading...</p>
//                       ) : (
//                         <>
//                           {teamsData.length > 0 && (
//                             <p className="cursor-pointer text-custom-blue" onClick={() => handleTeamClick(teamsData[0])}>
//                               {teamsData[0].LastName}
//                             </p>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex gap-5 text-2xl">
//                     <div className="font-bold w-9"><MdOutlineSchedule /></div>
//                     <div className="text-sm">
//                       {loading ? (
//                         <p>Loading...</p>
//                       ) : (
//                         <>
//                           {interviewData.length > 0 && (
//                             <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interviewData[0])}>
//                               {interviewData[0].Candidate}
//                             </p>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div> */}

//             {/* Middle content */}
//             <div className="col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6 md:col-span-6 sm:col-span-1 space-y-4 px-6 sm:bg-white bg-[#217989] bg-opacity-5 h-auto sm:h-auto md:h-[200vh] lg:h-[200vh] -mt-4 pt-11 pb-12 -mb-8  sm:ml-0 -mr-1 sm:mr-0 w-full">

//               {/* for mobile view noshow, scheduled, completed, cancelled */}
//               <div className="flex justify-center">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:hidden xl:hidden 2xl:hidden">
//                   <div className="border rounded-md bg-[#F8D598] w-32">
//                     <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                     <p className="text-center mt-5 ml-7 text-4xl">{noShowCount}</p>
//                     <p className="text-center pb-3 text-lg">No Show</p>
//                   </div>
//                   <div className="border rounded-md bg-[#AAC2ED] w-32">
//                     <p className="text-2xl inline -ml-10 float-end mt-1"><MdMoreVert /></p>
//                     <p className="text-center mt-5 text-4xl">{scheduledCount}</p>
//                     <p className="text-center pb-3 text-lg">Scheduled</p>
//                   </div>
//                   <div className="border rounded-md bg-[#CEA0EB] w-32">
//                     <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                     <p className="text-center mt-5 ml-6 text-4xl">{completedCount}</p>
//                     <p className="text-center pb-3 text-lg">Completed</p>
//                   </div>
//                   <div className="border rounded-md bg-[#A0E2EC] w-32">
//                     <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                     <p className="text-center mt-5 ml-6 text-4xl">{cancelledCount}</p>
//                     <p className="text-center pb-3 text-lg">Cancelled</p>
//                   </div>

//                 </div>
//               </div>

//               {/* main status */}
//               <div className="flex justify-between sm:hidden md:hidden">
//                 <div className="border rounded-md bg-[#F8D598] w-32">
//                   <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                   <p className="text-center mt-5 ml-7 text-4xl">{noShowCount}</p>
//                   <p className="text-center pb-3 text-lg">No Show</p>
//                 </div>
//                 <div className="border rounded-md bg-[#AAC2ED] w-32">
//                   <p className="text-2xl inline -ml-10 float-end mt-1"><MdMoreVert /></p>
//                   <p className="text-center mt-5 text-4xl">{scheduledCount}</p>
//                   <p className="text-center pb-3 text-lg">Scheduled</p>
//                 </div>
//                 <div className="border rounded-md bg-[#CEA0EB] w-32">
//                   <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                   <p className="text-center mt-5 ml-6 text-4xl">{completedCount}</p>
//                   <p className="text-center pb-3 text-lg">Completed</p>
//                 </div>
//                 <div className="border rounded-md bg-[#A0E2EC] w-32">
//                   <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
//                   <p className="text-center mt-5 ml-6 text-4xl">{cancelledCount}</p>
//                   <p className="text-center pb-3 text-lg">Cancelled</p>
//                 </div>

//               </div>
//               {/* reports */}
//               <div className="container mx-auto mb-5">
//                 <div className="py-3 mx-2 sm:mx-0 md:mx-0">
//                   <h2 className="font-bold text-lg mb-2">Reports</h2>
//                   <Bar data={data} options={options} />
//                 </div>
//               </div>
//               {/* Interview Feedback */}
//               <div className="sm:hidden md:hidden">
//                 <p className="font-bold text-lg mb-2">Interview Feedback</p>
//                 <div className="flex justify-between">
//                   {sortedInterviews.slice(0, 3).map((interview, index) => {
//                     // Use roundKeys instead of rounds
//                     const round = interview.roundKeys && interview.roundKeys.length > 0 ?
//                       roundsData[interview.roundKeys[0]] : null;
//                     if (round) {
//                       const dateOnly = round.dateTime.split(' ')[0];

//                       // Debug round and interview status
//                       console.log(`Round ${interview.roundKeys[0]} status:`, round.status);
//                       console.log(`Interview ${interview._id} status:`, interview.Status);

//                       // Determine which status to use (prefer round.status if available)
//                       const statusToShow = round.status || interview.Status || 'Pending';

//                       // Set color based on status
//                       let statusTextColor;
//                       switch (statusToShow) {
//                         case 'Reschedule':
//                           statusTextColor = 'text-violet-500';
//                           break;
//                         case 'Scheduled':
//                           statusTextColor = 'text-yellow-300';
//                           break;
//                         case 'ScheduleCancel':
//                           statusTextColor = 'text-red-500';
//                           break;
//                         case 'Completed':
//                           statusTextColor = 'text-green-500';
//                           break;
//                         case 'Pending':
//                           statusTextColor = 'text-blue-500';
//                           break;
//                         default:
//                           statusTextColor = 'text-black';
//                       }

//                       return (
//                         <div key={index} className="border rounded-md border-[#217989] w-48 bg-white">
//                           <div className="flex justify-between border-b text-sm p-2">
//                             <p>{dateOnly}</p>
//                             <p className="font-semibold text-green-600">Completed</p>
//                           </div>
//                           <div className="flex flex-col items-center py-3">
//                             {interview.candidate?.imageUrl ? (
//                               <img
//                                 src={interview.candidate.imageUrl}
//                                 alt="Candidate"
//                                 className="w-12 h-12 rounded-full"
//                               />
//                             ) : (
//                               interview.candidate?.Gender === "Male" ? (
//                                 <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
//                               ) : interview.candidate?.Gender === "Female" ? (
//                                 <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
//                               ) : (
//                                 <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
//                               )
//                             )}
//                             <p className="text-center">{interview.Candidate}</p>
//                             <p className="text-center">{interview.Position}</p>
//                           </div>
//                           <div className="flex justify-between p-2">
//                             <button className="border rounded-md border-[#217989] px-2">MSG</button>
//                             <button className="border rounded-md border-[#217989] px-2">Email</button>
//                           </div>
//                         </div>
//                       );
//                     }
//                     return null;
//                   })}

//                 </div>
//               </div>
//               {/* notifications */}
//               <NotificationSection />
//             </div>

//             {/* Right column */}
//             <div className="col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 md:col-span-3 sm:col-span-1 sm:mt-8 md:mt-0 sm:mx-2 md:mx-0 p-2 rounded-md w-full">
//               {/* upcoming interviews */}
//               <div className="space-y-5 mb-10">
//                 <div className="flex justify-between p-1 items-center">
//                   <p className="font-bold text-md">Upcoming Interviews</p>
//                   <div className="cursor-pointer text-2xl flex items-center gap-1">
//                     {/* <p style={{ fontSize: "1.2rem" }} onClick={handleRefreshInterviewData} title="Refresh interview data"><FaSyncAlt /></p> */}
//                     <p style={{ fontSize: "1.2rem" }} onClick={handleFilterUpcomingInterviewsClick}><LuFilter /></p>
//                     <p onClick={handleMoreUpcomingInterviewsClick}><FiMoreHorizontal /></p>
//                   </div>
//                   {isPopupUpcomingInterviewsOpen && (
//                     <div className="absolute right-4 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <button
//                         onClick={handleViewUpcomingInterviewsButtonClick}
//                         className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
//                       >
//                         View All
//                       </button>
//                     </div>
//                   )}
//                   {openPopup === 'upcomingInterviews' && (
//                     <div className="absolute right-4 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('thisWeek')}>This Week</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('nextWeek')}>Next Week</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('thisMonth')}>This Month</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('all')}>All</button>
//                     </div>
//                   )}
//                 </div>

//                 {(() => {
//                   // If no interviews found
//                   if (filteredInterviews.length === 0) {
//                     return <p className="text-center p-3">No upcoming interviews found.</p>;
//                   }

//                   // Create a flat list of all upcoming rounds from all interviews
//                   const allUpcomingRounds = [];

//                   // Process each interview to extract all rounds
//                   filteredInterviews.forEach(interview => {
//                     if (!interview.roundKeys || interview.roundKeys.length === 0) return;

//                     // Process each round in this interview
//                     interview.roundKeys.forEach(roundKey => {
//                       const round = roundsData[roundKey];
//                       if (!round) return;

//                       // Check if the round date is in the present or future
//                       const roundDate = extractDate(round.dateTime);
//                       if (!roundDate) return;

//                       const now = new Date();
//                       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

//                       // Compare dates by components
//                       const roundYear = roundDate.getFullYear();
//                       const roundMonth = roundDate.getMonth();
//                       const roundDay = roundDate.getDate();

//                       const todayYear = today.getFullYear();
//                       const todayMonth = today.getMonth();
//                       const todayDay = today.getDate();

//                       // Check if round is today or in the future
//                       const isBeforeToday = (roundYear < todayYear) ||
//                         (roundYear === todayYear && roundMonth < todayMonth) ||
//                         (roundYear === todayYear && roundMonth === todayMonth && roundDay < todayDay);

//                       if (!isBeforeToday) {
//                         // Add this round to our list with its interview data
//                         allUpcomingRounds.push({
//                           round: round,
//                           interview: interview,
//                           date: roundDate
//                         });
//                       }
//                     });
//                   });

//                   // Sort all rounds by date (earliest first)
//                   allUpcomingRounds.sort((a, b) => a.date - b.date);

//                   console.log("All upcoming rounds:", allUpcomingRounds.length);

//                   // Display message if no rounds found
//                   if (allUpcomingRounds.length === 0) {
//                     return <p className="text-center p-3">No upcoming rounds found.</p>;
//                   }

//                   // Display the first 3 upcoming rounds
//                   return allUpcomingRounds.slice(0, 3).map((item, index) => {
//                     const { round, interview } = item;
//                     if (!round) return null;

//                     // Debug round and interview status
//                     console.log(`Round ${interview.roundKeys[0]} status:`, round.status);
//                     console.log(`Interview ${interview._id} status:`, interview.Status);

//                     // Determine which status to use (prefer round.status if available)
//                     const statusToShow = round.status || interview.Status || 'Pending';

//                     // Set color based on status
//                     let statusTextColor;
//                     switch (statusToShow) {
//                       case 'Reschedule':
//                         statusTextColor = 'text-violet-500';
//                         break;
//                       case 'Scheduled':
//                         statusTextColor = 'text-yellow-300';
//                         break;
//                       case 'ScheduleCancel':
//                         statusTextColor = 'text-red-500';
//                         break;
//                       case 'Completed':
//                         statusTextColor = 'text-green-500';
//                         break;
//                       case 'Pending':
//                         statusTextColor = 'text-blue-500';
//                         break;
//                       default:
//                         statusTextColor = 'text-black';
//                     }

//                     return (
//                       <div key={index} className="border border-[#217989] bg-white shadow-md rounded-lg mb-4 overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                         {/* Header with date and status */}
//                         <div className="bg-gradient-to-r from-[#217989] to-[#2a96a8] px-4 py-2 flex justify-between items-center text-white">
//                           <div className="flex items-center space-x-2">
//                             <p className="text-sm font-medium">Scheduled: {displayDateTime(round.dateTime)}</p>
//                           </div>
//                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusTextColor} bg-white`}>
//                             {statusToShow}
//                           </span>
//                         </div>

//                         {/* Content */}
//                         <div className="p-4">
//                           <div className="flex items-start space-x-4">
//                             {/* Candidate image with badge */}
//                             <div className="relative">
//                               {interview.candidate?.imageUrl ? (
//                                 <img
//                                   src={interview.candidate.imageUrl}
//                                   alt="Candidate"
//                                   className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]"
//                                 />
//                               ) : (
//                                 interview.candidate?.Gender === "Male" ? (
//                                   <img src={maleImage} alt="Male Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                                 ) : interview.candidate?.Gender === "Female" ? (
//                                   <img src={femaleImage} alt="Female Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                                 ) : (
//                                   <img src={genderlessImage} alt="Other Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#217989]" />
//                                 )
//                               )}
//                               <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full border-2 border-[#217989]">
//                                 <img
//                                   className="w-6 h-6 rounded-full"
//                                   src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?semt=ais_hybrid"
//                                   alt="Interviewer"
//                                 />
//                               </div>
//                             </div>

//                             {/* Interview details */}
//                             <div className="flex-1">
//                               <h3 className="font-bold text-gray-800 text-lg mb-1">{round.roundTitle || 'Interview Round'}</h3>
//                               <div className="flex items-center text-gray-600 mb-1">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                                 </svg>
//                                 <span className="text-sm">{interview.positionId && typeof interview.positionId === 'object' ? interview.positionId.title : (interview.Position || 'No Position')}</span>
//                               </div>
//                               <div className="flex items-center text-gray-600">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                                 </svg>
//                                 <span className="text-sm truncate">
//                                   {round.interviewers && Array.isArray(round.interviewers) && round.interviewers.length > 0 ?
//                                     round.interviewers.map(interviewer => {
//                                       if (typeof interviewer === 'object' && interviewer.name) {
//                                         return interviewer.name;
//                                       } else if (typeof interviewer === 'string') {
//                                         return interviewer;
//                                       }
//                                       return '';
//                                     }).filter(Boolean).join(', ') : 'None assigned'}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   });
//                 })()}

//               </div>
//               {/* Tasks */}
//               <div className="rounded-xl shadow-sm overflow-hidden bg-white mb-8 border border-gray-100">
//                 <div className="bg-gradient-to-r from-[#217989] to-[#2a8ea0] px-5 py-4 flex justify-between items-center">
//                   <h2 className="text-white font-semibold text-lg flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
//                       <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
//                     </svg>
//                     Tasks
//                   </h2>
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={handleFilterTasksClick}
//                       className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors duration-200"
//                       title="Filter Tasks"
//                     >
//                       <LuFilter className="text-lg" />
//                     </button>
//                   </div>
//                   {openPopup === 'tasks' && (
//                     <div className="absolute right-8 mt-32 bg-white rounded-lg shadow-xl z-10 border border-gray-100 overflow-hidden w-36 py-1">
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2 transition-colors" onClick={() => handleTaskFilterChange('thisWeek')}>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#217989]" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                         </svg>
//                         This Week
//                       </button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2 transition-colors" onClick={() => handleTaskFilterChange('nextWeek')}>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#217989]" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                         </svg>
//                         Next Week
//                       </button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2 transition-colors" onClick={() => handleTaskFilterChange('thisMonth')}>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#217989]" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
//                         </svg>
//                         This Month
//                       </button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2 transition-colors" onClick={() => handleTaskFilterChange('all')}>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#217989]" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
//                         </svg>
//                         All
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <div className="divide-y divide-gray-100">
//                   {loading ? (
//                     <div className="py-8 flex justify-center items-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217989]"></div>
//                     </div>
//                   ) : filteredTasks.length === 0 ? (
//                     <p className="text-center p-3">No tasks available.</p>
//                   ) : (
//                     filteredTasks.slice(0, 2).map((task, index) => (
//                       <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">

//                         <div className="flex justify-between items-center">
//                           <div className="flex gap-2 items-center mb-2">
//                             <h3 className="font-medium text-gray-800">{task.title}</h3>
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
//                               {task.status}
//                             </span>
//                           </div>
//                           <div className="flex items-center text-gray-600">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             {new Date(task.dueDate).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric',
//                               weekday: 'long'
//                             })}
//                           </div>
//                         </div>

//                         <div className="flex justify-between items-center mb-3 text-sm">
//                           <div className="flex items-center text-gray-600">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                             </svg>
//                             {task.assignedTo}
//                           </div>
//                         </div>
//                         <p className="text-md font-medium text-gray-500">
//                           Priority
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
//                             {task.priority}
//                           </span>
//                         </p>
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 {filteredTasks.length > 0 && (
//                   <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-center">
//                     <button
//                       onClick={() => navigate('/task')}
//                       className="text-sm text-[#217989] hover:text-[#1a5f6d] font-medium flex items-center gap-1"
//                     >
//                       View All Tasks
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {/* interviewers */}
//               <div className="space-y-5">
//                 <div className="flex justify-between p-1 -mb-2 items-center">
//                   <p className="font-bold text-md">Interviewers</p>
//                   <div className="cursor-pointer text-2xl flex items-center gap-1">
//                     <p style={{ fontSize: "1.2rem" }} onClick={handleFilterOutsourceInterviewsClick}><LuFilter /></p>
//                     <p onClick={handleMoreOutsourceInterviewsClick}><FiMoreHorizontal /></p>
//                   </div>
//                   {isPopupOutsourceInterviewsOpen && (
//                     <div className="absolute right-4 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <button
//                         onClick={handleViewOutsourceInterviewsButtonClick}
//                         className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
//                       >
//                         View All
//                       </button>
//                     </div>
//                   )}
//                   {openPopup === 'outsourceInterviews' && (
//                     <div className="absolute right-4 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('thisWeek')}>This Week</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('nextWeek')}>Next Week</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('thisMonth')}>This Month</button>
//                       <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('all')}>All</button>
//                     </div>
//                   )}
//                 </div>
//                 {loading ? (
//                   <p>Loading...</p>
//                 ) : filteredOutsourceInterviews.length === 0 ? (
//                   <p className="text-center p-3">No data found.</p>
//                 ) : (
//                   filteredOutsourceInterviews.slice(0, 3).map((interview, index) => (
//                     <div key={index} className="border border-[#217989] bg-[#217989] shadow rounded-md p-2 bg-opacity-5 mb-2">
//                       <div className="flex items-center gap-3 text-sm">
//                         <div>
//                           {interview.candidate?.imageUrl ? (
//                             <img
//                               src={interview.candidate.imageUrl}
//                               alt="Candidate"
//                               className="w-12 h-12 rounded-full"
//                             />
//                           ) : (
//                             interview.candidate?.Gender === "Male" ? (
//                               <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
//                             ) : interview.candidate?.Gender === "Female" ? (
//                               <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
//                             ) : (
//                               <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
//                             )
//                           )}
//                         </div>
//                         <div>
//                           <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interview)}>
//                             {interview.Candidate}
//                           </p>
//                           <p>{interview.Position}</p>
//                           <p>{new Date(interview.createdAt).toLocaleString()}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {/* Interview Feedback only in mobile view */}
//               <div className="lg:hidden xl:hidden 2xl:hidden sm:mx-[1px] sm:mt-8 sm:mb-12 md:mx-[1px] md:mt-8 md:mb-12">
//                 <p className="font-bold text-lg mb-5">Interview Feedback</p>
//                 <div className="sm:flex sm:justify-center md:flex md:justify-center">
//                   <div className="sm:space-y-5 md:grid md:grid-cols-2 md:gap-6">
//                     {sortedInterviews.slice(0, 2).map((interview, index) => {
//                       const round = roundsData[interview.rounds[0]];
//                       if (round) {
//                         const dateOnly = round.dateTime.split(' ')[0];
//                         let statusTextColor;
//                         switch (interview.Status) {
//                           case 'Reschedule':
//                             statusTextColor = 'text-violet-500';
//                             break;
//                           case 'Scheduled':
//                             statusTextColor = 'text-yellow-300';
//                             break;
//                           case 'ScheduleCancel':
//                             statusTextColor = 'text-red-500';
//                             break;
//                           default:
//                             statusTextColor = 'text-black';
//                         }

//                         return (
//                           <div key={index} className="border rounded-md border-[#217989] w-56 bg-white">
//                             <div className="flex justify-between border-b text-sm p-2">
//                               <p>{dateOnly}</p>
//                               <p className={`font-semibold ${statusTextColor}`}>{interview.Status}</p>
//                             </div>
//                             <div className="flex flex-col items-center py-3">
//                               {interview.candidate?.imageUrl ? (
//                                 <img
//                                   src={interview.candidate.imageUrl}
//                                   alt="Candidate"
//                                   className="w-12 h-12"
//                                 />
//                               ) : (
//                                 interview.candidate?.Gender === "Male" ? (
//                                   <img src={maleImage} alt="Male Avatar" className="w-12 h-12" />
//                                 ) : interview.candidate?.Gender === "Female" ? (
//                                   <img src={femaleImage} alt="Female Avatar" className="w-12 h-12" />
//                                 ) : (
//                                   <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12" />
//                                 )
//                               )}
//                               <p className="text-center">{interview.Candidate}</p>
//                               <p className="text-center">{interview.Position}</p>
//                             </div>
//                             <div className="flex justify-between p-2">
//                               <button className="border rounded-md border-[#217989] px-2">MSG</button>
//                               <button className="border rounded-md border-[#217989] px-2">Email</button>
//                             </div>
//                           </div>
//                         );
//                       }
//                       return null;
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>



//       <AppViewMore isModalOpen={isModalOpen} closeModal={closeModal} />

//       {/* Render the All Upcoming Interviews Modal when showAllInterviewsPopup is true */}
//       {showAllInterviewsPopup && <AllUpcomingInterviewsModal />}

//     </>
//   );
// };

// export default Home;


import { useState } from 'react';
import { TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
// import Header from './components/Header/Header';
import WelcomeSection from './WelcomeSection';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import InterviewRequests from './InterviewRequests';
import InterviewersList from './InterviewersList';
import FeedbackList from './FeedbackList';
import NotificationSection from "../NotificationTab/NotificationsSection"
import TaskList from './TaskList';
import InterviewerSchedule from './InterviewManagement/UpcomingInterviews';
// import { notificationsData } from './data/notifications';

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const chartData = [
    { name: 'Jan', interviews: 65 },
    { name: 'Feb', interviews: 85 },
    { name: 'Mar', interviews: 73 },
    { name: 'Apr', interviews: 92 },
    { name: 'May', interviews: 78 },
    { name: 'Jun', interviews: 95 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-white">
      <main className="sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          <WelcomeSection selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
        </motion.div>

        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-6 sm:gap-8 mt-6">
          {/* Main Content Area */}
          <div className="flex-grow space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <StatsCard
                  title="Total Interviews"
                  value="248"
                  change="+12%"
                  icon={TrendingUp}
                  color="indigo"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <StatsCard
                  title="Pending Feedback"
                  value="18"
                  icon={AlertCircle}
                  color="orange"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <StatsCard
                  title="Success Rate"
                  value="76%"
                  change="+8%"
                  icon={UserCheck}
                  color="green"
                />
              </motion.div>
            </div>

            <InterviewRequests />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnalyticsChart data={chartData} />
            </motion.div>

            <FeedbackList />
            <NotificationSection />
          </div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-[400px] xl:w-[400px] 2xl:w-[500px] flex-shrink-0 space-y-6 sm:space-y-8"
          >
            <TaskList />
            <InterviewerSchedule />
            <InterviewersList />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Home;