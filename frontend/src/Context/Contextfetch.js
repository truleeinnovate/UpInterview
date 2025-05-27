import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { fetchFilterData } from '../utils/dataUtils.js';
import { usePermissions } from './PermissionsContext.js';
import Cookies from 'js-cookie';
import { config } from '../config.js';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CustomContext = createContext();

const CustomProvider = ({ children }) => {
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const sharingPermissions = useMemo(
    () => sharingPermissionscontext.questionBank || {},
    [sharingPermissionscontext]
  );

  const [pagination, setPagination] = useState(6);
  const [iter] = useState(6);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsopen] = useState(false);
  const [page, setPage] = useState('Home');
  const [popupVisibility, setPopupVisibility] = useState(false);
  const [feedbackCloseFlag, setFeedbackCloseFlag] = useState(false);
  const [createdLists, setCreatedLists] = useState([]);

  const authToken = Cookies.get('authToken');
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
        console.log('Fetching user profile...');
        const response = await axios.get(`${config.REACT_APP_API_URL}/auth/users/${userId}`);
        console.log('User profile fetched successfully:', response.data);
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      console.log('Fetching master data...');
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

        console.log('Master data fetched successfully');
        console.log('Locations:', locationsRes.data.length);
        console.log('Industries:', industriesRes.data.length);
        console.log('Roles:', rolesRes.data.length);
        console.log('Skills:', skillsRes.data.length);
        console.log('Technologies:', TechnologyRes.data.length);
        console.log('Qualifications:', QualificationRes.data.length);
        console.log('Colleges:', CollegeRes.data.length);
        console.log('Companies:', CompanyRes.data.length);

        setLocations(locationsRes.data);
        setIndustries(industriesRes.data);
        setCurrentRole(rolesRes.data);
        setSkills(skillsRes.data);
        setTechnology(TechnologyRes.data);
        setQualification(QualificationRes.data);
        setCollege(CollegeRes.data);
        setCompanies(CompanyRes.data);
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch Interviewer Questions
  const getInterviewerQuestions = useCallback(async () => {
    try {
      console.log('Fetching interviewer questions...');
      const url = `${config.REACT_APP_API_URL}/interview-questions/get-questions`;
      const response = await axios.get(url);
      console.log('Interviewer questions fetched successfully:', response.data.questions.length);

      const formattedList = response.data.questions.map((question) => ({
        id: question._id,
        question: question.snapshot.questionText,
        answer: question.snapshot.correctAnswer,
        note: '',
        notesBool: false,
        isLiked: false,
      }));

      setInterviewerSectionData(formattedList);
    } catch (error) {
      console.error('Error fetching interviewer questions:', error);
    }
  }, []);

  useEffect(() => {
    getInterviewerQuestions();
  }, [getInterviewerQuestions]);

  // Fetch My Questions Data
  const fetchMyQuestionsData = useCallback(async () => {
    try {
      console.log('Fetching my questions data...');
      const filteredPositions = await fetchFilterData('tenentquestions', sharingPermissions);
      console.log('My questions data filtered:', filteredPositions);

      const newObject = Object.keys(filteredPositions).reduce((acc, key) => {
        acc[key] = Array.isArray(filteredPositions[key])
          ? filteredPositions[key].map((each) => ({ ...each, isAdded: false }))
          : [];
        return acc;
      }, {});

      console.log('Processed my questions data:', newObject);
      setMyQuestionsList(newObject);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions]);

  // Fetch Created Lists
  const fetchLists = useCallback(async () => {
    try {
      console.log(`Fetching lists for user ${userId}...`);
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`);
      console.log('User lists fetched successfully:', response.data);
      setCreatedLists(response.data.reverse());
    } catch (error) {
      console.error('Error fetching lists:', error);
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
        console.log('Fetching suggested questions...');
        const response = await axios.get(`${config.REACT_APP_API_URL}/suggested-questions/questions`);
        console.log('Suggested questions response:', response.data);

        if (response.data.success) {
          const newList = response.data.questions.map((question) => ({ ...question, isAdded: false }));
          console.log('Processed suggested questions:', newList);
          setSuggestedQuestions(newList);
          setSuggestedQuestionsFilteredData(newList);
        }
      } catch (error) {
        console.error('Error fetching suggested questions:', error);
      }
    };

    getQuestions();
  }, []);

  const queryClient = useQueryClient();

  // candidate
  // const sharingPermissionscandidate = useMemo(
  //   () => sharingPermissionscontext.candidate || {},
  //   [sharingPermissionscontext]
  // );

  // const { data: candidateData = [], isLoading: candidatesLoading } = useQuery({
  //   queryKey: ['candidates', sharingPermissionscandidate],
  //   queryFn: async () => {
  //     const filteredCandidates = await fetchFilterData('candidate', sharingPermissionscandidate);

  //     return filteredCandidates
  //       .map((candidate) => {
  //         if (candidate.ImageData?.filename) {
  //           return {
  //             ...candidate,
  //             imageUrl: `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`,
  //           };
  //         }
  //         return candidate;
  //       })
  //       .reverse(); // show most recent first
  //   },
  //   enabled: !!sharingPermissionscandidate, // only run when permissions are available
  // });

  // // 3. Create a mutation for adding/updating candidate
  // const addOrUpdateCandidate = useMutation({
  //   mutationFn: async ({ id, data, file }) => {
  //     const url = id ? `${config.REACT_APP_API_URL}/candidate/${id}` : `${config.REACT_APP_API_URL}/candidate`;

  //     const method = id ? 'patch' : 'post';
  //     const response = await axios[method](url, data);

  //     const candidateId = response.data.data._id;

  //     if (file) {
  //       const imageData = new FormData();
  //       imageData.append('image', file);
  //       imageData.append('type', 'candidate');
  //       imageData.append('id', candidateId);

  //       await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
  //         headers: { 'Content-Type': 'multipart/form-data' },
  //       });
  //     }

  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['candidates']); // ✅ Refreshes the list
  //   },
  // });

  // position fetch
  const sharingPermissionsPosition = useMemo(
    () => sharingPermissionscontext.position || {},
    [sharingPermissionscontext]
  );

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
      const url = id ? `${config.REACT_APP_API_URL}/position/${id}` : `${config.REACT_APP_API_URL}/position`;

      const method = id ? 'patch' : 'post';
      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['positions']);
    },
  });

  // Mockinterview
  const sharingPermissionsMock = useMemo(
    () => sharingPermissionscontext.mockInterviews || {},
    [sharingPermissionscontext]
  );

  // Query for fetching mock interviews
  const {
    data: mockinterviewData = [],
    isLoading: mockInterviewsLoading,
    refetch: refetchMockInterviews
  } = useQuery({
    queryKey: ['mockinterviews', sharingPermissionsMock],
    queryFn: async () => {
      const filteredInterviews = await fetchFilterData('mockinterview', sharingPermissionsMock);
      return filteredInterviews.reverse(); // Show most recent first
    },
    enabled: !!sharingPermissionsMock,
  });

  // Mutation for creating/updating mock interviews
  const addOrUpdateMockInterview = useMutation({
    mutationFn: async ({ formData, id, isEdit, userId, organizationId }) => {
      const status = formData.rounds.interviewers?.length > 0 ? "Requests Sent" : "Draft";

      const payload = {
        skills: formData.entries?.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        Role: formData.Role,
        candidateName: formData.candidateName,
        higherQualification: formData.higherQualification,
        currentExperience: formData.currentExperience,
        technology: formData.technology,
        jobDescription: formData.jobDescription,
        rounds: {
          ...formData.rounds,
          dateTime: formData.combinedDateTime, // Expecting combinedDateTime in formData
          status: status,
        },
        createdById: userId,
        lastModifiedById: userId,
        ownerId: userId,
        tenantId: organizationId,
      };

      const url = isEdit
        ? `${process.env.REACT_APP_API_URL}/updateMockInterview/${id}`
        : `${process.env.REACT_APP_API_URL}/mockinterview`;

      const response = await axios[isEdit ? 'patch' : 'post'](url, payload);

      // Handle interviewer requests if any
      if (formData.rounds.interviewers?.length > 0) {
        await Promise.all(
          formData.rounds.interviewers.map(async (interviewer) => {
            const outsourceRequestData = {
              tenantId: organizationId,
              ownerId: userId,
              scheduledInterviewId: interviewer,
              id: interviewer._id,
              dateTime: formData.combinedDateTime,
              duration: formData.rounds.duration,
              candidateId: formData.candidate?._id,
              roundId: response.data.savedRound._id,
              requestMessage: "Outsource interview request",
              expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            };
            await axios.post(`${process.env.REACT_APP_API_URL}/interviewrequest`, outsourceRequestData);
          })
        );
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['mockinterviews']); // Refresh the list
      // You can add navigation here if needed
      // variables.navigate('/mockinterview');
    },
    onError: (error) => {
      console.error("Mock interview error:", error);
      // You can add toast notifications here
      // toast.error(error.message);
    }
  });

  // const fetchMockInterviewData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const filteredInterviews = await fetchFilterData('mockinterview', sharingPermissionsMock);
  //     setmockinterviewData(filteredInterviews.reverse());
  //   } catch (error) {
  //     // console.error('Error fetching InterviewData:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissionsMock]);

  // useEffect(() => {
  //   fetchMockInterviewData();
  // }, [fetchMockInterviewData]);

  // teams
  // const sharingPermissionsTeam = useMemo(
  //   () => sharingPermissionscontext.team || {},
  //   [sharingPermissionscontext]
  // );

  // const [teamsData, setTeamsData] = useState([]);
  // const fetchTeamsData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const filteredTeams = await fetchFilterData('team', sharingPermissionsTeam);

  //     const teamsWithContacts = filteredTeams.map((team) => {
  //       let processedTeam = { ...team };

  //       // Process image URL if exists
  //       if (team.ImageData && team.ImageData.filename) {
  //         const imageUrl = `${config.REACT_APP_API_URL}/${team.ImageData.path.replace(/\\/g, '/')}`;
  //         processedTeam.imageUrl = imageUrl;
  //       }

  //       // Process availability data if exists
  //       if (team.contactId && team.contactId.availability) {
  //         // Format availability data for easier frontend use
  //         const availabilityData = team.contactId.availability.map((schedule) => ({
  //           contactId: schedule.contact,
  //           schedule: schedule.days.map((day) => ({
  //             day: day.day,
  //             timeSlots: day.timeSlots.map((slot) => ({
  //               startTime: new Date(slot.startTime),
  //               endTime: new Date(slot.endTime),
  //             })),
  //           })),
  //         }));
  //         processedTeam.availabilitySchedule = availabilityData;
  //       }
  //       return processedTeam;
  //     });
  //     setTeamsData(teamsWithContacts);
  //   } catch (error) {
  //     // console.error('Error fetching team data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissionsTeam]);

  // useEffect(() => {
  //   fetchTeamsData();
  // }, [fetchTeamsData]);

  // interview
  const sharingPermissionsInterview = useMemo(
    () => sharingPermissionscontext.interviews || {},
    [sharingPermissionscontext]
  );

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
            const candidateResponse = await axios.get(`${config.REACT_APP_API_URL}/candidate/${interview.CandidateId}`);
            const candidate = candidateResponse.data;
            if (candidate.ImageData && candidate.ImageData.filename) {
              candidate.imageUrl = `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
            }
            return {
              ...interview,
              candidate,
            };
          } catch (error) {
            // console.error(error);
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
      // console.error('Error fetching InterviewData:', error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissionsInterview]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  // outsource interviewers
  const [Outsourceinterviewers, setOutsourceInterviewers] = useState([]);
  const fetchoutsourceInterviewers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/outsourceInterviewers`);
      const reversedData = response.data.reverse();
      setOutsourceInterviewers(reversedData);
    } catch (err) {
      // console.error('❌ Error fetching interviewers:', err);
    }
  }, []);

  useEffect(() => {
    fetchoutsourceInterviewers();
  }, [fetchoutsourceInterviewers]);

  // notifications
  const [notificationsData] = useState([]);

  const [assessmentData, setAssessmentData] = useState([]);
  const assessmentPermissions = useMemo(
    () => sharingPermissionscontext.assessment || {},
    [sharingPermissionscontext]
  );

  const fetchAssessmentData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredAssessments = await fetchFilterData('assessment', assessmentPermissions);
      // Reverse the data to show the most recent first
      const reversedData = filteredAssessments.reverse();
      setAssessmentData(reversedData);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    } finally {
      setLoading(false);
    }
  }, [assessmentPermissions]);

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]);

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
          tenantId: tenantId,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        console.error('Invalid groups data format:', response.data);
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error.response?.data?.error || error.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchGroupsData();
  }, [fetchGroupsData]);

  // users
  const [usersData, setUsersData] = useState([]);

  // Fetch users data
  const fetchUsersData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
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
        `${config.REACT_APP_API_URL}/assessment-questions/${assessmentId}`
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

  // interview template
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['interviewTemplates', tenantId],
    queryFn: async () => {
      const apiUrl = `${process.env.REACT_APP_API_URL}/interviewTemplates?tenantId=${tenantId}`;
      const response = await axios.get(apiUrl);
      return response.data.data;
    },
    enabled: !!tenantId,
  });

  // Mutation for creating/updating templates
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ id, templateData, isEditMode }) => {
      let response;
      if (isEditMode) {
        response = await axios.patch(`${process.env.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          templateData,
        });
      } else {
        response = await axios.post(`${process.env.REACT_APP_API_URL}/interviewTemplates`, {
          ...templateData,
          tenantId,
        });
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewTemplates']); // Refresh templates list
    },
  });

  // organization code
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
    retry: false,
  });

  const addOrUpdateOrganization = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const url = `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`;
      const method = 'patch';
      const response = await axios[method](url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const organizationId = response.data.data._id;

      // Handle image upload if a file is provided
      if (file) {
        const imageData = new FormData();
        imageData.append('image', file);
        imageData.append('type', 'organization');
        imageData.append('id', organizationId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']); // ✅ Refresh the org list
    },
  });

  const [contacts, setContacts] = useState([]);

  const fetchContactsData = async () => {
    try {
      const allUsers = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
      const allUsers_data = allUsers.data;

      setContacts(allUsers_data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsData();
  }, []);

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

        // // candidate
        // candidateData,
        // candidatesLoading,
        // addOrUpdateCandidate,

        // position
        positions,
        isPositionsLoading,
        addOrUpdatePosition,

        // mockinterview
        mockinterviewData,
        mockInterviewsLoading,
        addOrUpdateMockInterview,

        // teams
        // teamsData,
        // fetchTeamsData,

        // outsource interviewers
        Outsourceinterviewers,
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
        saveTemplateMutation,
        templatesLoading,

        // organization
        organizationData,
        organizationsLoading,
        addOrUpdateOrganization,

        // contacts
        fetchContactsData,
        contacts,
        setContacts,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};

const useCustomContext = () => useContext(CustomContext);

export { useCustomContext, CustomProvider };