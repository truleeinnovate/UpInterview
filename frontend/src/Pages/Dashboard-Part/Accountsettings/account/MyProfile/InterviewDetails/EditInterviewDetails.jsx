// v1.0.0 - Ashok - Removed border left and set outline as none
// v1.0.1 - Ashok - Changed Maximize and Minimize icons to follow consistent design
// v1.0.2 - Ashok - Improved responsiveness and added common code to popup
// v1.0.3 - Ashok - Added loading view when saving the form

import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { X } from "lucide-react";
import axios from "axios";
import {
  isEmptyObject,
  validateInterviewForm,
} from "../../../../../../utils/MyProfileValidations";
import { useNavigate, useParams } from "react-router-dom";
import DropdownSelect from "../../../../../../Components/Dropdowns/DropdownSelect";
import { useMasterData } from "../../../../../../apiHooks/useMasterData";
import {
  useUpdateContactDetail,
  useUserProfile,
} from "../../../../../../apiHooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../../../../services/toastService";
// v1.0.1 --------------------------------------------------------------------------------->
// v1.0.2 <-----------------------------------------------------------------------------------
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import DropdownWithSearchField from "../../../../../../Components/FormFields/DropdownWithSearchField";
import {
  DescriptionField,
  InputField,
} from "../../../../../../Components/FormFields";
import LoadingButton from "../../../../../../Components/LoadingButton";
// v1.0.2 ----------------------------------------------------------------------------------->

