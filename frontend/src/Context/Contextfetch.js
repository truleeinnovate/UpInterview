import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { fetchFilterData } from "../utils/dataUtils.js";
import { usePermissions } from "./PermissionsContext.js";
import Cookies from "js-cookie";
import { config } from '../config.js'
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload?.userId;
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
  // const sharingPermissionscandidate = useMemo(() => sharingPermissionscontext.candidate || {}, [sharingPermissionscontext]);
  // const [candidateData, setCandidateData] = useState([]);

  // const fetchCandidateData = useCallback(async () => {
  //   setLoading(true);

  //   try {
  //     const filteredCandidates = await fetchFilterData('candidate', sharingPermissionscandidate);

  //     const candidatesWithImages = filteredCandidates.map((candidate) => {
  //       if (candidate.ImageData && candidate.ImageData.filename) {
  //         const imageUrl = `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
  //         return { ...candidate, imageUrl };
  //       }
  //       return candidate;
  //     });

  //     // Reverse the data to show the most recent first
  //     const reversedData = candidatesWithImages.reverse();

  //     setCandidateData(reversedData);
  //   } catch (error) {
  //     console.error("❌ [fetchCandidateData] Error fetching candidate data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissionscandidate]);

  // useEffect(() => {
  //   fetchCandidateData();
  // }, [fetchCandidateData]);

  const queryClient = useQueryClient();

  // candidate
  const sharingPermissionscandidate = useMemo(() => sharingPermissionscontext.candidate || {}, [sharingPermissionscontext]);

  const { data: candidateData = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', sharingPermissionscandidate],
    queryFn: async () => {
      const filteredCandidates = await fetchFilterData('candidate', sharingPermissionscandidate);

      return filteredCandidates.map((candidate) => {
        if (candidate.ImageData?.filename) {
          return {
            ...candidate,
            imageUrl: `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`
          };
        }
        return candidate;
      }).reverse(); // show most recent first
    },
    enabled: !!sharingPermissionscandidate, // only run when permissions are available
  });



  // 3. Create a mutation for adding/updating candidate
  const addOrUpdateCandidate = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const url = id
        ? `${config.REACT_APP_API_URL}/candidate/${id}`
        : `${config.REACT_APP_API_URL}/candidate`;

      const method = id ? 'patch' : 'post';
      const response = await axios[method](url, data);

      const candidateId = response.data.data._id;

      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "candidate");
        imageData.append("id", candidateId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']); // ✅ Refreshes the list
    }
  });

  // position fetch
  const sharingPermissionsPosition = useMemo(() => sharingPermissionscontext.position || {}, [sharingPermissionscontext]);
  // const [positions, setSkillsData] = useState([]);
  // const fetchPositionsData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const filteredPositions = await fetchFilterData(
  //       "position",
  //       sharingPermissionsPosition
  //     );
  //     const reversedData = filteredPositions.reverse();
  //     setSkillsData(reversedData);
  //   } catch (error) {
  //     // console.error("Error fetching position data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissionsPosition]);

  // useEffect(() => {
  //   fetchPositionsData();
  // }, [fetchPositionsData]);

  // 📦 Positions Query
  const {
    data: positions = [],
    isLoading: isPositionsLoading,
    // refetch: refetchPositionData
  } = useQuery({
    queryKey: ['positions', sharingPermissionsPosition],
    queryFn: async () => {
      const filteredPositions = await fetchFilterData('position', sharingPermissionsPosition);
      return filteredPositions.reverse(); // Latest first
    },
    enabled: !!sharingPermissionsPosition,
  });


  // Add position mutation
  const addOrUpdatePosition = useMutation({
    mutationFn: async ({ id, data }) => {
      const url = id
        ? `${config.REACT_APP_API_URL}/position/${id}`
        : `${config.REACT_APP_API_URL}/position`;

      const method = id ? 'patch' : 'post';
      // return await axios[method](url, data);
      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['positions']);
    }
  });

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

  const tenantId = tokenPayload?.tenantId;

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


  // getting the user table total data and using it in the protectedroutes.jsx page for filtering the user and populating the tenant id and checking the subdomain is present or not in the ouganization data which is populated from the tenant id 
  // users
  const [usersData, setUsersData] = useState([]);

  // Fetch users data
  const fetchUsersData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      console.log('users response.data from context:', response.data);
      setUsersData(response.data);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);

  const fetchQuestionsForAssessment = useCallback(async (assessmentId) => {
    if (!assessmentId) {
      return null;
    }

    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/assessments/${assessmentId}`
      );
      const assessmentQuestions = response.data;
      const sections = assessmentQuestions.sections || [];

      // Check for empty sections or questions
      if (sections.length === 0 || sections.every(section => !section.questions || section.questions.length === 0)) {
        setSectionQuestions({ noQuestions: true });
        return { noQuestions: true };
      }

      // Create section questions mapping
      const newSectionQuestions = {};

      sections.forEach((section) => {
        if (!section._id) {
          console.warn('Section missing _id:', section);
          return;
        }

        newSectionQuestions[section._id] = {
          sectionName: section?.sectionName,
          passScore: Number(section.passScore || 0),
          totalScore: Number(section.totalScore || 0),
          questions: (section.questions || []).map(q => ({
            _id: q._id,
            questionId: q.questionId,
            source: q.source || 'system',
            score: Number(q.score || q.snapshot?.score || 0),
            order: q.order || 0,
            customizations: q.customizations || null,
            snapshot: {
              questionText: q.snapshot?.questionText || '',
              questionType: q.snapshot?.questionType || '',
              score: Number(q.snapshot?.score || q.score || 0),
              options: Array.isArray(q.snapshot?.options) ? q.snapshot.options : [],
              correctAnswer: q.snapshot?.correctAnswer || '',
              difficultyLevel: q.snapshot?.difficultyLevel || '',
              hints: Array.isArray(q.snapshot?.hints) ? q.snapshot.hints : [],
              skill: Array.isArray(q.snapshot?.skill) ? q.snapshot.skill : [],
              tags: Array.isArray(q.snapshot?.tags) ? q.snapshot.tags : [],
              technology: Array.isArray(q.snapshot?.technology) ? q.snapshot.technology : [],
              questionNo: q.snapshot?.questionNo || ''
            }
          }))
        };
      });

      // Verify questions exist
      const hasQuestions = Object.values(newSectionQuestions).some(
        section => section.questions.length > 0
      );

      if (!hasQuestions) {
        setSectionQuestions({ noQuestions: true });
        return { noQuestions: true };
      }

      setSectionQuestions(newSectionQuestions);
      return newSectionQuestions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestionsError('Failed to load questions');
      return { error: 'Failed to load questions' };
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  // interview templete
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // const apiUrl = `${process.env.REACT_APP_API_URL}/interviewTemplates`;
        const apiUrl = `${process.env.REACT_APP_API_URL}/interviewTemplates?tenantId=${tenantId}`;
        const response = await axios.get(apiUrl);

        setTemplates(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [tenantId]);


  // organzation code 
  // In your organizationData component
  const { data: organizationData, isLoading: organizationsLoading, error: organizationError } = useQuery({
    queryKey: ['organization', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Invalid organization ID');
      }
      const response = await axios.get(`${config.REACT_APP_API_URL}/Organization/organization-details/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId,
    retry: false
  });

  const addOrUpdateOrganization = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const url = `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`;
      const method = 'patch'
      const response = await axios[method](url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const organizationId = response.data.data._id;

      // Handle image upload if a file is provided
      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "organization");
        imageData.append("id", organizationId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']); // ✅ Refresh the org list
    },
  });

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
        // fetchCandidateData,
        // candidateData,

        // candidate
        candidateData,
        candidatesLoading,
        addOrUpdateCandidate,

        // position
        // fetchPositionsData,
        // positions,

        // position
        positions,
        isPositionsLoading,
        addOrUpdatePosition,

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

        // getting the user table total data and using it in the protectedroutes.jsx page for filtering the user and populating the tenant id and checking the subdomain is present or not in the ouganization data which is populated from the tenant id 
        // users
        usersData,
        fetchUsersData,

        // assessment questions 
        sectionQuestions,
        questionsLoading,
        questionsError,
        fetchQuestionsForAssessment,
        setSectionQuestions,

        // interview templates
        templates,

        // organzation 
        organizationData,
        organizationsLoading,
        addOrUpdateOrganization,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};

const useCustomContext = () => useContext(CustomContext);

export { useCustomContext, CustomProvider };