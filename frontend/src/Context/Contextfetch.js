import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { fetchFilterData } from "../utils/dataUtils.js";
import { usePermissions } from "./PermissionsContext.js";
import Cookies from "js-cookie";
import { config } from '../config.js'
const CustomContext = createContext();

const CustomProvider = ({ children }) => {
  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.questionBank || {}, [sharingPermissionscontext]);

  const [pagination, setPagination] = useState(6);
  const [iter] = useState(6);
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsopen] = useState(false);
  const [page, setPage] = useState("Home");
  const [popupVisibility, setPopupVisibility] = useState(false);
  const [feedbackCloseFlag, setFeedbackCloseFlag] = useState(false);
  const [createdLists, setCreatedLists] = useState([]);
  const userId = Cookies.get("userId");
  const [interviewerSectionData, setInterviewerSectionData] = useState([]);
  const [feedbackTabErrors, setFeedbackTabError] = useState({
    interviewQuestion: true,
    skills: true,
    overallImpression: true,
  });
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [suggestedQuestionsFilteredData, setSuggestedQuestionsFilteredData] = useState([]);
  const [myQuestionsList, setMyQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [currentRole, setCurrentRole] = useState([]);

  // master data fetch
  const [skills, setSkills] = useState([]);
  const [qualification, setQualification] = useState([]);
  const [college, setCollege] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [technologies, setTechnology] = useState([]);

  // users data 
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/auth/users/${userId}`);
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [locationsRes, industriesRes, rolesRes, skillsRes, TechnologyRes, QualificationRes, CollegeRes, CompanyRes] = await Promise.all([
          axios.get(`${config.REACT_APP_API_URL}/locations`),
          axios.get(`${config.REACT_APP_API_URL}/industries`),
          axios.get(`${config.REACT_APP_API_URL}/roles`),
          axios.get(`${config.REACT_APP_API_URL}/skills`),
          axios.get(`${config.REACT_APP_API_URL}/technology`),
          axios.get(`${config.REACT_APP_API_URL}/qualification`),
          axios.get(`${config.REACT_APP_API_URL}/universitycollege`),
          axios.get(`${config.REACT_APP_API_URL}/company`),
        ]);

        setLocations(locationsRes.data);
        setIndustries(industriesRes.data);
        setCurrentRole(rolesRes.data);
        setSkills(skillsRes.data);
        setTechnology(TechnologyRes.data);
        setQualification(QualificationRes.data);
        setCollege(CollegeRes.data);
        setCompanies(CompanyRes.data);
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch Interviewer Questions
  const getInterviewerQuestions = useCallback(async () => {
    try {
      const url = `${config.REACT_APP_API_URL}/interview-questions/get-questions`;
      const response = await axios.get(url);

      const formattedList = response.data.questions.map((question) => ({
        id: question._id,
        question: question.snapshot.questionText,
        answer: question.snapshot.correctAnswer,
        note: "",
        notesBool: false,
        isLiked: false,
      }));

      setInterviewerSectionData(formattedList);
    } catch (error) {
      // console.error("Error fetching interviewer questions:", error);
    }
  }, []);

  useEffect(() => {
    getInterviewerQuestions();
  }, [getInterviewerQuestions]);

  // Fetch My Questions Data
  const fetchMyQuestionsData = useCallback(async () => {
    try {
      const filteredPositions = await fetchFilterData("tenentquestions", sharingPermissions);
      const newObject = Object.keys(filteredPositions).reduce((acc, key) => {
        acc[key] = Array.isArray(filteredPositions[key])
          ? filteredPositions[key].map((each) => ({ ...each, isAdded: false }))
          : [];
        return acc;
      }, {});

      setMyQuestionsList(newObject);
    } catch (error) {
      // console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions]);


  // Fetch Created Lists
  const fetchLists = useCallback(async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`);
      setCreatedLists(response.data.reverse());
    } catch (error) {
      // console.error("Error fetching lists:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyQuestionsData();
    fetchLists();
  }, [fetchMyQuestionsData, fetchLists]);

  // Fetch Suggested Questions
  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/suggested-questions/questions`);

        if (response.data.success) {
          const newList = response.data.questions.map((question) => ({ ...question, isAdded: false }));
          setSuggestedQuestions(newList);
          setSuggestedQuestionsFilteredData(newList);
        }
      } catch (error) {
        console.error("Error fetching suggested questions:", error);
      }
    };

    getQuestions();
  }, []);


  // candidate
  const sharingPermissionscandidate = useMemo(() => sharingPermissionscontext.candidate || {}, [sharingPermissionscontext]);
  const [candidateData, setCandidateData] = useState([]);

  const fetchCandidateData = useCallback(async () => {
    setLoading(true);

    try {
      const filteredCandidates = await fetchFilterData('candidate', sharingPermissionscandidate);

      const candidatesWithImages = filteredCandidates.map((candidate) => {
        if (candidate.ImageData && candidate.ImageData.filename) {
          const imageUrl = `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
          return { ...candidate, imageUrl };
        }
        return candidate;
      });

      // Reverse the data to show the most recent first
      const reversedData = candidatesWithImages.reverse();

      setCandidateData(reversedData);
    } catch (error) {
      console.error("❌ [fetchCandidateData] Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionscandidate]);

  useEffect(() => {
    fetchCandidateData();
  }, [fetchCandidateData]);

  // position fetch
  const sharingPermissionsPosition = useMemo(() => sharingPermissionscontext.position || {}, [sharingPermissionscontext]);
  const [positions, setSkillsData] = useState([]);
  const fetchPositionsData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredPositions = await fetchFilterData(
        "position",
        sharingPermissionsPosition
      );
      const reversedData = filteredPositions.reverse();
      setSkillsData(reversedData);
    } catch (error) {
      // console.error("Error fetching position data:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionsPosition]);

  useEffect(() => {
    fetchPositionsData();
  }, [fetchPositionsData]);

  // Mockinterview
  const [mockinterviewData, setmockinterviewData] = useState([]);
  const sharingPermissionsMock = useMemo(() => sharingPermissionscontext.mockInterviews || {}, [sharingPermissionscontext]);


  const fetchMockInterviewData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredInterviews = await fetchFilterData(
        "mockinterview",
        sharingPermissionsMock
      );
      setmockinterviewData(filteredInterviews.reverse());
    } catch (error) {
      // console.error("Error fetching InterviewData:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionsMock]);


  useEffect(() => {
    fetchMockInterviewData();
  }, [fetchMockInterviewData]);


  // teams
  const sharingPermissionsTeam = useMemo(() => sharingPermissionscontext.team || {}, [sharingPermissionscontext]);

  const [teamsData, setTeamsData] = useState([]);
  const fetchTeamsData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredTeams = await fetchFilterData('team', sharingPermissionsTeam);

      const teamsWithContacts = filteredTeams.map((team) => {
        let processedTeam = { ...team };

        // Process image URL if exists
        if (team.ImageData && team.ImageData.filename) {
          const imageUrl = `${config.REACT_APP_API_URL}/${team.ImageData.path.replace(/\\/g, '/')}`;
          processedTeam.imageUrl = imageUrl;
        }

        // Process availability data if exists
        if (team.contactId && team.contactId.availability) {
          // Format availability data for easier frontend use
          const availabilityData = team.contactId.availability.map(schedule => ({
            contactId: schedule.contact,
            schedule: schedule.days.map(day => ({
              day: day.day,
              timeSlots: day.timeSlots.map(slot => ({
                startTime: new Date(slot.startTime),
                endTime: new Date(slot.endTime)
              }))
            }))
          }));
          processedTeam.availabilitySchedule = availabilityData;
        }
        return processedTeam;
      });
      setTeamsData(teamsWithContacts);
    } catch (error) {
      // console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionsTeam]);


  useEffect(() => {
    fetchTeamsData();
  }, [fetchTeamsData]);

  // interview
  const sharingPermissionsInterview = useMemo(() => sharingPermissionscontext.interviews || {}, [sharingPermissionscontext]);

  const [interviewData, setInterviewData] = useState([]);

  const fetchInterviewData = useCallback(async () => {
    setLoading(true);

    try {
      const filteredInterviews = await fetchFilterData('interview', sharingPermissionsInterview);
      const interviewsWithCandidates = await Promise.all(
        filteredInterviews.map(async (interview) => {
          if (!interview.CandidateId) {
            return {
              ...interview,
              candidate: null,
            };
          }
          try {
            const candidateResponse = await axios.get(
              `${config.REACT_APP_API_URL}/candidate/${interview.CandidateId}`
            );
            const candidate = candidateResponse.data;
            if (candidate.ImageData && candidate.ImageData.filename) {
              candidate.imageUrl = `${config.REACT_APP_API_URL
                }/${candidate.ImageData.path.replace(/\\/g, "/")}`;
            }
            return {
              ...interview,
              candidate,
            };
          } catch (error) {
            // console.error(
            //   error
            // );
            return {
              ...interview,
              candidate: null,
            };
          }
        })
      );
      const reversedData = interviewsWithCandidates.reverse();
      setInterviewData(reversedData);
    } catch (error) {
      // console.error("Error fetching InterviewData:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionsInterview]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  // outsource interviewers

  const [interviewers, setInterviewers] = useState([]);
  const fetchoutsourceInterviewers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/outsourceInterviewers`);
      const reversedData = response.data.reverse();
      setInterviewers(reversedData);
    } catch (err) {
      // console.error('❌ Error fetching interviewers:', err);
    }
  }, []);

  useEffect(() => {
    fetchoutsourceInterviewers();
  }, [fetchoutsourceInterviewers]);




  // notifications
  const [notificationsData] = useState([]);

  // useEffect(() => {
  //   const fetchNotificationData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/notification?userId=${userId}`
  //       );
  //       setNotificationsData(response.data);
  //     } catch (error) {
  //       console.error("Error fetching notificationData:", error);
  //     }
  //   };

  //   if (userId) {
  //     fetchNotificationData();
  //   }
  // }, [userId]);

  const [assessmentData, setAssessmentData] = useState([]);
  const assessmentPermissions = useMemo(() => sharingPermissionscontext.assessment || {}, [sharingPermissionscontext]);

  const fetchAssessmentData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredAssessments = await fetchFilterData(
        "assessment",
        assessmentPermissions
      );
      // Reverse the data to show the most recent first
      const reversedData = filteredAssessments.reverse();
      setAssessmentData(reversedData);
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    } finally {
      setLoading(false);
    }
  }, [assessmentPermissions]);

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]);



  // ranjith  //

  const tenantId = Cookies.get("organizationId");

  // Fetch groups
  const [groups, setGroups] = useState([]);

  const fetchGroupsData = useCallback(async () => {
    if (!tenantId) {
      console.error('No tenantId found in cookies');
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/data`, {
        params: {
          tenantId: tenantId
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
        console.log('Groups fetched:', response.data);
      } else {
        console.error('Invalid groups data format:', response.data);
        setGroups([]);
      }
    } catch (error) {

      console.log("error", error);

      console.error('Error fetching groups:', error.response?.data?.error || error.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchGroupsData();
  }, [fetchGroupsData]);

  return (
    <CustomContext.Provider
      value={{

        getInterviewerQuestions,
        fetchMyQuestionsData,
        myQuestionsList,
        setMyQuestionsList,
        createdLists,
        setCreatedLists,
        fetchLists,
        suggestedQuestions,
        setSuggestedQuestions,
        suggestedQuestionsFilteredData,
        setSuggestedQuestionsFilteredData,
        feedbackCloseFlag,
        setFeedbackCloseFlag,
        popupVisibility,
        setPopupVisibility,
        feedbackTabErrors,
        setFeedbackTabError,
        page,
        setPage,
        interviewerSectionData,
        setInterviewerSectionData,
        isOpen,
        setIsopen,
        iter,
        searchText,
        setSearchText,
        setPagination,
        pagination,
        loading,

        // candidate
        fetchCandidateData,
        candidateData,

        // position
        fetchPositionsData,
        positions,

        // mockinterview
        mockinterviewData,
        fetchMockInterviewData,

        // teams
        teamsData,
        fetchTeamsData,

        // outsource interviewers
        interviewers,
        fetchoutsourceInterviewers,

        // assessment
        assessmentData,
        fetchAssessmentData,

        // master data
        skills,
        qualification,
        college,
        companies,
        technologies,
        locations,
        industries,
        currentRole,
        // notifications
        notificationsData,
        // interview
        interviewData,
        fetchInterviewData,
        // user
        userProfile,

        // groups
        groups,
        fetchGroupsData,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};

const useCustomContext = () => useContext(CustomContext);

export { useCustomContext, CustomProvider };