const EditInterviewDetails = ({
  from,
  usersId,
  setInterviewEditOpen,
  onSuccess,
  yearsOfExperience = 0,
}) => {
  const skillsPopupRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const resolvedId = usersId || id;
  // v1.0.3 <--------------------------------------------------
  const [loading, setLoading] = useState(false);
  // v1.0.3 -------------------------------------------------->

  // Fetch user profile for "my-profile" context
  const { userProfile } = useUserProfile(
    resolvedId,
    // from === "my-profile" ? resolvedId : null
  );

  // Get the appropriate profile data based on context
  const profileData = useMemo(() => {
    // if (from === "outsource-interviewer") {
    //   // The ID in the URL is the Contact ID, not the OutsourceInterviewer ID
    //   // Try to find the interviewer by matching the contactId._id with resolvedId
    //   const interviewer = outsourceInterviewers?.find(
    //     (i) => i.contactId?._id === resolvedId
    //   );
    //   // Return the Contact object which has the actual profile data
    //   return interviewer?.contactId || null;
    // }
    return userProfile;
  }, [userProfile]);

  const updateContactDetail = useUpdateContactDetail();
  const queryClient = useQueryClient();

  // Add exchange rate state with a reasonable default for USD to INR
  const [exchangeRate, setExchangeRate] = useState(() => {
    // Try to get rate from localStorage on initial load
    const savedRate = localStorage.getItem("exchangeRate");
    return savedRate ? Number(savedRate) : 83.5; // Default fallback
  });
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState("");

  const skillsInputRef = useRef(null);

  // Update your existing fetchExchangeRate function
  const fetchExchangeRate = useCallback(async () => {
    // If we have a recent rate in localStorage, use it
    const lastUpdate = localStorage.getItem("exchangeRateLastUpdate");
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // If we have a recent rate, use it
    if (lastUpdate && new Date(lastUpdate) > new Date(oneHourAgo)) {
      const savedRate = localStorage.getItem("exchangeRate");
      if (savedRate) {
        setExchangeRate(Number(savedRate));
        return;
      }
    }

    setIsRateLoading(true);
    try {
      // Try our API first
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/exchange/rate/current`,
          {
            timeout: 3000,
          },
        );
        if (response.data && response.data.rate) {
          const rate = Number(response.data.rate);
          setExchangeRate(rate);
          setLastRateUpdate(new Date().toISOString());
          // Save to localStorage
          localStorage.setItem("exchangeRate", rate.toString());
          localStorage.setItem(
            "exchangeRateLastUpdate",
            new Date().toISOString(),
          );
          return;
        }
      } catch (apiError) {
        console.warn(
          "Primary exchange rate API failed, trying fallback...",
          apiError,
        );
      }

      // Fallback to a public API
      try {
        const response = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/USD",
          {
            timeout: 3000,
          },
        );
        if (response.data && response.data.rates && response.data.rates.INR) {
          const rate = Number(response.data.rates.INR.toFixed(2));
          setExchangeRate(rate);
          setLastRateUpdate(new Date().toISOString());
          // Save to localStorage
          localStorage.setItem("exchangeRate", rate.toString());
          localStorage.setItem(
            "exchangeRateLastUpdate",
            new Date().toISOString(),
          );
          return;
        }
      } catch (fallbackError) {
        console.warn("Fallback exchange rate API failed", fallbackError);
      }

      // If all else fails, use the default rate
      setExchangeRate(83.5);
    } catch (error) {
      console.error("Error in exchange rate fetching:", error);
      setExchangeRate(83.5); // Fallback to default
    } finally {
      setIsRateLoading(false);
    }
  }, []);

  // Update your useEffect for fetching exchange rate
  useEffect(() => {
    fetchExchangeRate();

    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // Get years of experience from profile data or props
  const expYears = parseInt(
    profileData?.yearsOfExperience || yearsOfExperience || 0,
    10,
  );

  const showJuniorLevel = expYears > 0;
  const showMidLevel = expYears >= 4;
  const showSeniorLevel = expYears >= 7;
  const pageType = "adminPortal";
  const {
    skills,
    loadSkills,
    isSkillsFetching,
    currentRoles,
    loadCurrentRoles,
    isCurrentRolesFetching,
  } = useMasterData({}, pageType);

  // State for form errors and loading
  const [errors, setErrors] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [showCustomDiscount, setShowCustomDiscount] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");

  const [formData, setFormData] = useState({
    PreviousExperienceConductingInterviews: "",
    PreviousExperienceConductingInterviewsYears: "",
    mock_interview_discount: "",
    currentRole: "",
    skills: [],
    professionalTitle: "",
    bio: "",
    interviewFormatWeOffer: [],
    yearsOfExperience: 0,
    rates: {
      junior: { usd: 0, inr: 0, isVisible: true },
      mid: { usd: 0, inr: 0, isVisible: false },
      senior: { usd: 0, inr: 0, isVisible: false },
    },
  });
  const [isMockInterviewSelected, setIsMockInterviewSelected] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  // const bioLength = formData.bio?.length || 0;

  // Check if form has changes compared to initial data
  const checkForChanges = useCallback(
    (updatedFormData) => {
      if (!initialFormData) return false;
      return (
        JSON.stringify(updatedFormData) !== JSON.stringify(initialFormData)
      );
    },
    [initialFormData],
  );

  // Update hasChanges when formData changes
  useEffect(() => {
    if (initialFormData) {
      setHasChanges(checkForChanges(formData));
    }
  }, [formData, initialFormData, checkForChanges]);

  // Fetch rate cards for a specific technology - moved here to avoid hoisting issue
  const fetchRateCardsMemoized = useCallback(async (techName) => {
    if (!techName) return;

    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.REACT_APP_API_URL || "";

      // Fetch all rate cards instead of searching by specific technology name
      // This allows us to filter client-side for roleName array matching
      const apiUrl = `${baseUrl}/rate-cards`;

      console.log("Fetching all rate cards from:", apiUrl);

      const response = await axios.get(apiUrl, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        const rateCardsData = Array.isArray(response.data)
          ? response.data
          : [response.data];

        console.log("Total rate cards fetched:", rateCardsData.length);

        // Filter rate cards to match the selected technology/role
        // Only use the new structure (roleName array)
        const filteredRateCards = rateCardsData.filter((card) => {
          const normalizeString = (str) => {
            return str
              .toLowerCase()
              .replace(/\s+/g, "") // Remove all spaces
              .replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters
          };

          const normalizedSelectedValue = normalizeString(techName);

          // Debug logging
          console.log(
            "Matching techName:",
            techName,
            "normalized:",
            normalizedSelectedValue,
          );
          console.log("Card data:", {
            roleName: card.roleName,
            category: card.category,
          });

          // Check new structure (roleName array)
          if (card.roleName && Array.isArray(card.roleName)) {
            const match = card.roleName.some((role) => {
              const normalizedRole = normalizeString(role);
              const isMatch =
                normalizedRole === normalizedSelectedValue ||
                normalizedRole.includes(normalizedSelectedValue) ||
                normalizedSelectedValue.includes(normalizedRole);
              console.log(
                "Checking role:",
                role,
                "normalized:",
                normalizedRole,
                "match:",
                isMatch,
              );
              return isMatch;
            });
            if (match) {
              console.log("Found match in roleName array for:", techName);
              return true;
            }
          }

          return false;
        });

        console.log("Filtered rate cards:", filteredRateCards);
        console.log(
          "Total rate cards before filtering:",
          rateCardsData.length,
          "after filtering:",
          filteredRateCards.length,
        );

        setRateCards(filteredRateCards);
      }
    } catch (error) {
      console.error("Error fetching rate cards:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setRateCards([]);
    }
  }, []);

  const fetchRateCards = useCallback(
    (technologyName) => {
      return fetchRateCardsMemoized(technologyName);
    },
    [fetchRateCardsMemoized],
  );

  // Changed: Updated useEffect to properly map all backend fields and fetch rate cards
  useEffect(() => {
    if (!profileData || !profileData._id) return;

    // Calculate which levels should be visible based on years of experience
    const years =
      parseInt(profileData?.previousExperienceConductingInterviewsYears) || 0;

    // Show Junior if years <= 6 (0-6 years)
    const shouldShowJunior = years <= 6;
    // Show Mid if years >= 3 AND years <= 9 (3-9 years)
    const shouldShowMid = years >= 3 && years <= 9;
    // Show Senior if years >= 6 (6+ years)
    const shouldShowSenior = years >= 6;

    // Create the form data with proper rate visibility
    const newFormData = {
      PreviousExperienceConductingInterviews:
        profileData?.previousExperienceConductingInterviews || "",
      // If experience is "no", keep years empty; otherwise use the parsed value
      PreviousExperienceConductingInterviewsYears:
        profileData?.previousExperienceConductingInterviews === "no"
          ? ""
          : years || 1,
      mock_interview_discount: profileData?.mock_interview_discount || "",

      currentRole: profileData?.currentRole ? profileData.currentRole : "",
      skills: Array.isArray(profileData?.skills) ? profileData.skills : [],
      professionalTitle: profileData?.professionalTitle || "",
      bio: profileData?.bio || "",
      interviewFormatWeOffer: Array.isArray(
        profileData?.interviewFormatWeOffer ||
        profileData?.InterviewFormatWeOffer,
      )
        ? profileData.interviewFormatWeOffer ||
        profileData?.InterviewFormatWeOffer
        : [],
      yearsOfExperience: profileData?.yearsOfExperience || 0,
      id: profileData?._id,
      rates: profileData?.rates || {
        junior: {
          usd: 0,
          inr: 0,
          isVisible: shouldShowJunior,
        },
        mid: {
          usd: 0,
          inr: 0,
          isVisible: shouldShowMid,
        },
        senior: {
          usd: 0,
          inr: 0,
          isVisible: shouldShowSenior,
        },
      },
    };

    // Set initial form data for comparison
    setInitialFormData(newFormData);
    setFormData(newFormData);

    // Set selected candidates for the UI
    const selectedTechs = profileData?.currentRole
      ? profileData.currentRole
      : "";

    setSelectedCandidates(
      selectedTechs,
      // selectedTechs.map((tech) => ({
      //   TechnologyMasterName: tech,
      //   value: tech,
      //   label: tech,
      // }))
    );

    // Fetch rate cards for selected technologies
    if (selectedTechs) {
      // Fetch rate cards for the first technology
      fetchRateCards(selectedTechs);
    }

    // Set other UI states
    setSelectedSkills(
      Array.isArray(profileData?.skills) ? profileData.skills : [],
    );
    setIsReady(profileData?.IsReadyForMockInterviews === "yes");
    setErrors({});
  }, [resolvedId, profileData, expYears, fetchRateCards]);

  const handleBioChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, bio: value });
    setErrors((prevErrors) => ({
      ...prevErrors,
      bio: "",
    }));
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => {
      // When changing to "yes", ensure years has a valid value (minimum 1)
      let yearsValue = prev.PreviousExperienceConductingInterviewsYears;
      if (value === "yes") {
        // If current value is 0, empty, or NaN, set to minimum valid value (1)
        if (
          !yearsValue ||
          yearsValue === 0 ||
          yearsValue === "" ||
          isNaN(yearsValue)
        ) {
          yearsValue = 1;
        }
      } else if (value === "no") {
        yearsValue = "";
      }

      const newFormData = {
        ...prev,
        PreviousExperienceConductingInterviews: value,
        PreviousExperienceConductingInterviewsYears: yearsValue,
      };

      return newFormData;
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      PreviousExperienceConductingInterviews: "",
      PreviousExperienceConductingInterviewsYears: "",
    }));
  };

  // const handleRadioChange = (e) => {
  //     const value = e.target.value;
  //     setInterviewPreviousExperience(value);
  //     setFormData((prev) => ({
  //         ...prev,
  //         PreviousExperienceConductingInterviews: value,
  //         PreviousExperienceConductingInterviewsYears:
  //             value === "no" ? "" : prev.PreviousExperienceConductingInterviewsYears,
  //     }));
  //     setErrors((prevErrors) => ({
  //         ...prevErrors,
  //         PreviousExperienceConductingInterviews: "",
  //         PreviousExperienceConductingInterviewsYears:
  //             value === "no"
  //                 ? ""
  //                 : prevErrors.PreviousExperienceConductingInterviewsYears,
  //     }));
  // };

  // Helper function to get rate ranges for a specific level
  const getRateRanges = useCallback(
    (level) => {
      if (!rateCards.length) return null;

      console.log(
        "Getting rate ranges for level:",
        level,
        "from",
        rateCards.length,
        "rate cards",
      );

      // Find the first rate card that has the specified level
      const rateCard = rateCards.find((card) =>
        card.levels.some((lvl) => lvl.level === level),
      );

      if (!rateCard) {
        console.log("No rate card found for level:", level);
        return null;
      }

      console.log("Found rate card:", rateCard);

      // Find the level data
      const levelData = rateCard.levels.find((lvl) => lvl.level === level);
      if (!levelData) {
        console.log("No level data found for level:", level);
        return null;
      }

      console.log("Level data found:", levelData);

      // Handle new data structure (direct properties) or fallback to old structure (nested rateRange)
      if (
        levelData.inrMin !== undefined &&
        levelData.inrMax !== undefined &&
        levelData.usdMin !== undefined &&
        levelData.usdMax !== undefined
      ) {
        // New data structure
        const rates = {
          inr: { min: levelData.inrMin, max: levelData.inrMax },
          usd: { min: levelData.usdMin, max: levelData.usdMax },
        };
        console.log("Using new data structure, rates:", rates);
        return rates;
      } else if (levelData.rateRange) {
        // Old data structure (fallback)
        console.log(
          "Using old data structure (rateRange):",
          levelData.rateRange,
        );
        return levelData.rateRange;
      }

      console.log("No valid rate structure found in level data");
      return null;
    },
    [rateCards],
  );

  // Handle technology selection
  // const handleSelectCandidate = (technology) => {
  //   if (!technology) return;

  //   const techName = technology.TechnologyMasterName || technology;

  //   if (!selectedCandidates.some((c) => c.TechnologyMasterName === techName)) {
  //     const newCandidate = {
  //       TechnologyMasterName: techName,
  //       _id: Math.random().toString(36).substr(2, 9),
  //     };

  //     const updatedCandidates = [...selectedCandidates, newCandidate];
  //     setSelectedCandidates(updatedCandidates);

  //     setFormData((prev) => ({
  //       ...prev,
  //       Technology: updatedCandidates.map((t) => t.TechnologyMasterName),
  //     }));

  //     setErrors((prev) => ({ ...prev, technologies: "" }));

  //     // Fetch rate cards for the selected technology
  //     if (techName) {
  //       fetchRateCards(techName).then(() => {
  //         // After fetching rate cards, update the form with the first technology's rates
  //         if (updatedCandidates.length === 1) {
  //           const years =
  //             parseInt(formData.PreviousExperienceConductingInterviewsYears) ||
  //             0;
  //           const shouldShowJunior = years <= 6;
  //           const shouldShowMid = years >= 3 && years <= 9;
  //           const shouldShowSenior = years >= 6;

  //           setFormData((prev) => ({
  //             ...prev,
  //             rates: {
  //               junior: { ...prev.rates?.junior, isVisible: shouldShowJunior },
  //               mid: { ...prev.rates?.mid, isVisible: shouldShowMid },
  //               senior: { ...prev.rates?.senior, isVisible: shouldShowSenior },
  //             },
  //           }));
  //         }
  //       });
  //     }
  //   }
  // };

  // Handle skill removal
  const handleRemoveSkill = (index) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills.splice(index, 1);
    setSelectedSkills(updatedSkills);
    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const handleCloseModal = () => {
    if (from === "users" || from === "outsource-interviewer") {
      setInterviewEditOpen(false);
    } else {
      // navigate('/account-settings/my-profile/interview', { replace: true })
      navigate(-1); // Added by Ashok
    }
  };

  // API call to save all changes
  const handleSave = async (e) => {
    e.preventDefault();

    if (!hasChanges) {
      notify.info("No changes to save");
      return;
    }

    const validationErrors = validateInterviewForm(formData, isReady);
    // console.log("validationErrors:", validationErrors);
    setErrors(validationErrors);

    if (!isEmptyObject(validationErrors)) {
      return;
    }

    // console.log("form", formData, typeof Number(formData.hourlyRate));

    setLoading(true);
    try {
      if (!profileData || !profileData.contactId) {
        console.error("Profile data not loaded or missing contactId:", {
          profileData,
        });
        notify.error("Profile data is not loaded. Please wait and try again.");
        return;
      }

      const cleanFormData = {
        PreviousExperienceConductingInterviews: String(
          formData.PreviousExperienceConductingInterviews?.trim() || "",
        ).trim(),
        ...(formData.PreviousExperienceConductingInterviews === "yes" && {
          PreviousExperienceConductingInterviewsYears: String(
            formData.PreviousExperienceConductingInterviewsYears || "1",
          ).trim(),
        }),
        currentRole: formData.currentRole ? formData.currentRole : "",

        skills: Array.isArray(formData.skills) ? formData.skills : [],
        InterviewFormatWeOffer: formData.interviewFormatWeOffer || [],
        mock_interview_discount: formData.interviewFormatWeOffer.includes(
          "mock",
        )
          ? formData.mock_interview_discount
          : "",
        professionalTitle: String(formData.professionalTitle || "").trim(),
        bio: String(formData.bio || "").trim(),
        id: formData.id,
        yearsOfExperience: formData.yearsOfExperience,
        rates: formData.rates,
        tenantId: profileData?.tenantId,
        ownerId: profileData?._id,
      };

      try {
        if (!profileData || !profileData?.contactId) {
          console.error("Profile data not loaded or missing contactId:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again.",
          );
          return;
        }

        const response = await updateContactDetail.mutateAsync({
          resolvedId: profileData?.contactId,
          data: cleanFormData,
        });
        // Invalidate the query to refetch the updated data
        await queryClient.invalidateQueries(["userProfile", resolvedId]);

        if (response.status === 200) {
          notify.success("Updated Interview Details Successfully");
          // Only close the modal after successful update
          handleCloseModal();
          if (usersId && onSuccess) {
            onSuccess();
          }
        }
        // }
      } catch (error) {
        console.error("Error updating interview details:", error);

        if (error.response) {
          if (error.response.status === 400) {
            const backendErrors = error.response.data.errors || {};
            // console.log("backendErrors", backendErrors);
            setErrors(backendErrors);
          } else {
            notify.error("Error updating interview details. Please try again.");
            setErrors((prev) => ({ ...prev, form: "Error saving changes" }));
          }
        } else {
          notify.error(
            "Network error. Please check your connection and try again.",
          );
          setErrors((prev) => ({ ...prev, form: "Network error" }));
        }
      }
      // }
    } catch (error) {
      console.error("Error updating interview details:", error);

      if (error.response) {
        if (error.response.status === 400) {
          const backendErrors = error.response.data.errors || {};
          // console.log("backendErrors", backendErrors);
          setErrors(backendErrors);
        } else {
          notify.error("Error updating interview details. Please try again.");
          setErrors((prev) => ({ ...prev, form: "Error saving changes" }));
        }
      } else {
        notify.error(
          "Network error. Please check your connection and try again.",
        );
        setErrors((prev) => ({ ...prev, form: "Network error" }));
      }
    } finally {
      // v1.0.3 <--------------------------------------------
      setLoading(false);
      // v1.0.3 -------------------------------------------->
    }
  };

  const addSkill = (skillName) => {
    const trimmedSkill = skillName.trim();

    if (!trimmedSkill) {
      return;
    }

    // Check if skill already exists in the list (case-insensitive)
    const skillExists = selectedSkills.some(
      (s) =>
        (typeof s === "object" ? s.SkillName : s).toLowerCase() ===
        trimmedSkill.toLowerCase(),
    );

    if (!skillExists) {
      const newSkill = {
        _id: Math.random().toString(36).substr(2, 9),
        SkillName: trimmedSkill,
      };

      const updatedSkills = [...selectedSkills, newSkill];

      setSelectedSkills(updatedSkills);
      setFormData((prev) => ({
        ...prev,
        skills: updatedSkills.map((s) => s?.SkillName || s).filter(Boolean),
      }));
      setErrors((prev) => ({ ...prev, skills: "" }));
    } else {
      notify.error("Skill already exists");
    }
  };

  const handleInterviewFormatChange = (event) => {
    const { value, checked } = event.target;

    setFormData((prevData) => {
      let updatedFormats = [...(prevData.interviewFormatWeOffer || [])];

      if (checked) {
        if (!updatedFormats.includes(value)) {
          updatedFormats.push(value);
        }
      } else {
        updatedFormats = updatedFormats.filter((format) => format !== value);
      }

      return {
        ...prevData,
        interviewFormatWeOffer: updatedFormats,
      };
    });

    // Clear error when user selects an option
    if (errors.interviewFormatWeOffer) {
      setErrors((prev) => ({
        ...prev,
        interviewFormatWeOffer: "",
      }));
    }

    if (value === "mock") {
      setIsMockInterviewSelected(checked);
    }
  };

  const handleYearsOfExperienceChange = (e) => {
    const years = parseInt(e.target.value) || 0;

    const shouldShowJunior = years <= 6;
    const shouldShowMid = years >= 3 && years <= 9;
    const shouldShowSenior = years >= 6;

    setFormData((prev) => ({
      ...prev,
      PreviousExperienceConductingInterviewsYears: years,
      rates: {
        junior: {
          ...prev.rates?.junior,
          isVisible: shouldShowJunior,
        },
        mid: {
          ...prev.rates?.mid,
          isVisible: shouldShowMid,
        },
        senior: {
          ...prev.rates?.senior,
          isVisible: shouldShowSenior,
        },
      },
    }));

    setErrors((prev) => ({
      ...prev,
      PreviousExperienceConductingInterviewsYears: "",
    }));
  };

  // Enhanced rate change handler with exchange rate conversion
  const handleRateChange = (level, currency) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [level]: {
          ...prev.rates?.[level],
          [currency]: value,
        },
      },
    }));

    // Clear errors when user starts typing (optional)
    setErrors((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [level]: {
          ...prev.rates?.[level],
          [currency]: "",
        },
      },
    }));
  };

  // Add this new function for validation on blur
  const handleRateBlur = (level, currency) => (e) => {
    const value = e.target.value;
    const range = getRateRanges(level.rangeKey);
    let error = "";

    if (value) {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        error = "Please enter a valid number";
      } else if (numValue < 0) {
        error = "Rate cannot be negative";
      } else if (range && range[currency]) {
        const min = range[currency].min;
        const max = range[currency].max;

        if (numValue < min) {
          error = `${currency.toUpperCase()} rate should be at least ${min}`;
        } else if (numValue > max) {
          error = `${currency.toUpperCase()} rate should not exceed ${max}`;
        }
      }
    } else {
      // This handles the "required" error
      error = `${currency.toUpperCase()} rate is required`;
    }

    setErrors((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [level.key]: {
          ...prev.rates?.[level.key],
          [currency]: error,
        },
      },
    }));
  };

  // Define levels configuration
  const levelsConfig = [
    {
      key: "junior",
      label: "Junior Level (0-3 years)",
      showCondition: showJuniorLevel,
      rangeKey: "Junior",
      yearsText: "0-3 years",
    },
    {
      key: "mid",
      label: "Mid-Level (3-6 years)",
      showCondition: showMidLevel,
      rangeKey: "Mid-Level",
      yearsText: "3-6 years",
    },
    {
      key: "senior",
      label: "Senior Level (6+ years)",
      showCondition: showSeniorLevel,
      rangeKey: "Senior",
      yearsText: "6+ years",
    },
  ];

  const handleChangeforExp = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for the changed field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleTechnologyChange = (selectedValue) => {
    console.log("=== TECHNOLOGY SELECTION ===");
    console.log("Selected Technology/Role:", selectedValue);

    if (selectedValue) {
      // Find the technology from services or create a temporary one
      const technology = currentRoles.find(
        (t) => t.roleName === selectedValue || t.roleLabel === selectedValue,
      ) || {
        _id: Math.random().toString(36).substr(2, 9),
        roleName: selectedValue,
      };

      // Update selected candidates
      setSelectedCandidates(technology);

      // Get the years from the current form data or default to 0
      const years =
        parseInt(formData.PreviousExperienceConductingInterviewsYears) || 0;

      // Determine which levels should be visible
      const shouldShowJunior = years <= 6;
      const shouldShowMid = years >= 3 && years <= 9;
      const shouldShowSenior = years >= 6;

      // Update form data with new technology and reset rates to empty
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          currentRole: selectedValue,
          rates: {
            junior: {
              usd: "",
              inr: "",
              isVisible: shouldShowJunior,
            },
            mid: {
              usd: "",
              inr: "",
              isVisible: shouldShowMid,
            },
            senior: {
              usd: "",
              inr: "",
              isVisible: shouldShowSenior,
            },
          },
        };

        console.log("Initial rates set to:", newFormData.rates);
        return newFormData;
      });

      // Clear any existing errors
      setErrors((prev) => ({
        ...prev,
        currentRole: "",
        rates: {
          junior: { usd: "", inr: "" },
          mid: { usd: "", inr: "" },
          senior: { usd: "", inr: "" },
        },
      }));

      // Fetch rate cards for the selected technology
      console.log("Fetching rate cards for:", selectedValue);
      fetchRateCards(selectedValue)
        .then(() => {
          console.log("Rate cards fetched for:", selectedValue);
        })
        .catch((error) => {
          console.error("Error fetching rate cards:", error);
        });
    } else {
      console.log("Technology selection cleared");
      setSelectedCandidates("");
      setFormData((prev) => ({
        ...prev,
        currentRole: "",
        rates: {
          junior: { usd: "", inr: "", isVisible: false },
          mid: { usd: "", inr: "", isVisible: false },
          senior: { usd: "", inr: "", isVisible: false },
        },
      }));
      setErrors((prev) => ({
        ...prev,
        currentRole: "Please select a current role",
      }));
    }
  };

  // Apply rates when rateCards are updated
  useEffect(() => {
    if (rateCards.length > 0 && formData.currentRole) {
      console.log("=== APPLYING RATES ===");
      console.log("Current Role:", formData.currentRole);
      console.log("Rate Cards Found:", rateCards.length);

      const juniorRange = getRateRanges("Junior") || {
        usd: { min: 0 },
        inr: { min: 0 },
      };
      const midRange = getRateRanges("Mid-Level") || {
        usd: { min: 0 },
        inr: { min: 0 },
      };
      const seniorRange = getRateRanges("Senior") || {
        usd: { min: 0 },
        inr: { min: 0 },
      };

      console.log("Rate Ranges Extracted:");
      console.log("Junior Range:", juniorRange);
      console.log("Mid-Level Range:", midRange);
      console.log("Senior Range:", seniorRange);

      const newRates = {
        junior: {
          usd: juniorRange.usd?.min || 0,
          inr: juniorRange.inr?.min || 0,
          isVisible: formData.rates?.junior?.isVisible || false,
        },
        mid: {
          usd: midRange.usd?.min || 0,
          inr: midRange.inr?.min || 0,
          isVisible: formData.rates?.mid?.isVisible || false,
        },
        senior: {
          usd: seniorRange.usd?.min || 0,
          inr: seniorRange.inr?.min || 0,
          isVisible: formData.rates?.senior?.isVisible || false,
        },
      };

      console.log("FINAL RATES BEING SET:", newRates);
      console.log("========================");

      setFormData((prev) => ({
        ...prev,
        rates: newRates,
      }));
    }
  }, [
    rateCards,
    formData.currentRole,
    formData.rates?.junior?.isVisible,
    formData.rates?.mid?.isVisible,
    formData.rates?.senior?.isVisible,
    getRateRanges,
  ]);

  // Clamp rates when rateCards change - only if rates have values
  useEffect(() => {
    if (rateCards.length > 0) {
      const levelMap = {
        junior: "Junior",
        mid: "Mid-Level",
        senior: "Senior",
      };

      setFormData((prev) => {
        const newRates = { ...prev.rates };
        Object.keys(newRates).forEach((level) => {
          if (newRates[level].isVisible) {
            const ranges = getRateRanges(levelMap[level]);
            if (ranges) {
              const clamp = (val, min, max) => {
                // Only clamp if value exists and is not empty string
                if (val === "" || val === null || val === undefined) return val;
                return Math.max(min, Math.min(max, val));
              };
              newRates[level].usd = clamp(
                newRates[level].usd,
                ranges.usd.min,
                ranges.usd.max,
              );
              newRates[level].inr = clamp(
                newRates[level].inr,
                ranges.inr.min,
                ranges.inr.max,
              );
            }
          }
        });
        return { ...prev, rates: newRates };
      });
    }
  }, [rateCards, getRateRanges]);

  return (
    <SidebarPopup title="Edit Interview Details" onClose={handleCloseModal}>
      {/* v1.0.3 <------------------------------------------------------------------------------------------------- */}
      {/* {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )} */}
      {/* v1.0.3 -------------------------------------------------------------------------------------------------> */}

      <div className="sm:p-0 p-6">
        <form className="space-y-6 pb-2">
          {/* //  onSubmit={handleSave} */}
          <div className="grid grid-cols-1 gap-4">
            {/* Technology Selection */}
            <div className="space-y-4">
              <DropdownWithSearchField
                disabled={from !== "outsource-interviewer"}
                value={selectedCandidates || ""}
                options={currentRoles.map((tech) => ({
                  value: tech.roleName,
                  label: tech.roleLabel,
                }))}
                onChange={(e) => {
                  handleTechnologyChange(e.target.value);
                }}
                error={errors.technologies}
                label="Selected Role or Technology"
                name="currentRole"
                required={true}
                onMenuOpen={loadCurrentRoles}
                loading={isCurrentRolesFetching}
              />
            </div>

            {/* Skills Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative" ref={skillsPopupRef}>
                  <DropdownWithSearchField
                    ref={skillsInputRef}
                    value={null}
                    allowCreateOnEnter={true}
                    options={
                      skills
                        ?.filter(
                          (skill) =>
                            !selectedSkills.some(
                              (s) => s.SkillName === skill.SkillName,
                            ),
                        )
                        .map((skill) => ({
                          value: skill.SkillName,
                          label: skill.SkillName,
                        })) || []
                    }
                    onChange={(option) => {
                      if (!option) return;
                      const selectedOption = option?.target?.value
                        ? { value: option.target.value }
                        : option;
                      if (selectedOption?.value) {
                        addSkill(selectedOption.value);
                        if (skillsInputRef.current) {
                          skillsInputRef.current.value = "";
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle the create action from the dropdown
                      if (e.key === "Enter" && e.target?.action === "create") {
                        const newSkill = e.target.value?.trim();
                        if (newSkill) {
                          addSkill(newSkill);

                          // Clear the input field and close the dropdown
                          setTimeout(() => {
                            // Blur any active element to close dropdowns
                            if (document.activeElement) {
                              document.activeElement.blur();
                            }

                            // Clear the input field
                            if (skillsInputRef.current) {
                              // Clear react-select value
                              if (skillsInputRef.current.select) {
                                skillsInputRef.current.select.clearValue();
                              }

                              // Find and clear the input
                              const selectInput =
                                skillsInputRef.current.querySelector("input");
                              if (selectInput) {
                                selectInput.value = "";
                                const inputEvent = new Event("input", {
                                  bubbles: true,
                                });
                                selectInput.dispatchEvent(inputEvent);
                              }
                            }
                          }, 0);
                        }
                      }
                    }}
                    error={errors.skills}
                    label="Select Skills"
                    name="skills"
                    required={selectedSkills.length === 0}
                    onMenuOpen={loadSkills}
                    loading={isSkillsFetching}
                    isMulti={false}
                    placeholder="Type to search or press Enter to add new skill"
                    creatable={true}
                  />
                </div>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-custom-blue/10 border border-custom-blue/40 rounded-full px-3 py-1 text-sm text-custom-blue flex items-center"
                      >
                        {/* <SkillIcon className="h-3.5 w-3.5 mr-1.5 text-custom-blue" /> */}
                        <span className="mr-1.5">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-1 text-custom-blue hover:text-custom-blue/80"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {/* {formData.skills.length >= 10 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Maximum of 10 skills reached
                                            </p>
                                        )} */}
                  </div>
                )}

                {errors.skills && (
                  <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
                )}

                {/* <p className="text-xs text-gray-500 mt-1">
                                    {formData.skills.length} of 10 skills selected
                                </p> */}
              </div>
            </div>

            <div className="space-y-4">
              {/* Previous Experience */}
              <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                <p>
                  Do you have any previous experience conducting interviews ?{" "}
                  <span className="text-red-500">*</span>
                </p>
                <div className="mt-3 mb-3 flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="PreviousExperienceConductingInterviews"
                      value="yes"
                      checked={
                        formData.PreviousExperienceConductingInterviews ===
                        "yes"
                      }
                      onChange={(e) => {
                        handleRadioChange(e.target.value);
                      }}
                      className="h-4 w-4 accent-custom-blue text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="PreviousExperienceConductingInterviews"
                      value="no"
                      checked={
                        formData.PreviousExperienceConductingInterviews === "no"
                      }
                      onChange={(e) => {
                        handleRadioChange(e.target.value);
                      }}
                      className="h-4 w-4 accent-custom-blue text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
                {errors.PreviousExperienceConductingInterviews && (
                  <p className="text-red-500 text-sm sm:text-xs">
                    {errors.PreviousExperienceConductingInterviews}
                  </p>
                )}
              </div>

              {/* Conditional Experience Years */}

              {formData.PreviousExperienceConductingInterviews === "yes" && (
                <div className="w-1/2">
                  <InputField
                    label="How many years of experience do you have in conducting interviews?"
                    type="number"
                    id="PreviousExperienceConductingInterviewsYears"
                    name="PreviousExperienceConductingInterviewsYears"
                    min="0"
                    max="50"
                    placeholder={0}
                    required
                    value={formData.PreviousExperienceConductingInterviewsYears}
                    onChange={handleYearsOfExperienceChange}
                    errors={errors.PreviousExperienceConductingInterviewsYears}
                  />
                </div>
              )}

              {/* Hourly Rates by Experience Level */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rates by Experience Level{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="text-xs text-gray-600 mb-4">
                  {isRateLoading ? (
                    <span>Loading exchange rate...</span>
                  ) : (
                    <span>1 USD = {Number(exchangeRate).toFixed(2)} INR</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Changing USD will automatically update INR, and vice versa
                  </p>
                </div>
                <div className="space-y-4">
                  {showJuniorLevel && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <label
                          htmlFor="junior_rate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Junior Level (0-3 years)
                        </label>
                        {showJuniorLevel && (
                          <span className="text-xs text-gray-500">
                            {getRateRanges("Junior")?.usd &&
                              getRateRanges("Junior")?.inr && (
                                <span>
                                  Range: ${getRateRanges("Junior").usd.min}-$
                                  {getRateRanges("Junior").usd.max} (
                                  {`₹${getRateRanges("Junior").inr.min}–${getRateRanges("Junior").inr.max
                                    }`}
                                  )
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                      <div className="flex sm:flex-col w-full">
                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            USD
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="junior_usd"

                              disabled={from !== "outsource-interviewer"}
                              value={formData.rates?.junior?.usd || ""}
                              onChange={handleRateChange("junior", "usd")}
                              label=""
                              min={getRateRanges("Junior")?.usd?.min || 0}
                              max={getRateRanges("Junior")?.usd?.max || 1000}
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter USD rate",
                              }}
                              prefix="$"
                            />
                          </div>
                          {errors.rates?.junior?.usd && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.junior.usd}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0 sm:mt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            INR
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="junior_inr"
                              value={formData.rates?.junior?.inr || ""}
                              onChange={handleRateChange("junior", "inr")}
                              label=""
                              disabled={from !== "outsource-interviewer"}
                              min={getRateRanges("Junior")?.inr?.min || 0}
                              max={getRateRanges("Junior")?.inr?.max || 100000}
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter INR rate",
                              }}
                              prefix="₹"
                            />
                          </div>
                          {errors.rates?.junior?.inr && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.junior.inr}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showMidLevel && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <label
                          htmlFor="mid_rate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Mid-Level (3-6 years)
                        </label>
                        {showMidLevel && (
                          <span className="text-xs text-gray-500">
                            {getRateRanges("Mid-Level")?.usd &&
                              getRateRanges("Mid-Level")?.inr && (
                                <span>
                                  Range: ${getRateRanges("Mid-Level").usd.min}-$
                                  {getRateRanges("Mid-Level").usd.max} (
                                  {`₹${getRateRanges("Mid-Level").inr.min}–${getRateRanges("Mid-Level").inr.max
                                    }`}
                                  )
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                      <div className="flex sm:flex-col w-full">
                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            USD
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="mid_usd"
                              value={formData.rates?.mid?.usd || ""}
                              onChange={handleRateChange("mid", "usd")}
                              label=""
                              disabled={from !== "outsource-interviewer"}
                              min={getRateRanges("Mid-Level")?.usd?.min || 0}
                              max={getRateRanges("Mid-Level")?.usd?.max || 1000}
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter USD rate",
                              }}
                              prefix="$"
                            />
                          </div>
                          {errors.rates?.mid?.usd && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.mid.usd}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0 sm:mt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            INR
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="mid_inr"
                              value={formData.rates?.mid?.inr || ""}
                              onChange={handleRateChange("mid", "inr")}
                              label=""
                              disabled={from !== "outsource-interviewer"}
                              min={getRateRanges("Mid-Level")?.inr?.min || 0}
                              max={
                                getRateRanges("Mid-Level")?.inr?.max || 100000
                              }
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter INR rate",
                              }}
                              prefix="₹"
                            />
                          </div>
                          {errors.rates?.mid?.inr && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.mid.inr}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showSeniorLevel && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <label
                          htmlFor="senior_rate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Senior Level (6+ years)
                        </label>
                        {showSeniorLevel && (
                          <span className="text-xs text-gray-500">
                            {getRateRanges("Senior")?.usd &&
                              getRateRanges("Senior")?.inr && (
                                <span>
                                  Range: ${getRateRanges("Senior").usd.min}-$
                                  {getRateRanges("Senior").usd.max} (
                                  {`₹${getRateRanges("Senior").inr.min}–${getRateRanges("Senior").inr.max
                                    }`}
                                  )
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                      <div className="flex sm:flex-col w-full">
                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            USD
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="senior_usd"
                              value={formData.rates?.senior?.usd || ""}
                              onChange={handleRateChange("senior", "usd")}
                              label=""
                              disabled={from !== "outsource-interviewer"}
                              min={getRateRanges("Senior")?.usd?.min || 0}
                              max={getRateRanges("Senior")?.usd?.max || 1000}
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter USD rate",
                              }}
                              prefix="$"
                            />
                          </div>
                          {errors.rates?.senior?.usd && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.senior.usd}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0 sm:mt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            INR
                          </label>
                          <div className="relative">
                            <IncreaseAndDecreaseField
                              name="senior_inr"
                              value={formData.rates?.senior?.inr || ""}
                              onChange={handleRateChange("senior", "inr")}
                              label=""
                              disabled={from !== "outsource-interviewer"}
                              min={getRateRanges("Senior")?.inr?.min || 0}
                              max={getRateRanges("Senior")?.inr?.max || 100000}
                              inputProps={{
                                className: "pl-7",
                                placeholder: "Enter INR rate",
                              }}
                              prefix="₹"
                            />
                          </div>
                          {errors.rates?.senior?.inr && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.rates.senior.inr}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {showJuniorLevel
                    ? `Based on your ${expYears} year${expYears === 1 ? "" : "s"
                    } of experience, we're showing the most relevant experience levels.`
                    : "Set competitive rates based on candidate experience levels."}
                  {!showSeniorLevel && (
                    <span className="block mt-1">
                      {!showMidLevel
                        ? "To see Mid and Senior level options, please update your years of experience to 4 or more."
                        : "To see Senior level options, please update your years of experience to 7 or more."}
                    </span>
                  )}
                </p>
              </div> */}
              {/* </div> */}

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rates by Experience Level{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  {/* Exchange Rate Info - Simplified */}
                  <div className="text-xs text-gray-600 mb-4">
                    {isRateLoading ? (
                      <span>Loading exchange rate...</span>
                    ) : (
                      <span>
                        Approximately 1 USD = {Number(exchangeRate).toFixed(2)}{" "}
                        INR
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {levelsConfig.map(
                    (level) =>
                      level.showCondition && (
                        <div
                          key={level.key}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <label
                              htmlFor={`${level.key}_rate`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {level.label}
                            </label>
                            <span className="text-xs text-gray-500">
                              {getRateRanges(level.rangeKey)?.usd &&
                                getRateRanges(level.rangeKey)?.inr && (
                                  <span>
                                    Range: $
                                    {getRateRanges(level.rangeKey).usd.min}-$
                                    {getRateRanges(level.rangeKey).usd.max} (
                                    {`₹${getRateRanges(level.rangeKey).inr.min
                                      }–${getRateRanges(level.rangeKey).inr.max}`}
                                    )
                                  </span>
                                )}
                            </span>
                          </div>

                          <div className="flex sm:flex-col w-full">
                            {/* USD Input */}
                            <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                USD
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  name={`${level.key}_usd`}
                                  id={`${level.key}_usd`}
                                  value={formData.rates?.[level.key]?.usd || ""}
                                  onChange={handleRateChange(level.key, "usd")}
                                  onBlur={handleRateBlur(level, "usd")}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Enter USD rate"
                                />
                              </div>
                              {errors.rates?.[level.key]?.usd && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.rates[level.key].usd}
                                </p>
                              )}
                            </div>

                            {/* INR Input */}
                            <div className="w-1/2 sm:w-full pl-2 sm:pl-0">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                INR
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  name={`${level.key}_inr`}
                                  id={`${level.key}_inr`}
                                  value={formData.rates?.[level.key]?.inr || ""}
                                  onChange={handleRateChange(level.key, "inr")}
                                  onBlur={handleRateBlur(level, "inr")}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Enter INR rate"
                                />
                              </div>
                              {errors.rates?.[level.key]?.inr && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.rates[level.key].inr}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {expYears < 3 &&
                    `You can set rates for junior-level candidates based on your experience.`}
                  {expYears >= 3 &&
                    expYears <= 6 &&
                    "You can set rates for both junior and mid-level candidates based on your experience."}
                  {expYears >= 7 &&
                    "You can set rates for junior, mid and senior-level candidates based on your experience."}
                </p>
              </div>

              {/* Interview Formats You Offer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Formats You Offer{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  {[
                    {
                      id: "format_technical",
                      value: "technical",
                      label: "Technical Coding",
                      description:
                        "Algorithmic problem-solving and coding challenges",
                    },
                    {
                      id: "format_system_design",
                      value: "system_design",
                      label: "System Design",
                      description: "Architecture and scalability discussions",
                    },
                    {
                      id: "format_behavioral",
                      value: "behavioral",
                      label: "Behavioral",
                      description: "Soft skills and situational questions",
                    },
                    {
                      id: "format_mock",
                      value: "mock",
                      label: "Mock Interviews",
                      description: "Full interview simulation with feedback",
                    },
                  ].map(({ id, value, label, description }) => (
                    <div
                      key={id}
                      className="relative flex items-start p-4 rounded-lg border border-gray-200  transition-colors"
                    >
                      <div className="flex items-center h-5">
                        <input
                          id={id}
                          type="checkbox"
                          value={value}
                          // Changed: Use includes() to check if value is in interviewFormatWeOffer
                          // checked={formData.interviewFormatWeOffer.includes(value)}
                          checked={
                            formData.interviewFormatWeOffer?.includes(value) ||
                            false
                          }
                          onChange={handleInterviewFormatChange}
                          className="h-4 w-4 accent-custom-blue text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          htmlFor={id}
                          className="font-medium text-gray-700"
                        >
                          {label}
                        </label>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Changed: Added error display for interviewFormatWeOffer */}
                {errors.interviewFormatWeOffer && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.interviewFormatWeOffer}
                  </p>
                )}
              </div>

              {formData.interviewFormatWeOffer?.includes("mock") && (
                <div>
                  <div className="p-4 rounded-lg border border-gray-200">
                    <label
                      htmlFor="mock_interview_discount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mock Interview Discount Percentage
                    </label>
                    <div className="relative">
                      {showCustomDiscount ? (
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customDiscountValue}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              setCustomDiscountValue(value);
                            }}
                            onBlur={() => {
                              if (customDiscountValue) {
                                handleChangeforExp({
                                  target: {
                                    name: "mock_interview_discount",
                                    value: customDiscountValue,
                                  },
                                });
                              }
                              setShowCustomDiscount(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.target.blur();
                              }
                            }}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                          <span className="px-3 py-2 bg-gray-100 border-t border-b border-r border-gray-300 rounded-r-md text-gray-700">
                            % Discount
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomDiscount(false);
                              setCustomDiscountValue("");
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <DropdownSelect
                            id="mock_interview_discount"
                            name="mock_interview_discount"
                            value={
                              formData.mock_interview_discount
                                ? {
                                  value: formData.mock_interview_discount,
                                  label: `${formData.mock_interview_discount}% discount`,
                                }
                                : null
                            }
                            onChange={(selected) => {
                              if (selected?.value === "custom") {
                                setShowCustomDiscount(true);
                                setCustomDiscountValue("");
                              } else if (selected) {
                                handleChangeforExp({
                                  target: {
                                    name: "mock_interview_discount",
                                    value: selected.value,
                                  },
                                });
                              } else {
                                handleChangeforExp({
                                  target: {
                                    name: "mock_interview_discount",
                                    value: "",
                                  },
                                });
                              }
                            }}
                            options={[
                              { value: "10", label: "10% discount" },
                              { value: "20", label: "20% discount" },
                              { value: "30", label: "30% discount" },
                              {
                                value: "custom",
                                label: "Add custom percentage...",
                              },
                            ]}
                            placeholder="Select discount percentage"
                            className="w-full"
                            classNamePrefix="select"
                            isClearable={true}
                          />
                          {errors.mock_interview_discount && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.mock_interview_discount}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-custom-blue">
                      Offer a discount for mock interviews to attract more
                      candidates
                    </p>
                  </div>
                </div>
              )}

              {/* Professional Title */}
              <div className="sm:col-span-6 col-span-2">
                <InputField
                  label="Professional Title"
                  id="Professional Title"
                  name="professionalTitle"
                  type="text"
                  value={formData.professionalTitle}
                  // onChange={(e) =>
                  //   setFormData((prevData) => ({
                  //     ...prevData,
                  //     professionalTitle: e.target.value,
                  //   }))
                  // }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= 100) {
                      setFormData((prevData) => ({
                        ...prevData,
                        professionalTitle: newValue,
                      }));
                      // Clear error when user types enough characters
                      if (newValue.length >= 50) {
                        setErrors((prev) => ({
                          ...prev,
                          professionalTitle: "",
                        }));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (!value) {
                      setErrors((prev) => ({
                        ...prev,
                        professionalTitle: "Professional title is required",
                      }));
                    } else if (value.length < 50) {
                      setErrors((prev) => ({
                        ...prev,
                        professionalTitle:
                          "Professional title must be at least 50 characters",
                      }));
                    } else if (value.length > 100) {
                      setErrors((prev) => ({
                        ...prev,
                        professionalTitle:
                          "Professional title cannot exceed 100 characters",
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, professionalTitle: "" }));
                    }
                  }}
                  error={errors.professionalTitle}
                  placeholder="Senior Software Engineer with 5+ years of experience in full-stack development"
                  required
                />
                <div className="flex justify-between ">
                  <p className="text-xs text-gray-500">Min 50 characters</p>

                  {formData.professionalTitle?.length > 0 && (
                    <p
                      className={`text-xs ${formData.professionalTitle.length < 50 ||
                          errors.professionalTitle
                          ? "text-red-500"
                          : "text-gray-500"
                        }`}
                    >
                      {formData.professionalTitle.length}/100
                    </p>
                  )}
                </div>
                {/* {errors.title && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
                )} */}
              </div>

              {/* Professional Bio */}
              <div className="sm:col-span-6 col-span-2">
                <DescriptionField
                  label="Professional Bio"
                  id="bio"
                  rows="5"
                  value={formData.bio}
                  // onChange={handleBioChange}
                  onChange={(e) => {
                    handleBioChange(e);
                  }}
                  required
                  placeholder="Tell us about your professional background, expertise, and what makes you a great interviewer..."
                  minLength={150}
                  maxLength={500}
                  error={errors.bio}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-6 py-2 h-9 text-custom-blue border border-custom-blue rounded-md font-medium text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <LoadingButton
            type="submit"
            onClick={handleSave}
            isLoading={loading}
            loadingText="Updating..."
          >
            Save Changes
          </LoadingButton>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default EditInterviewDetails;
