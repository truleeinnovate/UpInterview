import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// import axios from "axios";
import React from 'react';
import "./Home.scss";
import AppViewMore from "./AppViewMore.jsx";
// import CandidateProfileDetails from "../Tabs/Candidate-Tab/CandidateProfileDetails.js";
// import PositionProfileDetails from "../Tabs/Position-Tab/PositionProfileDetails";
// import TeamProfileDetails from "../Tabs/Team-Tab/TeamProfileDetails";
// import Internalprofiledetails from "../Tabs/Interviews/Internalprofiledetails";
// import { fetchMultipleData } from "../../../utils/dataUtils";
// import { fetchFilterData } from '../../../utils/dataUtils';
import { Bar } from 'react-chartjs-2';
import { parse, isValid } from 'date-fns';
import maleImage from '../../Dashboard-Part/Images/man.png';
import femaleImage from '../../Dashboard-Part/Images/woman.png';
import genderlessImage from '../../Dashboard-Part/Images/transgender.png';
import { useRef } from "react";
import Sidebar from "../Dashboard/NewInterviewRequest.jsx";
import Cookies from "js-cookie";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { ReactComponent as LuFilter } from '../../../icons/LuFilter.svg';
import { ReactComponent as FcBusinessman } from '../../../icons/FcBusinessman.svg';
import { ReactComponent as IoMdLaptop } from '../../../icons/IoMdLaptop.svg';
import { ReactComponent as FaBook } from '../../../icons/FaBook.svg';
import { ReactComponent as BsQuestionCircle } from '../../../icons/BsQuestionCircle.svg';
import { ReactComponent as IoIosPerson } from '../../../icons/IoIosPerson.svg';
import { ReactComponent as GoOrganization } from '../../../icons/GoOrganization.svg';
import { ReactComponent as RiTeamFill } from '../../../icons/RiTeamFill.svg';
import { ReactComponent as SiGoogleanalytics } from '../../../icons/SiGoogleanalytics.svg';
import { ReactComponent as ImProfile } from '../../../icons/ImProfile.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as MdMoreVert } from '../../../icons/MdMoreVert.svg';
import { ReactComponent as MdOutlineContactPage } from '../../../icons/MdOutlineContactPage.svg';
import { ReactComponent as FaBuildingUser } from '../../../icons/FaBuildingUser.svg';
import { ReactComponent as BsBuildingCheck } from '../../../icons/BsBuildingCheck.svg';
import { ReactComponent as MdOutlineSchedule } from '../../../icons/MdOutlineSchedule.svg';
import { ReactComponent as FaArrowRight } from '../../../icons/FaArrowRight.svg';
// import { usePermissions } from "../../../Context/PermissionsContext.js";
import { setAuthCookies } from '../../../utils/AuthCookieManager/AuthCookieManager.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Home = () => {

  console.log("Home");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      console.log("Setting auth cookie on new domain...");
      setAuthCookies(token);
    }
  }, []);
  const freelancer = Cookies.get("freelancer");
  // const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();


  const apps = [
    {
      to: "/internalinterview",
      icon: <FcBusinessman className="text-4xl" />,
      title: "Internal Interviews",
      description: "Internal interviews are conducted by internal team members",
    },
    {
      to: "/outsourceinterview",
      icon: <IoMdLaptop className="text-4xl" />,
      title: "Outsource Interviews",
      description: "Outsource interviews are conducted by external interviewers.",
    },
    {
      to: "/assessment",
      icon: <FaBook className="text-4xl" />,
      title: "Assessments",
      description: "Simplify evaluations with our user-friendly assessment app.",
    },
    {
      to: "/interview-question",
      icon: <BsQuestionCircle className="text-4xl" />,
      title: "Question Bank",
      description: "Explore questions easily with our Question Bank app.",
    },
    {
      to: "/candidates",
      icon: <IoIosPerson className="text-4xl" />,
      title: "Candidates",
      description: "Manage candidates easily with our Candidates app.",
    },
    {
      to: "/positions",
      icon: <GoOrganization className="text-4xl" />,
      title: "Positions",
      description: "Organize positions efficiently with the Position app.",
    },
    {
      to: "/team",
      icon: <RiTeamFill className="text-4xl" />,
      title: "Teams",
      description: "Easily add team members with our Teams app.",
    },
    {
      to: "/analytics",
      icon: <SiGoogleanalytics className="text-4xl" />,
      title: "Analytics",
      description: "Explore data with our Analytics app.",
    },
    {
      to: "",
      icon: <ImProfile className="text-4xl" />,
      title: "Profile",
      description: "Manage profile easily with our profile app and add new profile easily"
    },
  ];

  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [lastFetchedCandidates, setLastFetchedCandidates] = useState([]);
  const [lastFetchedPositions, setLastFetchedPositions] = useState([]);
  const [lastFetchedTeams, setLastFetchedTeams] = useState([]);
  const [lastFetchedInterviews, setLastFetchedInterviews] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const requests = [
  //         { endpoint: 'candidate', sharingPermissions: sharingPermissions.candidate },
  //         { endpoint: 'position', sharingPermissions: sharingPermissions.position },
  //         { endpoint: 'team', sharingPermissions: sharingPermissions.team },
  //         { endpoint: 'interview', sharingPermissions: sharingPermissions.interviews }
  //       ];

  //       const [candidates, positions, teams, interviews] = await fetchMultipleData(requests);

  //       const sortedCandidates = candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //       if (sortedCandidates.length > 0 && sortedCandidates[0].createdAt !== lastFetchedCandidates[0]?.createdAt) {
  //         setCandidateData(sortedCandidates);
  //         setLastFetchedCandidates(sortedCandidates);
  //       }

  //       const sortedPositions = positions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //       if (sortedPositions.length > 0 && sortedPositions[0].createdAt !== lastFetchedPositions[0]?.createdAt) {
  //         setSkillsData(sortedPositions);
  //         setLastFetchedPositions(sortedPositions);
  //       }

  //       const sortedTeams = teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //       if (sortedTeams.length > 0 && sortedTeams[0].createdAt !== lastFetchedTeams[0]?.createdAt) {
  //         setTeamsData(sortedTeams);
  //         setLastFetchedTeams(sortedTeams);
  //       }

  //       const sortedInterviews = interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //       if (sortedInterviews[0].createdAt !== lastFetchedInterviews[0]?.createdAt) {
  //         setInterviewData(sortedInterviews);
  //         setLastFetchedInterviews(sortedInterviews);
  //       }

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [sharingPermissions]);

  // useEffect(() => {
  //   const fetchNotificationData = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/notification`);
  //       setNotificationsData(response.data);
  //     } catch (error) {
  //       console.error("Error fetching notificationData:", error);
  //     }
  //   };
  //   fetchNotificationData();
  // }, []);

  const data = {
    labels: ["1 Week", "2 Week", "3 Week", "4 Week"],
    datasets: [
      {
        label: "Tasks",
        data: [20, 25, 15, 20],
        backgroundColor: "#F8D598",
        borderColor: 'transparent',
        borderWidth: 2.5,
        barPercentage: 0.4,
      },
      {
        label: "Meetings",
        data: [25, 20, 20, 15],
        backgroundColor: "#AAC2ED",
        borderColor: 'transparent',
        borderWidth: 2.5,
        barPercentage: 0.4,
      },
      {
        label: "Reports",
        data: [20, 15, 25, 20],
        backgroundColor: "#CEA0EB",
        borderColor: 'transparent',
        borderWidth: 2.5,
        barPercentage: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reports',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [roundsData, setRoundsData] = useState({});

  // const interviewPermissions = useMemo(() => sharingPermissionscontext.interviews || {}, [sharingPermissionscontext]);

  // useEffect(() => {
  //   const fetchRoundsData = async (roundIds) => {
  //     try {
  //       const response = await axios.post(`${process.env.REACT_APP_API_URL}/fetch-rounds`, { roundIds });
  //       setRoundsData(response.data);
  //     } catch (error) {
  //       console.error("Error fetching rounds data of interviews:", error);
  //     }
  //   };

  //   if (upcomingInterviews.length > 0) {
  //     const roundIds = upcomingInterviews.flatMap(interview => interview.rounds);
  //     fetchRoundsData(roundIds);
  //   }
  // }, [upcomingInterviews]);

  const extractDate = (dateTimeStr) => {
    const [date] = dateTimeStr.split(' ');
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : null;
  };

  const extractTime = (dateTimeStr) => {
    const time = dateTimeStr.split(' ')[1] + ' ' + dateTimeStr.split(' ')[2];
    const parsedTime = parse(time, 'h:mm a', new Date());
    return isValid(parsedTime) ? parsedTime : null;
  };

  const displayDateTime = (dateTimeStr) => {
    const [date, startTime, period] = dateTimeStr.split(' ');
    return `${date} ${startTime} ${period}`;
  };

  const sortedInterviews = upcomingInterviews
    .filter(interview => {
      const round = roundsData[interview.rounds[0]];
      if (!round) return false;

      const interviewDate = extractDate(round.dateTime);
      const interviewTime = extractTime(round.dateTime);
      const currentDate = new Date();

      if (interviewDate) {
        if (interviewDate > currentDate) {
          return true;
        } else if (interviewDate.toDateString() === currentDate.toDateString()) {
          return interviewTime && interviewTime > currentDate;
        }
      }
      return false;
    })
    .sort((a, b) => {
      const roundA = roundsData[a.rounds[0]];
      const roundB = roundsData[b.rounds[0]];

      const dateA = extractDate(roundA.dateTime);
      const dateB = extractDate(roundB.dateTime);

      if (!dateA || !dateB) {
        return 0;
      }

      const dateComparison = dateA - dateB;
      if (dateComparison !== 0) {
        return dateComparison;
      }

      const timeA = extractTime(roundA.dateTime);
      const timeB = extractTime(roundB.dateTime);

      if (!timeA || !timeB) {
        return 0;
      }

      return timeA - timeB;
    });

  const [outsourceInterviews, setOutsourceInterviews] = useState([]);


  // interviews in right content
  // useEffect(() => {
  //   const fetchInterviewData = async () => {
  //     setLoading(true);
  //     try {
  //       const allInterviews = await fetchFilterData('interview', interviewPermissions);

  //       const outsourceInterviews = allInterviews.filter(interview => interview.Interviewstype === '/outsourceinterview');

  //       const internalInterviewsWithCandidates = await Promise.all(allInterviews.map(async (interview) => {
  //         try {
  //           const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${interview.CandidateId}`);
  //           const candidate = candidateResponse.data;

  //           if (candidate.ImageData && candidate.ImageData.filename) {
  //             candidate.imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
  //           }

  //           return {
  //             ...interview,
  //             candidate,
  //           };
  //         } catch (error) {
  //           console.error(`Error fetching candidate for interview ${interview._id}:`, error);
  //           return {
  //             ...interview,
  //             candidate: null,
  //           };
  //         }
  //       }));

  //       const outsourceInterviewsWithCandidates = await Promise.all(outsourceInterviews.map(async (interview) => {
  //         try {
  //           const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${interview.CandidateId}`);
  //           const candidate = candidateResponse.data;

  //           if (candidate.ImageData && candidate.ImageData.filename) {
  //             candidate.imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
  //           }

  //           return {
  //             ...interview,
  //             candidate,
  //           };
  //         } catch (error) {
  //           console.error(`Error fetching candidate for interview ${interview._id}:`, error);
  //           return {
  //             ...interview,
  //             candidate: null,
  //           };
  //         }
  //       }));

  //       setUpcomingInterviews(internalInterviewsWithCandidates);
  //       setOutsourceInterviews(outsourceInterviewsWithCandidates);

  //       console.log(internalInterviewsWithCandidates, "internalInterviews");
  //       console.log(outsourceInterviewsWithCandidates, "outsourceInterviews");
  //     } catch (error) {
  //       console.error("Error fetching InterviewData:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchInterviewData();
  // }, [interviewPermissions]);

  // for candidate profile details
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateClick = (candidate) => {
    // if (objectPermissions.candidate?.View) {
    setSelectedCandidate(candidate);
    // } else {
    //   console.warn("Candidate data is not available or view permission is not available.");
    // }
  };

  const handleCloseProfile = () => {
    setSelectedCandidate(null);
  };

  // for position profile details
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handlePositionClick = (position) => {
    // if (objectPermissions.position?.View) {
    setSelectedPosition(position);
    // } else {
    //   console.warn("Position data is not available or view permission is not available.");
    // }
  };

  const handleClosePositionProfile = () => {
    setSelectedPosition(null);
  };

  // for team profile details
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleTeamClick = (team) => {
    // if (objectPermissions.team?.View) {
    setSelectedTeam(team);
    // } else {
    //   console.warn("Team data is not available or view permission is not available.");
    // }
  };

  const handleCloseTeamProfile = () => {
    setSelectedTeam(null);
  };

  // for internal interviews profile details
  const [selectedInterview, setSelectedInterview] = useState(null);


  const handleInterviewClick = async (interview) => {
    // if (objectPermissions.interviews?.View) {
    setSelectedInterview(interview);
    // }
  };

  const handleCloseInterviewProfile = () => {
    setSelectedInterview(false);
  };

  const navigate = useNavigate();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpenRequest, setIsPopupOpenRequest] = useState(false);
  const handleViewMoreClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleViewMoreRequestClick = () => {
    setIsPopupOpenRequest(!isPopupOpenRequest);
  };

  const handleViewButtonClick = () => {
    setIsPopupOpen(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const [isPopupNotificationOpen, setIsPopupNotificationOpen] = useState(false);

  const handleMoreNotificationClick = () => {
    setIsPopupNotificationOpen(!isPopupNotificationOpen);
  };

  const handleViewNotificationClick = () => {
    setIsPopupNotificationOpen(false);
    navigate("/notifications");
  }

  const [isPopupUpcomingInterviewsOpen, setIsPopupUpcomingInterviewsOpen] = useState(false);

  const handleMoreUpcomingInterviewsClick = () => {
    setIsPopupUpcomingInterviewsOpen(!isPopupUpcomingInterviewsOpen);
  };

  const handleViewUpcomingInterviewsButtonClick = () => {
    setIsPopupUpcomingInterviewsOpen(false);
    navigate("/internalinterview");
  };

  const [isPopupOutsourceInterviewsOpen, setIsPopupOutsourceInterviewsOpen] = useState(false);

  const handleMoreOutsourceInterviewsClick = () => {
    setIsPopupOutsourceInterviewsOpen(!isPopupOutsourceInterviewsOpen);
  };

  const handleViewOutsourceInterviewsButtonClick = () => {
    setIsPopupOutsourceInterviewsOpen(false);
    navigate("/outsourceinterview");
  };

  const [isPopupTasksOpen, setIsPopupTasksOpen] = useState(false);

  const handleMoreTasksClick = () => {
    setIsPopupTasksOpen(!isPopupTasksOpen);
  };

  const handleViewTasksButtonClick = () => {
    setIsPopupTasksOpen(false);
    navigate("/task");
  };

  const [taskData, setTaskData] = useState([]);

  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`);
  //       setTaskData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching tasks:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchTasks();
  // }, []);

  // Count the number of interviews for each status
  const statusCounts = interviewData.reduce((acc, interview) => {
    acc[interview.Status] = (acc[interview.Status] || 0) + 1;
    return acc;
  }, {});

  // // Default to 0 if no records are found for a status
  const noShowCount = statusCounts['No Show'] || 0;
  const scheduledCount = statusCounts['Scheduled'] || 0;
  const completedCount = statusCounts['Completed'] || 0;
  const cancelledCount = statusCounts['ScheduleCancel'] || 0;



  const [openPopup, setOpenPopup] = useState(null);

  const handleFilterNotificationClick = () => {
    setOpenPopup(openPopup === 'notification' ? null : 'notification');
  };

  const handleFilterUpcomingInterviewsClick = () => {
    setOpenPopup(openPopup === 'upcomingInterviews' ? null : 'upcomingInterviews');
  };

  const handleFilterOutsourceInterviewsClick = () => {
    setOpenPopup(openPopup === 'outsourceInterviews' ? null : 'outsourceInterviews');
  };

  const handleFilterTasksClick = () => {
    setOpenPopup(openPopup === 'tasks' ? null : 'tasks');
  };

  const [filterCriteria, setFilterCriteria] = useState('all');

  const handleFilterChange = (criteria) => {
    setFilterCriteria(criteria);
    setOpenPopup(null);
  };

  const filteredInterviews = sortedInterviews.filter(interview => {
    const round = roundsData[interview.rounds[0]];
    if (!round) return false;

    const interviewDate = extractDate(round.dateTime);
    const currentDate = new Date();

    switch (filterCriteria) {
      case 'thisWeek':
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
      case 'nextWeek':
        const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
        const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
        return interviewDate >= startOfNextWeek && interviewDate <= endOfNextWeek;
      case 'thisMonth':
        return interviewDate.getMonth() === currentDate.getMonth() && interviewDate.getFullYear() === currentDate.getFullYear();
      default:
        return true;
    }
  });

  const [outsourceFilterCriteria, setOutsourceFilterCriteria] = useState('all');

  const handleOutsourceFilterChange = (criteria) => {
    setOutsourceFilterCriteria(criteria);
    setOpenPopup(null);
  };

  const filteredOutsourceInterviews = outsourceInterviews.filter(interview => {
    const interviewDate = new Date(interview.createdAt);
    const currentDate = new Date();

    switch (outsourceFilterCriteria) {
      case 'thisWeek':
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
      case 'nextWeek':
        const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
        const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
        return interviewDate >= startOfNextWeek && interviewDate <= endOfNextWeek;
      case 'thisMonth':
        return interviewDate.getMonth() === currentDate.getMonth() && interviewDate.getFullYear() === currentDate.getFullYear();
      default:
        return true;
    }
  });

  const [taskFilterCriteria, setTaskFilterCriteria] = useState('all');

  const handleTaskFilterChange = (criteria) => {
    setTaskFilterCriteria(criteria);
    setOpenPopup(null);
  };

  const filteredTasks = taskData.filter(task => {
    const taskDate = new Date(task.dueDate);
    const currentDate = new Date();

    switch (taskFilterCriteria) {
      case 'thisWeek':
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      case 'nextWeek':
        const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
        const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
        return taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
      case 'thisMonth':
        return taskDate.getMonth() === currentDate.getMonth() && taskDate.getFullYear() === currentDate.getFullYear();
      default:
        return true;
    }
  });

  const [notificationFilterCriteria, setNotificationFilterCriteria] = useState('all');

  const handleNotificationFilterChange = (criteria) => {
    setNotificationFilterCriteria(criteria);
    setOpenPopup(null);
  };

  const filteredNotifications = notificationsData.filter(notification => {
    const notificationDate = new Date(notification.CreatedDate);
    const currentDate = new Date();

    switch (notificationFilterCriteria) {
      case 'thisWeek':
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        return notificationDate >= startOfWeek && notificationDate <= endOfWeek;
      case 'nextWeek':
        const startOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
        const endOfNextWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 13));
        return notificationDate >= startOfNextWeek && notificationDate <= endOfNextWeek;
      case 'thisMonth':
        return notificationDate.getMonth() === currentDate.getMonth() && notificationDate.getFullYear() === currentDate.getFullYear();
      default:
        return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClick = () => {
    navigate("/newinterviewviewpage");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const handleOutsideClick = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  return (

    <>

      <div className="lg:mx-auto lg:container xl:mx-auto xl:container 2xl:mx-auto 2xl:container mb-5">
        <div className="sm:py-0 sm:mx-0 md:mx-0">
          {freelancer && (
            <div className=" sm:mx-0 md:mx-0">
              <div className="mb-5">
                <div className="py-3">
                  <div className="flex justify-between items-center mb-2 mx-4">
                    <p className="font-bold text-lg">New Interview Requests</p>
                    <div className="flex items-center gap-2">
                      <p><LuFilter /></p>
                      <span className="cursor-pointer text-2xl" onClick={handleViewMoreRequestClick}><FiMoreHorizontal /></span>
                    </div>
                  </div>
                  {isPopupOpenRequest && (
                    <div className="absolute right-4 -mt-3 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleClick}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                      >
                        View All
                      </button>
                    </div>
                  )}
                  <div className="border rounded-md p-3 mx-3 bg-[#F5F9FA]">
                    <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-1 gap-4">
                      {interviewData.slice(0, 4).map((interview, index) => (
                        <div className="border bg-white shadow rounded-md p-2">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                            </div>
                            <div>
                              <p className="cursor-pointer text-custom-blue">
                                Senior Java Developer
                              </p>
                              <p>30 Oct, 2024 . 10:00 AM</p>
                              <p>Java, Node JS</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
              {sidebarOpen && (
                <div>
                  <Sidebar onClose={closeSidebar} onOutsideClick={handleOutsideClick} />
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-9 gap-1 mx-2 sm:mx-0 md:mx-0">
            {/* left column */}
            <div className="col-span-2 sm:hidden md:hidden sm:col-span-9 md:col-span-9 w-[94%] p-2 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-lg">Tabs</p>
                <span className="cursor-pointer text-2xl" onClick={handleViewMoreClick}><MdMoreVert /></span>
              </div>
              {isPopupOpen && (
                <div className="absolute left-52 -mt-2 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleViewButtonClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                  >
                    View All
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {apps.map((app, index) => (
                  <div
                    key={index}
                    className="p-1 rounded-md shadow-md hover:shadow-lg border border-[#217989] flex flex-col bg-[#217989] bg-opacity-5"
                  >
                    <NavLink to={app.to} className="flex-grow">
                      <div className="grid grid-cols-5 cursor-pointer gap-1 h-full">
                        <div className="col-span-1 flex items-center px-2">
                          {app.icon}
                        </div>
                        <div className="col-span-4 flex items-center">
                          <div>
                            <p className="text-sm font-bold text-black">{app.title}</p>
                            <p className="text-sm text-black line-clamp-2">{app.description}</p>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>

              {/* newly added */}
              <div className="border mt-9 rounded-md border-[#217989]">
                <div className="bg-[#217989] bg-opacity-5 p-2 rounded-md">
                  <p className="mb-2 font-bold">Newly added</p>
                  <div className="flex gap-5 mb-2 text-2xl">
                    <div className="font-bold w-9"><MdOutlineContactPage /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {candidateData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleCandidateClick(candidateData[0])}>
                              {candidateData[0].LastName}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 mb-2 text-2xl">
                    <div className="font-bold w-9"><FaBuildingUser /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {lastFetchedPositions.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handlePositionClick(lastFetchedPositions[0])}>
                              {lastFetchedPositions[0].title}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 mb-2 text-2xl">
                    <div className="font-bold w-9"><BsBuildingCheck /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {teamsData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleTeamClick(teamsData[0])}>
                              {teamsData[0].LastName}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 text-2xl">
                    <div className="font-bold w-9"><MdOutlineSchedule /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {interviewData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interviewData[0])}>
                              {interviewData[0].Candidate}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle content */}
            <div className="col-span-5 sm:col-span-9 md:col-span-9 space-y-4 p-2 sm:bg-white bg-[#217989] bg-opacity-5 h-[200vh] -mt-4 pt-11 -mb-8 -ml-5 sm:ml-0 -mr-1 sm:mr-0">

              {/* for mobile view noshow, scheduled, completed, cancelled */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:hidden xl:hidden 2xl:hidden">
                  <div className="border rounded-md bg-[#F8D598] w-32">
                    <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                    <p className="text-center mt-5 ml-7 text-4xl">{noShowCount}</p>
                    <p className="text-center pb-3 text-lg">No Show</p>
                  </div>
                  <div className="border rounded-md bg-[#AAC2ED] w-32">
                    <p className="text-2xl inline -ml-10 float-end mt-1"><MdMoreVert /></p>
                    <p className="text-center mt-5 text-4xl">{scheduledCount}</p>
                    <p className="text-center pb-3 text-lg">Scheduled</p>
                  </div>
                  <div className="border rounded-md bg-[#CEA0EB] w-32">
                    <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                    <p className="text-center mt-5 ml-6 text-4xl">{completedCount}</p>
                    <p className="text-center pb-3 text-lg">Completed</p>
                  </div>
                  <div className="border rounded-md bg-[#A0E2EC] w-32">
                    <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                    <p className="text-center mt-5 ml-6 text-4xl">{cancelledCount}</p>
                    <p className="text-center pb-3 text-lg">Cancelled</p>
                  </div>

                </div>
              </div>

              {/* main status */}
              <div className="flex justify-between sm:hidden md:hidden">
                <div className="border rounded-md bg-[#F8D598] w-32">
                  <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                  <p className="text-center mt-5 ml-7 text-4xl">{noShowCount}</p>
                  <p className="text-center pb-3 text-lg">No Show</p>
                </div>
                <div className="border rounded-md bg-[#AAC2ED] w-32">
                  <p className="text-2xl inline -ml-10 float-end mt-1"><MdMoreVert /></p>
                  <p className="text-center mt-5 text-4xl">{scheduledCount}</p>
                  <p className="text-center pb-3 text-lg">Scheduled</p>
                </div>
                <div className="border rounded-md bg-[#CEA0EB] w-32">
                  <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                  <p className="text-center mt-5 ml-6 text-4xl">{completedCount}</p>
                  <p className="text-center pb-3 text-lg">Completed</p>
                </div>
                <div className="border rounded-md bg-[#A0E2EC] w-32">
                  <span className="text-2xl float-end mt-1"><MdMoreVert /></span>
                  <p className="text-center mt-5 ml-6 text-4xl">{cancelledCount}</p>
                  <p className="text-center pb-3 text-lg">Cancelled</p>
                </div>

              </div>
              {/* reports */}
              <div className="container mx-auto mb-5">
                <div className="py-3 mx-2 sm:mx-0 md:mx-0">
                  <h2 className="font-bold text-lg mb-2">Reports</h2>
                  <Bar data={data} options={options} />
                </div>
              </div>
              {/* Interview Feedback */}
              <div className="sm:hidden md:hidden">
                <p className="font-bold text-lg mb-2">Interview Feedback</p>
                <div className="flex justify-between">
                  {sortedInterviews.slice(0, 3).map((interview, index) => {
                    const round = roundsData[interview.rounds[0]];
                    if (round) {
                      const dateOnly = round.dateTime.split(' ')[0];

                      let statusTextColor;
                      switch (interview.Status) {
                        case 'Reschedule':
                          statusTextColor = 'text-violet-500';
                          break;
                        case 'Scheduled':
                          statusTextColor = 'text-yellow-300';
                          break;
                        case 'ScheduleCancel':
                          statusTextColor = 'text-red-500';
                          break;
                        default:
                          statusTextColor = 'text-black';
                      }

                      return (
                        <div key={index} className="border rounded-md border-[#217989] w-48 bg-white">
                          <div className="flex justify-between border-b text-sm p-2">
                            <p>{dateOnly}</p>
                            <p className="font-semibold text-green-600">Completed</p>
                          </div>
                          <div className="flex flex-col items-center py-3">
                            {interview.candidate?.imageUrl ? (
                              <img
                                src={interview.candidate.imageUrl}
                                alt="Candidate"
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              interview.candidate?.Gender === "Male" ? (
                                <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                              ) : interview.candidate?.Gender === "Female" ? (
                                <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                              ) : (
                                <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                              )
                            )}
                            <p className="text-center">{interview.Candidate}</p>
                            <p className="text-center">{interview.Position}</p>
                          </div>
                          <div className="flex justify-between p-2">
                            <button className="border rounded-md border-[#217989] px-2">MSG</button>
                            <button className="border rounded-md border-[#217989] px-2">Email</button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                </div>
              </div>
              {/* notifications */}
              <div className="border rounded-md border-[#217989] bg-white sm:hidden md:hidden">
                <div className="flex justify-between p-3 items-center">
                  <p className="font-bold text-lg">Notifications</p>
                  <div className="cursor-pointer text-2xl flex items-center gap-2">
                    <p style={{ fontSize: "1.2rem" }} onClick={handleFilterNotificationClick}><LuFilter /></p>
                    <p onClick={handleMoreNotificationClick}><FiMoreHorizontal /></p>
                  </div>
                  {isPopupNotificationOpen && (
                    <div className="absolute right-80 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleViewNotificationClick}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                      >
                        View All
                      </button>
                    </div>
                  )}
                  {openPopup === 'notification' && (
                    <div className="absolute right-80 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('thisWeek')}>This Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('nextWeek')}>Next Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('thisMonth')}>This Month</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('all')}>All</button>
                    </div>
                  )}
                </div>
                {filteredNotifications.length === 0 ? (
                  <p className="text-center p-3">No data found.</p>
                ) : (
                  filteredNotifications.slice(0, 3).map((notification, i) => (
                    <div
                      key={i}
                      className="flex text-sm border-b w-full justify-between"
                    >
                      <div className="flex item-center mt-2">
                        <div className="w-10 ml-3 mt-1">
                          <img className="w-5 h-5" src="https://cdn-icons-png.flaticon.com/256/6577/6577277.png" alt="" />
                        </div>
                        <div>
                          <p className="font-bold">
                            {notification.Status === "Scheduled"
                              ? "Interview Scheduled"
                              : "New Interview Requests"}
                          </p>
                          <p>{notification.Body}</p>
                          <p className="mb-2">{notification.CreatedDate}</p>
                        </div>
                      </div>
                      <div className="text-xl mt-12 mr-2">
                        <FaArrowRight />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-2 sm:col-span-9 sm:-mt-[80rem] sm:mx-2 md:-mt-[92rem] md:mx-2 md:col-span-9 p-2 rounded-md">
              {/* upcoming interviews */}
              <div className="space-y-5 mb-10">
                <div className="flex justify-between p-1 items-center">
                  <p className="font-bold text-md">Upcoming Interviews</p>
                  <div className="cursor-pointer text-2xl flex items-center gap-1">
                    <p style={{ fontSize: "1.2rem" }} onClick={handleFilterUpcomingInterviewsClick}><LuFilter /></p>
                    <p onClick={handleMoreUpcomingInterviewsClick}><FiMoreHorizontal /></p>
                  </div>
                  {isPopupUpcomingInterviewsOpen && (
                    <div className="absolute right-4 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleViewUpcomingInterviewsButtonClick}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                      >
                        View All
                      </button>
                    </div>
                  )}
                  {openPopup === 'upcomingInterviews' && (
                    <div className="absolute right-4 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('thisWeek')}>This Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('nextWeek')}>Next Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('thisMonth')}>This Month</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleFilterChange('all')}>All</button>
                    </div>
                  )}
                </div>

                {filteredInterviews.length === 0 ? (
                  <p className="text-center p-3">No data found.</p>
                ) : (
                  filteredInterviews.slice(0, 3).map((interview, index) => {
                    const round = roundsData[interview.rounds[0]];
                    if (round) {
                      let statusTextColor;
                      switch (interview.Status) {
                        case 'Reschedule':
                          statusTextColor = 'text-violet-500';
                          break;
                        case 'Scheduled':
                          statusTextColor = 'text-yellow-300';
                          break;
                        case 'ScheduleCancel':
                          statusTextColor = 'text-red-500';
                          break;
                        default:
                          statusTextColor = 'text-black';
                      }

                      return (
                        <div key={index} className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2">
                          <div className="border-b border-gray-400 px-2 flex justify-between items-center">
                            <p className="text-sm">{displayDateTime(round.dateTime)}</p>
                            <p className={statusTextColor}>{interview.Status}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm p-2">
                            <div>
                              {interview.candidate?.imageUrl ? (
                                <img
                                  src={interview.candidate.imageUrl}
                                  alt="Candidate"
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                interview.candidate?.Gender === "Male" ? (
                                  <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                                ) : interview.candidate?.Gender === "Female" ? (
                                  <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                                ) : (
                                  <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                                )
                              )}
                              <img className="w-5 h-5 rounded-full ml-9 -mt-5" src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?semt=ais_hybrid" alt="" />
                            </div>
                            <div>
                              <p>{interview.Position}</p>
                              <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interview)}>{interview.Candidate}</p>
                              <p>Interviewers: Arjun</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                )}

              </div>
              {/* tasks */}
              <div className="border rounded-md border-[#217989] bg-[#217989] bg-opacity-5 mb-8">
                <div className="border-b border-gray-400">
                  <div className="flex p-2 justify-between items-center">
                    <p className="font-bold text-md">Tasks</p>
                    <div className="cursor-pointer text-2xl flex items-center gap-1">
                      <p style={{ fontSize: "1.2rem" }} onClick={handleFilterTasksClick}><LuFilter /></p>
                      <p onClick={handleMoreTasksClick}><FiMoreHorizontal /></p>
                    </div>
                    {isPopupTasksOpen && (
                      <div className="absolute right-4 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        <button
                          onClick={handleViewTasksButtonClick}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                        >
                          View All
                        </button>
                      </div>
                    )}
                    {openPopup === 'tasks' && (
                      <div className="absolute right-4 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleTaskFilterChange('thisWeek')}>This Week</button>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleTaskFilterChange('nextWeek')}>Next Week</button>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleTaskFilterChange('thisMonth')}>This Month</button>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleTaskFilterChange('all')}>All</button>
                      </div>
                    )}
                  </div>
                  {loading ? (
                    <p className="text-center p-3">Loading tasks...</p>
                  ) : filteredTasks.length === 0 ? (
                    <p className="text-center p-3">No tasks available.</p>
                  ) : (
                    filteredTasks.slice(0, 2).map((task, index) => (
                      <div key={index}>
                        <p className="text-center p-3 text-custom-blue font-bold">{task.title}</p>
                        <div className="flex justify-between p-2">
                          <p className="text-custom-blue">{task.assignedTo}</p>
                          <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between p-2">
                          <p>{task.priority}</p>
                          <p>{task.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* interviewers */}
              <div className="space-y-5">
                <div className="flex justify-between p-1 -mb-2 items-center">
                  <p className="font-bold text-md">Interviewers</p>
                  <div className="cursor-pointer text-2xl flex items-center gap-1">
                    <p style={{ fontSize: "1.2rem" }} onClick={handleFilterOutsourceInterviewsClick}><LuFilter /></p>
                    <p onClick={handleMoreOutsourceInterviewsClick}><FiMoreHorizontal /></p>
                  </div>
                  {isPopupOutsourceInterviewsOpen && (
                    <div className="absolute right-4 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleViewOutsourceInterviewsButtonClick}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                      >
                        View All
                      </button>
                    </div>
                  )}
                  {openPopup === 'outsourceInterviews' && (
                    <div className="absolute right-4 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('thisWeek')}>This Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('nextWeek')}>Next Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('thisMonth')}>This Month</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleOutsourceFilterChange('all')}>All</button>
                    </div>
                  )}
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : filteredOutsourceInterviews.length === 0 ? (
                  <p className="text-center p-3">No data found.</p>
                ) : (
                  filteredOutsourceInterviews.slice(0, 3).map((interview, index) => (
                    <div key={index} className="border border-[#217989] bg-[#217989] shadow rounded-md p-2 bg-opacity-5 mb-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div>
                          {interview.candidate?.imageUrl ? (
                            <img
                              src={interview.candidate.imageUrl}
                              alt="Candidate"
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            interview.candidate?.Gender === "Male" ? (
                              <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                            ) : interview.candidate?.Gender === "Female" ? (
                              <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                            ) : (
                              <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                            )
                          )}
                        </div>
                        <div>
                          <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interview)}>
                            {interview.Candidate}
                          </p>
                          <p>{interview.Position}</p>
                          <p>{new Date(interview.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Interview Feedback only in mobile view */}
              <div className="lg:hidden xl:hidden 2xl:hidden sm:mx-[1px] sm:mt-8 sm:mb-12 md:mx-[1px] md:mt-8 md:mb-12">
                <p className="font-bold text-lg mb-5">Interview Feedback</p>
                <div className="sm:flex sm:justify-center md:flex md:justify-center">
                  <div className="sm:space-y-5 md:grid md:grid-cols-2 md:gap-6">
                    {sortedInterviews.slice(0, 2).map((interview, index) => {
                      const round = roundsData[interview.rounds[0]];
                      if (round) {
                        const dateOnly = round.dateTime.split(' ')[0];
                        let statusTextColor;
                        switch (interview.Status) {
                          case 'Reschedule':
                            statusTextColor = 'text-violet-500';
                            break;
                          case 'Scheduled':
                            statusTextColor = 'text-yellow-300';
                            break;
                          case 'ScheduleCancel':
                            statusTextColor = 'text-red-500';
                            break;
                          default:
                            statusTextColor = 'text-black';
                        }

                        return (
                          <div key={index} className="border rounded-md border-[#217989] w-56 bg-white">
                            <div className="flex justify-between border-b text-sm p-2">
                              <p>{dateOnly}</p>
                              <p className={`font-semibold ${statusTextColor}`}>{interview.Status}</p>
                            </div>
                            <div className="flex flex-col items-center py-3">
                              {interview.candidate?.imageUrl ? (
                                <img
                                  src={interview.candidate.imageUrl}
                                  alt="Candidate"
                                  className="w-12 h-12"
                                />
                              ) : (
                                interview.candidate?.Gender === "Male" ? (
                                  <img src={maleImage} alt="Male Avatar" className="w-12 h-12" />
                                ) : interview.candidate?.Gender === "Female" ? (
                                  <img src={femaleImage} alt="Female Avatar" className="w-12 h-12" />
                                ) : (
                                  <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12" />
                                )
                              )}
                              <p className="text-center">{interview.Candidate}</p>
                              <p className="text-center">{interview.Position}</p>
                            </div>
                            <div className="flex justify-between p-2">
                              <button className="border rounded-md border-[#217989] px-2">MSG</button>
                              <button className="border rounded-md border-[#217989] px-2">Email</button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              {/* notifications only in mobile view */}
              <div className="border rounded-md border-[#217989] bg-white sm:mx-[1px] md:mx-[1px] lg:hidden xl:hidden 2xl:hidden">
                <div className="flex justify-between p-3 items-center">
                  <p className="font-bold text-lg">Notifications</p>
                  <div className="cursor-pointer text-2xl flex items-center gap-2">
                    <p style={{ fontSize: "1.2rem" }} onClick={handleFilterNotificationClick}><LuFilter /></p>
                    <p onClick={handleMoreNotificationClick}><FiMoreHorizontal /></p>
                  </div>
                  {isPopupNotificationOpen && (
                    <div className="absolute right-80 mt-20 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleViewNotificationClick}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-xs"
                      >
                        View All
                      </button>
                    </div>
                  )}
                  {openPopup === 'notification' && (
                    <div className="absolute right-80 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('thisWeek')}>This Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('nextWeek')}>Next Week</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('thisMonth')}>This Month</button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => handleNotificationFilterChange('all')}>All</button>
                    </div>
                  )}
                </div>
                {filteredNotifications.length === 0 ? (
                  <p className="text-center p-3">No data found.</p>
                ) : (
                  filteredNotifications.slice(0, 3).map((notification, i) => (
                    <div
                      key={i}
                      className="flex text-sm border-b w-full justify-between"
                    >
                      <div className="flex item-center mt-2">
                        <div className="w-14 ml-3 mt-1">
                          {/* {notification.Status === "Scheduled" ? (
                            <AiTwotoneSchedule className="text-xl" />
                          ) : (
                            <PiNotificationBold className="text-xl" />
                          )} */}
                        </div>
                        <div>
                          <p className="font-bold">
                            {notification.Status === "Scheduled"
                              ? "Interview Scheduled"
                              : "New Interview Requests"}
                          </p>
                          <p>{notification.Body}</p>
                          <p className="mb-2">{notification.CreatedDate}</p>
                        </div>
                      </div>
                      <div className="text-xl mt-12 mr-2">
                        <FaArrowRight />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* newly added only in mobile view */}
              <div className="border mt-6 rounded-md border-[#217989] sm:mx-[1px] md:mx-[1px] md:mt-8 lg:hidden xl:hidden 2xl:hidden">
                <div className="bg-[#217989] bg-opacity-5 p-2 rounded-md">
                  <p className="mb-2 font-bold">Newly added</p>
                  <div className="flex gap-5 mb-2 text-2xl">
                    <div className="font-bold w-9"><MdOutlineContactPage /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {candidateData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleCandidateClick(candidateData[0])}>
                              {candidateData[0].LastName}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 mb-2 ml-1 text-2xl">
                    <div className="font-bold w-9"><FaBuildingUser /></div>
                    <div className="text-sm -ml-1">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {lastFetchedPositions.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handlePositionClick(lastFetchedPositions[0])}>
                              {lastFetchedPositions[0].title}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 mb-2 text-2xl">
                    <div className="font-bold w-9"><BsBuildingCheck /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {teamsData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleTeamClick(teamsData[0])}>
                              {teamsData[0].LastName}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 text-2xl">
                    <div className="font-bold w-9"><MdOutlineSchedule /></div>
                    <div className="text-sm">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {interviewData.length > 0 && (
                            <p className="cursor-pointer text-custom-blue" onClick={() => handleInterviewClick(interviewData[0])}>
                              {interviewData[0].Candidate}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* {selectedCandidate && (
        <CandidateProfileDetails candidate={selectedCandidate} onCloseprofile={handleCloseProfile} />
      )} */}
      {/* {selectedPosition && (
        <PositionProfileDetails position={selectedPosition} onCloseprofile={handleClosePositionProfile} />
      )} */}
      {/* {selectedTeam && (
        <TeamProfileDetails candidate={selectedTeam} onCloseprofile={handleCloseTeamProfile} />
      )} */}
      {/* {selectedInterview && (
        <Internalprofiledetails candidate={selectedInterview} roundsData={roundsData} onCloseprofile={handleCloseInterviewProfile} />
      )} */}

      <AppViewMore isModalOpen={isModalOpen} closeModal={closeModal} />

    </>
  );
};

export default Home;