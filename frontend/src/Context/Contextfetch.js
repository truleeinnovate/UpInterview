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
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;






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
      const url = `${config.REACT_APP_API_URL}/interview-questions/get-questions`;
      const response = await axios.get(url);

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
      const filteredPositions = await fetchFilterData('tenentquestions', sharingPermissions);

      const newObject = Object.keys(filteredPositions).reduce((acc, key) => {
        acc[key] = Array.isArray(filteredPositions[key])
          ? filteredPositions[key].map((each) => ({ ...each, isAdded: false }))
          : [];
        return acc;
      }, {});

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
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`);
      setCreatedLists(response.data.reverse());
    } catch (error) {
      // console.error('Error fetching lists:', error);
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
        ? `${config.REACT_APP_API_URL}/updateMockInterview/${id}`
        : `${config.REACT_APP_API_URL}/mockinterview`;

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
            await axios.post(`${config.REACT_APP_API_URL}/interviewrequest`, outsourceRequestData);
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

  const assessmentPermissions = useMemo(
    () => sharingPermissionscontext.assessment || {},
    [sharingPermissionscontext]
  );

  const { data: assessmentData = [], isLoading: assessmentDataLoading } =
    useQuery({
      queryKey: ['assessments', assessmentPermissions],
      queryFn: async () => {
        const filteredAssessments = await fetchFilterData('assessment', assessmentPermissions);
        return filteredAssessments.reverse(); // recent first
      },
      enabled: !!assessmentPermissions,
    });

  const useAddOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      let response;

      if (isEditing) {
        // Update existing assessment
        response = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData
        );
      } else {
        if (!tabsSubmitStatus?.["Basicdetails"]) {
          // Create new assessment
          response = await axios.post(
            `${config.REACT_APP_API_URL}/assessments/new-assessment`,
            assessmentData
          );
        } else {
          // Update after Basicdetails
          response = await axios.patch(
            `${config.REACT_APP_API_URL}/assessments/update/${tabsSubmitStatus.responseId}`,
            assessmentData
          );
        }
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']); // Refresh list
    },
    onError: (error) => {
      console.error('Assessment save error:', error.message);
      // You might want to show a toast notification here
    }
  });



  const useUpsertAssessmentQuestions = useMutation({
    mutationFn: async (questionsData) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        questionsData
      );
      return response.data;
    }
  });

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
      const response = await axios.get(`${config.REACT_APP_API_URL}/groups/data`, {
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
      const response = await axios.get(`${config.REACT_APP_API_URL}/users`);
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
  const { data: templates = [], isLoading: templatesLoading, error } = useQuery({
    queryKey: ['interviewTemplates', tenantId, userId],
    queryFn: async () => {
      try {
        let queryString = '';
        if (organization) {
          queryString = `tenantId=${tenantId}&organization=true`;
        } else {
          queryString = `ownerId=${userId}&organization=false`;
        }
        const apiUrl = `${config.REACT_APP_API_URL}/interviewTemplates?${queryString}`;
        const headers = { Authorization: `Bearer ${authToken}` };
        const response = await axios.get(apiUrl, { headers });
        const templatesData = response.data.data;

        return templatesData;
      } catch (err) {
        console.error('Error fetching templates:', err);
        throw err; // Let react-query handle the error
      }
    },
    enabled: !!authToken,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Log error if it occurs
  if (error) {
    console.error('useQuery error:', error.message);
  }


  // Mutation for creating/updating templates
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ id, templateData, isEditMode }) => {
      let response;
      if (isEditMode) {
        response = await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          ownerId: userId,
          templateData,
        });
      } else {
        response = await axios.post(`${config.REACT_APP_API_URL}/interviewTemplates`, {
          ...templateData,
          tenantId,
          ownerId: userId,
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


  const [singlecontact, setsingleContact] = useState([]);

// console.log("singlecontact", singlecontact);


   

  useEffect(() => {
    const fetchContacts = async (usersId = null) => {
      try {



        const res = await axios.get(`${config.REACT_APP_API_URL}/contacts/owner/${userId}`);
        setsingleContact(res.data);
      } catch (err) {
        console.error('Error fetching user contacts:', err);
      }
    };
  
    fetchContacts();
  }, [userId]);




  // getting interveiwers and showing it in the home (available interviewers) and interveiwers
  const [interviewers, setInterviewers] = useState([]);
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/users/interviewers/${tenantId}`);

        setInterviewers(response.data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviewers();
  }, [tenantId]);



  // Query for fetching users
  const {
    data: usersRes = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/users/${tenantId}`
      );

      // Process image URLs and reverse the array (newest first)
      return response.data
        .map((contact) => {
          if (contact.imageData?.filename) {
            const imageUrl = `${config.REACT_APP_API_URL}/${contact.imageData.path.replace(/\\/g, '/')}`;
            return { ...contact, imageUrl };
          }
          return contact;
        })
        .reverse();
    },
    enabled: !!tenantId,
  });

  // console.log("usersRes", usersRes);
  

  // Mutation for creating/updating users
  const addOrUpdateUser = useMutation({
    mutationFn: async ({ userData, file, editMode }) => {
      const payload = {
        UserData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          tenantId: userData.tenantId,
          phone: userData.phone,
          roleId: userData.roleId,
          countryCode: userData.countryCode,
          isProfileCompleted: false,
          ...(editMode && { _id: userData._id }) // Only include _id in edit mode
        },
        contactData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          tenantId: userData.tenantId,
          countryCode: userData.countryCode
        }
      };

      // Use the same endpoint for both create and edit
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Organization/new-user-Creation`,
        payload
      );

      // Handle image upload if file is present
      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "contact");
        imageData.append("id", response.data.contactId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (!userData.imageUrl && editMode) {
        // Delete image if no file and no existing image in edit mode
        await axios.delete(`${config.REACT_APP_API_URL}/contact/${response.data.contactId}/image`);
      }

      // Send welcome email only for new user creation
      if (!editMode) {
        await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
          email: userData.email,
          type: "usercreatepass"
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh the users list
    },
    onError: (error) => {
      console.error("User operation error:", error);
      // You can add toast notifications here
      // toast.error(error.response?.data?.message || "An error occurred");
    }
  });

  // Mutation for toggling user status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/users/${userId}/status`,
        {
          status: newStatus, // or you could send the new status explicitly
          updatedBy: `${userId}` // Track who made the change
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh the users list
    },
    onError: (error) => {
      console.error("Status toggle error:", error);
      // toast.error("Failed to update user status");
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/users/${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh the users list
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      // toast.error("Failed to delete user");
    }
  });


  const [currentPlan, setcurrentPlan] = useState([]);
  // const [loading, setLoading] = useState(true);
  // this will check that that plans is already set or not

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Sub_res = await axios.get(`${config.REACT_APP_API_URL}/subscriptions/${userId}`);
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        // If subscription exists, set it; otherwise, keep it empty

        if (Subscription_data.subscriptionPlanId) {
          setcurrentPlan(Subscription_data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const [walletBalance, SetWalletBalance] = useState([]);
  // const [loading, setLoading] = useState(true);
  // this will check that that plans is already set or not

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const WalletBalance_res = await axios.get(`${config.REACT_APP_API_URL}/wallet/${userId}`);
        const WalletBalance_data = WalletBalance_res.data || {};


        if (WalletBalance_data) {
          SetWalletBalance(WalletBalance_data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (userId) {
      fetchWalletData();
    }
  }, [userId]);

  const [tickets, setTickets] = useState([]);

  const [userRole, setuserRole] = useState("Admin");

  const getTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/get-tickets`);
      let filteredTickets = response.data.tickets || [];
      console.log("Fetched tickets:", filteredTickets);

      if (userRole === "SuperAdmin" || userRole === "Support Team") {
        console.log("Role: SuperAdmin or Support Team - showing all tickets");
        setTickets(filteredTickets);
      } else if (userRole === "Admin" && tenantId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.tenantId === tenantId
        );
        console.log("Role: Admin - filtered by tenantId", tenantId, filteredTickets);
        setTickets(filteredTickets);
      } else if (userRole === "Individual" && userId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.ownerId === userId
        );
        console.log("Role: Individual - filtered by ownerId", userId, filteredTickets);
        setTickets(filteredTickets);
      } else if (userId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.assignedToId === userId
        );
        console.log("Other role - filtered by assignedToId", userId, filteredTickets);
        setTickets(filteredTickets);
      } else {
        console.log("No matching role or userId - setting tickets to empty");
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, tenantId, userId]);

  useEffect(() => {
    getTickets();
  }, [getTickets]);

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

        // users
        usersRes,
        usersLoading,
        refetchUsers,
        addOrUpdateUser,
        toggleUserStatus,
        deleteUser,

        // wallet Balance
        walletBalance,

        // subscription current plan 
        currentPlan,

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
        useAddOrUpdateAssessment,
        useUpsertAssessmentQuestions,


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
        singlecontact,
        // fetchContacts,

        interviewers,

        tickets,
        userRole
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};

const useCustomContext = () => useContext(CustomContext);

export { useCustomContext, CustomProvider };