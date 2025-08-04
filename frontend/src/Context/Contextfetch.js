import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../config.js";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "../apiHooks/imageApis.js";
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";

const CustomContext = createContext();

const CustomProvider = ({ children }) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const impersonatedUserId = Cookies.get("impersonatedUserId");

  const [userRole, setuserRole] = useState("Admin");

  // const { sharingPermissionscontext = {} } = usePermissions() || {};
  // const sharingPermissions = useMemo(
  //   () => sharingPermissionscontext.questionBank || {},
  //   [sharingPermissionscontext]
  // );

  // const [pagination, setPagination] = useState(6);
  // const [iter] = useState(6);
  // const [searchText, setSearchText] = useState('');
  // const [isOpen, setIsopen] = useState(false);
  const [page, setPage] = useState("Home");
  // const [popupVisibility, setPopupVisibility] = useState(false);
  // const [feedbackCloseFlag, setFeedbackCloseFlag] = useState(false);
  // const [createdLists, setCreatedLists] = useState([]);

  const [interviewerSectionData, setInterviewerSectionData] = useState([
    {
      id: 1,
      question: "Tell me about your experience with React",
      answer: "Sample answer about React experience",
      mandatory: true,
      isAnswered: "Not Answered",
      notesBool: false,
      note: ""
    },
    {
      id: 2,
      question: "How do you handle state management?",
      answer: "Sample answer about state management",
      mandatory: false,
      isAnswered: "Not Answered",
      notesBool: false,
      note: ""
    }
  ]);
  const [SchedulerSectionData, setSchedulerSectionData] = useState([]);
  
  // Overall impression tab data
  const [overallImpressionTabData, setOverallImpressionTabData] = useState({
    rating: 0,
    note: '',
    recommendation: '',
    notesBool: false
  });
  
  // Candidate data
  const [candidateData, setCandidateData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    experience: "5 years",
    currentRole: "Senior Developer",
    companyName: "Tech Corp",
    skillsList: "React, JavaScript, Node.js"
  });
  
  // Skills tab data
  const [skillsTabData, setSkillsTabData] = useState([
    {
      id: 1,
      category: "Technical Skills",
      skillsList: [
        {
          name: "React",
          rating: 4,
          required: true,
          note: ""
        },
        {
          name: "JavaScript",
          rating: 5,
          required: true,
          note: ""
        }
      ]
    },
    {
      id: 2,
      category: "Soft Skills",
      skillsList: [
        {
          name: "Communication",
          rating: 3,
          required: false,
          note: ""
        }
      ]
    }
  ]);
  const [feedbackTabErrors, setFeedbackTabError] = useState({
    interviewQuestion: true,
    skills: true,
    overallImpression: true,
  });
  // const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  // const [suggestedQuestionsFilteredData, setSuggestedQuestionsFilteredData] = useState([]);
  // const [myQuestionsList, setMyQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [locations, setLocations] = useState([]);
  // const [industries, setIndustries] = useState([]);
  // const [currentRole, setCurrentRole] = useState([]);

  // master data fetch
  // const [skills, setSkills] = useState([]);
  // const [qualification, setQualification] = useState([]);
  // const [college, setCollege] = useState([]);
  // const [companies, setCompanies] = useState([]);
  // const [technologies, setTechnology] = useState([]);

  // users data
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/auth/users/${userId}`
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch My Questions Data
  // const fetchMyQuestionsData = useCallback(async () => {
  //   try {
  //     const filteredPositions = await fetchFilterData('tenentquestions', sharingPermissions);

  //     const newObject = Object.keys(filteredPositions).reduce((acc, key) => {
  //       acc[key] = Array.isArray(filteredPositions[key])
  //         ? filteredPositions[key].map((each) => ({ ...each, isAdded: false }))
  //         : [];
  //       return acc;
  //     }, {});

  //     setMyQuestionsList(newObject);
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissions]);

  // // Fetch Created Lists
  // const fetchLists = useCallback(async () => {
  //   try {
  //     const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`);
  //     setCreatedLists(response.data.reverse());
  //   } catch (error) {
  //     // console.error('Error fetching lists:', error);
  //   }
  // }, [userId]);

  // useEffect(() => {
  //   fetchMyQuestionsData();
  //   fetchLists();
  // }, [fetchMyQuestionsData, fetchLists]);

  // Fetch Suggested Questions
  // useEffect(() => {
  //   const getQuestions = async () => {
  //     try {
  //       const response = await axios.get(`${config.REACT_APP_API_URL}/suggested-questions/questions`);

  //       if (response.data.success) {
  //         const newList = response.data.questions.map((question) => ({ ...question, isAdded: false }));
  //         setSuggestedQuestions(newList);
  //         // setSuggestedQuestionsFilteredData(newList);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching suggested questions:', error);
  //     }
  //   };

  //   getQuestions();
  // }, []);

  const queryClient = useQueryClient();

  // outsource interviewers
  const [outsourceInterviewers, setOutsourceInterviewers] = useState([]);
  const fetchOutsourceInterviewers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/outsourceInterviewers`
      );
      const reversedData = response.data.reverse();
      setOutsourceInterviewers(reversedData);
    } catch (err) {
      // console.error('❌ Error fetching interviewers:', err);
    }
  }, []);

  useEffect(() => {
    fetchOutsourceInterviewers();
  }, [fetchOutsourceInterviewers]);

  // notifications
  const [notificationsData] = useState([]);

  // Fetch groups
  const [groups, setGroups] = useState([]);

  const fetchGroupsData = useCallback(async () => {
    if (!tenantId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/data`,
        {
          params: {
            tenantId: tenantId,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        console.error("Invalid groups data format:", response.data);
        setGroups([]);
      }
    } catch (error) {
      console.error(
        "Error fetching groups:",
        error.response?.data?.error || error.message
      );
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
  // console.log('usersData in context to check subdomain :-', usersData)

  // Fetch users data
  const fetchUsersData = async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/users`);
      setUsersData(response.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // organization code
  const {
    data: organizationData,
    isLoading: organizationsLoading,
    error: organizationError,
  } = useQuery({
    queryKey: ["organization", tenantId],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error("Invalid organization ID");
      }
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/organization-details/${tenantId}`
      );
      return response.data;
    },
    enabled: !!tenantId,
    retry: false,
  });

  const addOrUpdateOrganization = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const url = `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`;
      const method = "patch";
      const response = await axios[method](url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["organizations"]); // ✅ Refresh the org list
    },
  });

  const [contacts, setContacts] = useState([]);

  const fetchContactsData = async () => {
    try {
      const allUsers = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
      const allUsers_data = allUsers.data;

      setContacts(allUsers_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsData();
  }, []);

  // Removed singlecontact logic - now using useSingleContact hook from apiHooks

  // fetching super admin
  // const [superAdminProfile, setSuperAdminProfile] = useState([]);
  // useEffect(() => {
  //   const fetchContacts = async (usersId = null) => {
  //     try {
  //       const res = await axios.get(
  //         `${config.REACT_APP_API_URL}/users/owner/${impersonatedUserId}`
  //       );
  //       setSuperAdminProfile(res.data);
  //       // console.log("SUPER ADMIN USER: ", res.data);
  //     } catch (err) {
  //       console.error("Error fetching user contacts:", err);
  //     }
  //   };

  //   fetchContacts();
  // }, [impersonatedUserId]);

  // getting interviewers and showing it in the home (available interviewers) and interviewers
  const [interviewers, setInterviewers] = useState([]);
  const [loadingInterviewer, setLoadingInterviewer] = useState(false);

  const fetchInterviewers = useCallback(async () => {
    if (!tenantId) return;

    let isMounted = true;

    try {
      setLoadingInterviewer(true);
      // console.log("Fetching interviewers for tenantId:", tenantId);
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/users/interviewers/${tenantId}`
      );

      if (isMounted) {
        // console.log("Interviewers data received:", response.data);
        setInterviewers(response.data);
      }
    } catch (err) {
      // console.error("Error fetching interviewers:", err.message);
    } finally {
      if (isMounted) {
        setLoadingInterviewer(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  // Query for fetching users
  const {
    data: usersRes = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users", tenantId],
    queryFn: async () => {
      if (!tenantId) return []; // Skip fetch for super admins without tenantId
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/users/${tenantId}`
      );
      return response.data
        .map((contact) => {
          if (contact.imageData?.filename) {
            const imageUrl = `${config.REACT_APP_API_URL
              }/${contact.imageData.path.replace(/\\/g, "/")}`;
            return { ...contact, imageUrl };
          }
          return contact;
        })
        .reverse();
    },
    enabled: !!tenantId, // Only fetch if tenantId exists
  });

  // Mutation for creating/updating users
  // const addOrUpdateUser = useMutation({
  //   mutationFn: async ({ userData, file, isFileRemoved, editMode }) => {
  //     const payload = {
  //       UserData: {
  //         firstName: userData.firstName,
  //         lastName: userData.lastName,
  //         email: userData.email,
  //         tenantId: userData.tenantId,
  //         phone: userData.phone,
  //         roleId: userData.roleId,
  //         countryCode: userData.countryCode,
  //         status: userData.status,
  //         isProfileCompleted: false,
  //         isEmailVerified: true,
  //         ...(editMode && { _id: userData._id }), // Only include _id in edit mode
  //         editMode,
  //       },
  //       contactData: {
  //         firstName: userData.firstName,
  //         lastName: userData.lastName,
  //         email: userData.email,
  //         phone: userData.phone,
  //         tenantId: userData.tenantId,
  //         countryCode: userData.countryCode,
  //       },
  //     };

  //     // Use the same endpoint for both create and edit
  //     const response = await axios.post(
  //       `${config.REACT_APP_API_URL}/Organization/new-user-Creation`,
  //       payload
  //     );

  //     // UPLOADING FILES LIKE IMAGES AND RESUMES
  //     if (isFileRemoved && !file) {
  //       await uploadFile(null, "image", "contact", response.data.contactId);
  //     } else if (file instanceof File) {
  //       await uploadFile(file, "image", "contact", response.data.contactId);
  //     }

  //     // Send welcome email only for new user creation
  //     if (!editMode) {
  //       await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
  //         email: userData.email,
  //         type: "usercreatepass",
  //       });
  //     }

  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(["users"]); // Refresh the users list
  //   },
  //   onError: (error) => {
  //     console.error("User operation error:", error);
  //     // You can add toast notifications here
  //     // toast.error(error.response?.data?.message || "An error occurred");
  //   },
  // });

  const addOrUpdateUser = useMutation({
    mutationFn: async ({ userData, file, isFileRemoved, editMode }) => {
      console.log('addOrUpdateUser mutation payload:', { userData, editMode });
      const payload = {
        UserData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          tenantId: userData.tenantId, // Will be null for super admins
          phone: userData.phone,
          roleId: userData.roleId,
          countryCode: userData.countryCode,
          status: userData.status,
          isProfileCompleted: false,
          isEmailVerified: true,
          type: userData.type, // Include type
          ...(editMode && { _id: userData._id }), // Only include _id in edit mode
          editMode,
        },
        contactData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          tenantId: userData.tenantId, // Will be null for super admins
          countryCode: userData.countryCode,
        },
      };

      console.log('Sending payload to /Organization/new-user-Creation:', payload);
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Organization/new-user-Creation`,
        payload
      );

      // UPLOADING FILES LIKE IMAGES AND RESUMES
      if (isFileRemoved && !file) {
        console.log('Removing file for contactId:', response.data.contactId);
        await uploadFile(null, "image", "contact", response.data.contactId);
      } else if (file instanceof File) {
        console.log('Uploading file for contactId:', response.data.contactId);
        await uploadFile(file, "image", "contact", response.data.contactId);
      }

      // Send welcome email only for new user creation
      if (!editMode) {
        console.log(`Sending welcome email to: ${userData.email}`);
        await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
          email: userData.email,
          type: "usercreatepass",
        });
      }

      return response.data;
    },
    onSuccess: () => {
      console.log('User operation successful, invalidating users query');
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      console.error("User operation error:", error);
    },
  });


  // Mutation for toggling user status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/users/${userId}/status`,
        {
          status: newStatus, // or you could send the new status explicitly
          updatedBy: `${userId}`, // Track who made the change
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // Refresh the users list
    },
    onError: (error) => {
      console.error("Status toggle error:", error);
      // toast.error("Failed to update user status");
    },
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
      queryClient.invalidateQueries(["users"]); // Refresh the users list
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      // toast.error("Failed to delete user");
    },
  });

  const [currentPlan, setcurrentPlan] = useState([]);
  // const [loading, setLoading] = useState(true);
  // this will check that that plans is already set or not

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Sub_res = await axios.get(
          `${config.REACT_APP_API_URL}/subscriptions/${userId}`
        );
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        // If subscription exists, set it; otherwise, keep it empty

        if (Subscription_data.subscriptionPlanId) {
          setcurrentPlan(Subscription_data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
        const WalletBalance_res = await axios.get(
          `${config.REACT_APP_API_URL}/wallet/${userId}`
        );
        const WalletBalance_data = WalletBalance_res.data || {};

        if (WalletBalance_data) {
          SetWalletBalance(WalletBalance_data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userId) {
      fetchWalletData();
    }
  }, [userId]);

  const [tickets, setTickets] = useState([]);

  const getTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/get-tickets`
      );
      let filteredTickets = response.data.tickets || [];

      if (userRole === "SuperAdmin" || userRole === "Support Team") {
        setTickets(filteredTickets);
      } else if (userRole === "Admin" && tenantId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.tenantId === tenantId
        );
        setTickets(filteredTickets);
      } else if (userRole === "Individual" && userId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.ownerId === userId
        );
        setTickets(filteredTickets);
      } else if (userId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.assignedToId === userId
        );
        setTickets(filteredTickets);
      } else {
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

  // <-- interview rounds to show the data in the home for upcoming interviews -->
  const [interviewRounds, setInterviewRounds] = useState([]);

  const fetchInterviewRounds = useCallback(async () => {
    try {
      // Fetch all interview rounds with interviewId populated
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/interviewRounds?populate=interviewId`
      );
      // You may need to adjust the API endpoint to support population if not already
      setInterviewRounds(response.data.reverse());
    } catch (error) {
      console.error("Error fetching interview rounds:", error);
      setInterviewRounds([]);
    }
  }, []);

  useEffect(() => {
    fetchInterviewRounds();
  }, [fetchInterviewRounds]);

  return (
    <CustomContext.Provider
      value={{
        // getInterviewerQuestions,

        // fetchMyQuestionsData,
        // myQuestionsList,
        // setMyQuestionsList,
        // createdLists,
        // // setCreatedLists,
        // fetchLists,
        // suggestedQuestions,
        // setSuggestedQuestions,
        // suggestedQuestionsFilteredData,
        // setSuggestedQuestionsFilteredData,
        // feedbackCloseFlag,
        // setFeedbackCloseFlag,
        // popupVisibility,
        // setPopupVisibility,
        // feedbackTabErrors,
        // setFeedbackTabError,
        page,
        setPage,
        // isOpen,
        // setIsopen,
        // iter,
        // searchText,
        // setSearchText,
        // setPagination,
        // pagination,

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

        // teams
        // teamsData,
        // fetchTeamsData,

        // outsource interviewers
        outsourceInterviewers,
        fetchOutsourceInterviewers,

        // master data
        // skills,
        // qualification,
        // college,
        // companies,
        // technologies,
        // locations,
        // industries,
        // currentRole,
        // notifications
        notificationsData,
        // user
        userProfile,

        // groups
        groups,
        fetchGroupsData,

        // users
        usersData,
        fetchUsersData,

        // organization
        organizationData,
        organizationsLoading,
        addOrUpdateOrganization,

        // contacts
        fetchContactsData,
        contacts,
        setContacts,
        // singlecontact - now using useSingleContact hook from apiHooks
        // fetchContacts,

        interviewers,
        loadingInterviewer,
        setLoadingInterviewer,
        fetchInterviewers,

        tickets,
        userRole,

        interviewRounds,
        fetchInterviewRounds,
        
        // interviewer section data
        interviewerSectionData,
        setInterviewerSectionData,
        
        // scheduler section data
        SchedulerSectionData,
        setSchedulerSectionData,
        
        // overall impression tab data
        overallImpressionTabData,
        setOverallImpressionTabData,
        
        // skills tab data
        skillsTabData,
        setSkillsTabData,
        
        // candidate data
        candidateData,
        setCandidateData,
        
        // superAdminProfile,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};

const useCustomContext = () => useContext(CustomContext);

export { useCustomContext, CustomProvider };
