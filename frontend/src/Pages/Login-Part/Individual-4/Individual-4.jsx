import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateSteps } from '../../../utils/IndividualValidation.js';
import { TailSpin } from 'react-loader-spinner';
import StepIndicator from './StepIndicator.jsx';
import BasicDetails from './BasicDetails.jsx';
import AdditionalDetails from './AdditionalDetails.jsx';
import InterviewDetails from './InterviewDetails.jsx';
import AvailabilityDetails from './AvailabilityDetails.jsx';
import toast from 'react-hot-toast';
import { config } from '../../../config.js';
import { setAuthCookies } from '../../../utils/AuthCookieManager/AuthCookieManager.jsx';

const FooterButtons = ({
  onNext,
  onPrev,
  currentStep,
  isFreelancer,
  isInternalInterviewer,
  isSubmitting = false,
}) => {
  const lastStep = isInternalInterviewer ? 3 : isFreelancer ? 3 : 1;
  const isLastStep = currentStep === lastStep;

  return (
    <div className="flex justify-between space-x-3 mt-4 mb-4 sm:text-sm">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className={`border ${isSubmitting ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-custom-blue text-custom-blue hover:bg-gray-50'} rounded px-6 sm:px-3 py-1`}
        >
          Prev
        </button>
      ) : (
        <div></div>
      )}
      <button
        onClick={onNext}
        disabled={isSubmitting}
        className={`px-6 sm:px-3 py-1 rounded text-white flex items-center justify-center ${isSubmitting ? 'bg-custom-blue/70 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/90'}`}
        type="button"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isLastStep ? 'Saving...' : 'Processing...'}
          </>
        ) : isLastStep ? 'Save' : 'Next'}
      </button>
    </div>
  );
};

const MultiStepForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    Freelancer,
    profession,
    linkedInData,
    userId,
    contactId,
    tenantId,
    token,
    linkedIn_email,
  } = location.state || {};

  const [matchedContact, setMatchedContact] = useState(null);

  useEffect(() => {
    const fetchAndMatchContact = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
        const contacts = response.data;

        // 🔍 Find contact whose email matches linkedIn_email
        const matched = contacts.find(contact => contact.email === linkedIn_email);

        if (matched) {
          console.log("✅ Matched Contact:", matched);
          setMatchedContact(matched);
        } else {
          console.warn("❌ No contact matched the given LinkedIn email");
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    if (linkedIn_email) {
      fetchAndMatchContact();
    }
  }, [linkedIn_email]);

  const { isProfileComplete, roleName, contactDataFromOrg } = location.state || {};

  const [selectedTimezone, setSelectedTimezone] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(location.state?.currentStep || 0);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [previousInterviewExperience, setPreviousInterviewExperience] = useState('');
  const [isMockInterviewSelected, setIsMockInterviewSelected] = useState(false);

  const [completionStatus, setCompletionStatus] = useState({
    basicDetails: false,
    additionalDetails: false,
    interviewDetails: false,
    availabilityDetails: false,
  });

  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }],
  });

  const [basicDetailsData, setBasicDetailsData] = useState({
    firstName: '',
    lastName: '',
    profileId: '',
    email: '',
    countryCode: '+91',
    phone: '',
    linkedinUrl: '',
    portfolioUrl: '',
    dateOfBirth: '',
    gender: '',
  });

  const [additionalDetailsData, setAdditionalDetailsData] = useState({
    currentRole: '',
    industry: '',
    yearsOfExperience: '',
    location: '',
    coverLetterdescription: '',
    resume: null,
  });

  const [interviewDetailsData, setInterviewDetailsData] = useState({
    skills: [],
    technologies: [],
    previousInterviewExperience: '',
    previousInterviewExperienceYears: '',
    expertiseLevel_ConductingInterviews: '',
    hourlyRate: '',
    interviewFormatWeOffer: [],
    expectedRatePerMockInterview: '',
    noShowPolicy: '',
    bio: '',
    professionalTitle: '',
  });

  const [availabilityDetailsData, setAvailabilityDetailsData] = useState({
    timeZone: '',
    preferredDuration: '',
    availability: '',
  });

  // Populate fields with matched contact data, falling back to LinkedIn data or defaults
  useEffect(() => {
    if (matchedContact) {
      setBasicDetailsData({
        firstName: matchedContact.firstName || linkedInData?.firstName || '',
        lastName: matchedContact.lastName || linkedInData?.lastName || '',
        profileId: matchedContact.profileId || '',
        email: matchedContact.email || linkedInData?.email || '',
        countryCode: matchedContact.countryCode || '+91',
        phone: matchedContact.phone || '',
        linkedinUrl: matchedContact.linkedinUrl || linkedInData?.profileUrl || '',
        portfolioUrl: matchedContact.portfolioUrl || '',
        dateOfBirth: matchedContact.dateOfBirth || '',
        gender: matchedContact.gender || '',
      });

      setAdditionalDetailsData({
        currentRole: matchedContact.currentRole || '',
        industry: matchedContact.industry || '',
        yearsOfExperience: matchedContact.yearsOfExperience || '',
        location: matchedContact.location || '',
        coverLetterdescription: matchedContact.coverLetterdescription || '',
        resume: matchedContact.resume || null,
      });

      setInterviewDetailsData({
        skills: matchedContact.skills || [],
        technologies: matchedContact.technologies || [],
        previousInterviewExperience: matchedContact.previousInterviewExperience || '',
        previousInterviewExperienceYears: matchedContact.previousInterviewExperienceYears || '',
        expertiseLevel_ConductingInterviews: matchedContact.expertiseLevel_ConductingInterviews || '',
        hourlyRate: matchedContact.hourlyRate || '',
        interviewFormatWeOffer: matchedContact.interviewFormatWeOffer || [],
        expectedRatePerMockInterview: matchedContact.expectedRatePerMockInterview || '',
        noShowPolicy: matchedContact.noShowPolicy || '',
        bio: matchedContact.bio || '',
        professionalTitle: matchedContact.professionalTitle || '',
      });

      setAvailabilityDetailsData({
        timeZone: matchedContact.timeZone || '',
        preferredDuration: matchedContact.preferredDuration || '',
        availability: matchedContact.availability || '',
      });

      setCompletionStatus(matchedContact.completionStatus || {
        basicDetails: false,
        additionalDetails: false,
        interviewDetails: false,
        availabilityDetails: false,
      });

      if (matchedContact.imageData?.path) {
        setFilePreview(matchedContact.imageData.path);
      } else if (linkedInData?.pictureUrl) {
        setFilePreview(linkedInData.pictureUrl);
      }

      // Update selectedSkills and times if available
      setSelectedSkills(matchedContact.skills || []);
      if (matchedContact.availability && Array.isArray(matchedContact.availability)) {
        const updatedTimes = {
          Sun: [{ startTime: null, endTime: null }],
          Mon: [{ startTime: null, endTime: null }],
          Tue: [{ startTime: null, endTime: null }],
          Wed: [{ startTime: null, endTime: null }],
          Thu: [{ startTime: null, endTime: null }],
          Fri: [{ startTime: null, endTime: null }],
          Sat: [{ startTime: null, endTime: null }],
        };
        matchedContact.availability.forEach(({ day, timeSlots }) => {
          if (updatedTimes[day] && Array.isArray(timeSlots)) {
            updatedTimes[day] = timeSlots.map(slot => ({
              startTime: slot.startTime || null,
              endTime: slot.endTime || null,
            }));
          }
        });
        setTimes(updatedTimes);
      }
    } else if (linkedInData) {
      // Fallback to LinkedIn data if no matched contact
      setBasicDetailsData((prev) => ({
        ...prev,
        firstName: linkedInData.firstName || prev.firstName,
        lastName: linkedInData.lastName || prev.lastName,
        email: linkedInData.email || prev.email,
        linkedinUrl: linkedInData.profileUrl || prev.linkedinUrl,
      }));
      setFilePreview(linkedInData.pictureUrl || filePreview);
    }
  }, [matchedContact, linkedInData]);

  useEffect(() => {
    if (isProfileComplete && contactDataFromOrg) {
      setBasicDetailsData((prevData) => ({
        ...prevData,
        firstName: contactDataFromOrg.firstName || prevData.firstName,
        lastName: contactDataFromOrg.lastName || prevData.lastName,
        profileId: contactDataFromOrg.profileId || prevData.profileId,
        email: contactDataFromOrg.email || prevData.email,
        phone: contactDataFromOrg.phone || prevData.phone,
      }));
    }
  }, [isProfileComplete, contactDataFromOrg]);

  const showLimitedSteps = isProfileComplete && roleName !== 'Internal_Interviewer';
  const isInternalInterviewer = roleName === 'Internal_Interviewer';

  const handleNextStep = async () => {
    let isValid = false;

    // Validate current step
    if (currentStep === 0) {
      const basicDetailsErrors = {};
      if (!basicDetailsData.email) basicDetailsErrors.email = 'Email is required';
      if (!basicDetailsData.lastName) basicDetailsErrors.lastName = 'Last name is required';
      if (!basicDetailsData.phone) basicDetailsErrors.phone = 'Phone number is required';
      if (!basicDetailsData.linkedinUrl) basicDetailsErrors.linkedinUrl = 'LinkedIn URL is required';
      setErrors({ ...errors, ...basicDetailsErrors });
      isValid = Object.keys(basicDetailsErrors).length === 0;
    } else if (currentStep === 1) {
      const professionalErrors = {};
      if (!additionalDetailsData.currentRole) professionalErrors.currentRole = 'Current role is required';
      if (!additionalDetailsData.industry) professionalErrors.industry = 'Industry is required';
      if (!additionalDetailsData.yearsOfExperience) professionalErrors.yearsOfExperience = 'Years of experience is required';
      if (!additionalDetailsData.location) professionalErrors.location = 'Location is required';
      setErrors({ ...errors, ...professionalErrors });
      isValid = Object.keys(professionalErrors).length === 0;
    } else if (currentStep === 2) {
      const interviewErrors = {};
      if (!interviewDetailsData.skills.length) interviewErrors.skills = 'Skills are required';
      if (!interviewDetailsData.previousInterviewExperience)
        interviewErrors.previousInterviewExperience = 'Previous interview experience is required';
      if (!interviewDetailsData.expertiseLevel_ConductingInterviews)
        interviewErrors.expertiseLevel_ConductingInterviews = 'Expertise level is required';
      setErrors({ ...errors, ...interviewErrors });
      isValid = Object.keys(interviewErrors).length === 0;
    } else if (currentStep === 3) {
      const availabilityErrors = {};
      if (!availabilityDetailsData.timeZone) availabilityErrors.timeZone = 'Timezone is required';
      if (!availabilityDetailsData.preferredDuration) availabilityErrors.preferredDuration = 'Preferred duration is required';
      setErrors({ ...errors, ...availabilityErrors });
      isValid = Object.keys(availabilityErrors).length === 0;
    } else {
      isValid = true;
    }

    if (!isValid) {
      console.log('Validation failed. Errors:', errors);
      return;
    }

    const statusKey =
      currentStep === 0
        ? 'basicDetails'
        : currentStep === 1
          ? 'additionalDetails'
          : currentStep === 2
            ? 'interviewDetails'
            : 'availabilityDetails';

    const updatedCompletionStatus = {
      ...completionStatus,
      [statusKey]: true,
    };

    setCompletionStatus(updatedCompletionStatus);

    try {
      setLoading(true);

      const userData = {
        firstName: basicDetailsData.firstName,
        lastName: basicDetailsData.lastName,
        profileId: basicDetailsData.profileId,
        isFreelancer: isInternalInterviewer ? false : Freelancer,
        email: basicDetailsData.email,
        isProfileCompleted: currentStep === (isInternalInterviewer ? 3 : Freelancer ? 3 : 1),
        completionStatus: updatedCompletionStatus,
        ownerId: userId,
        tenantId,
        isInternalInterviewer,
      };

      const contactData = {
        ...(currentStep >= 0 && {
          firstName: basicDetailsData.firstName,
          lastName: basicDetailsData.lastName,
          profileId: basicDetailsData.profileId,
          email: basicDetailsData.email,
          countryCode: basicDetailsData.countryCode,
          phone: basicDetailsData.phone,
          linkedinUrl: basicDetailsData.linkedinUrl,
          portfolioUrl: basicDetailsData.portfolioUrl,
          dateOfBirth: basicDetailsData.dateOfBirth,
          gender: basicDetailsData.gender,
        }),
        ...(currentStep >= 1 && {
          currentRole: additionalDetailsData.currentRole,
          industry: additionalDetailsData.industry,
          yearsOfExperience: additionalDetailsData.yearsOfExperience,
          location: additionalDetailsData.location,
          coverLetterdescription: additionalDetailsData.coverLetterdescription,
        }),
        ...(currentStep >= 2 && {
          skills: interviewDetailsData.skills,
          technologies: interviewDetailsData.technologies,
          previousInterviewExperience: interviewDetailsData.previousInterviewExperience,
          previousInterviewExperienceYears: interviewDetailsData.previousInterviewExperienceYears,
          expertiseLevel_ConductingInterviews: interviewDetailsData.expertiseLevel_ConductingInterviews,
          hourlyRate: interviewDetailsData.hourlyRate,
          interviewFormatWeOffer: interviewDetailsData.interviewFormatWeOffer,
          expectedRatePerMockInterview: interviewDetailsData.expectedRatePerMockInterview,
          noShowPolicy: interviewDetailsData.noShowPolicy,
          bio: interviewDetailsData.bio,
          professionalTitle: interviewDetailsData.professionalTitle,
        }),
        ...(currentStep >= 3 && {
          timeZone: availabilityDetailsData.timeZone,
          preferredDuration: availabilityDetailsData.preferredDuration,
        }),
        LetUsKnowYourProfession: profession,
        completionStatus: updatedCompletionStatus,
        _id: contactId,
      };

      Object.keys(contactData).forEach((key) => {
        if (contactData[key] === undefined) {
          delete contactData[key];
        }
      });

      const availabilityData =
        (isInternalInterviewer || Freelancer) && currentStep === 3
          ? Object.keys(times)
            .map((day) => ({
              day,
              timeSlots: times[day]
                .filter((slot) => slot.startTime && slot.endTime && slot.startTime !== 'unavailable')
                .map((slot) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
            }))
            .filter((dayData) => dayData.timeSlots.length > 0)
          : [];

      const requestData = {
        userData,
        contactData,
        ...(availabilityData.length > 0 && { availabilityData }),
        Freelancer,
        isInternalInterviewer,
        isUpdate: !!userId,
      };

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Individual/Signup`,
        requestData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.token) {
        setAuthCookies(response.data.token);

        // Update file upload to use existing contactId
        if (currentStep === 0 && (file || (linkedInData?.pictureUrl && !filePreview))) {
          const imageData = new FormData();
          if (file) {
            imageData.append('image', file);
          } else {
            const imageResponse = await fetch(linkedInData.pictureUrl);
            const blob = await imageResponse.blob();
            const imageFile = new File([blob], 'linkedin-profile.jpg', { type: 'image/jpeg' });
            imageData.append('image', imageFile);
          }
          imageData.append('type', 'contact');
          imageData.append('id', contactId || response.data.contactId);

          try {
            await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true,
            });
            toast.success('Profile picture uploaded successfully!');
          } catch (uploadError) {
            console.error('Error uploading profile picture:', uploadError);
            toast.error('Failed to upload profile picture. You can update it later.');
          }
        }

        toast.success(response.data.isUpdate ? 'Profile updated successfully!' : 'Profile created successfully!');

        if (currentStep < (isInternalInterviewer ? 3 : Freelancer ? 3 : 1)) {
          setCurrentStep(currentStep + 1);
        } else {
          navigate(response.data.isProfileCompleted ? '/home' : '/subscription-plans');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 0) {
      navigate('/select-profession', {
        state: { userId, contactId, tenantId, token },
      });
    } else {
      setCurrentStep((prevStep) => (prevStep - 1 >= 0 ? prevStep - 1 : 0));
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <TailSpin color="#ffffff" height={50} width={50} />
            <span className="mt-2 text-white text-lg font-semibold">Processing...</span>
          </div>
        </div>
      )}

      <form>
        <div className="bg-slate-50 min-h-screen py-6 px-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-2xl font-bold text-gray-900 mb-4">Create Profile</p>
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 sm:p-8">
                <StepIndicator
                  currentStep={currentStep}
                  showLimitedSteps={showLimitedSteps}
                  isInternalInterviewer={isInternalInterviewer}
                  completed={completionStatus}
                />

                {currentStep === 0 && (
                  <BasicDetails
                    basicDetailsData={basicDetailsData}
                    setBasicDetailsData={setBasicDetailsData}
                    errors={errors}
                    setErrors={setErrors}
                    file={file}
                    setFile={setFile}
                    filePreview={filePreview}
                    setFilePreview={setFilePreview}
                    linkedInData={linkedInData}
                  />
                )}

                {currentStep === 1 && (
                  <AdditionalDetails
                    errors={errors}
                    setErrors={setErrors}
                    additionalDetailsData={additionalDetailsData}
                    setAdditionalDetailsData={setAdditionalDetailsData}
                  />
                )}

                {(Freelancer || isInternalInterviewer) && !showLimitedSteps && (
                  <>
                    {currentStep === 2 && (
                      <InterviewDetails
                        errors={errors}
                        setErrors={setErrors}
                        selectedTechnologyies={selectedCandidates}
                        setSelectedTechnologyies={setSelectedCandidates}
                        interviewDetailsData={interviewDetailsData}
                        setInterviewDetailsData={setInterviewDetailsData}
                        selectedSkills={selectedSkills}
                        setSelectedSkills={setSelectedSkills}
                        previousInterviewExperience={previousInterviewExperience}
                        setPreviousInterviewExperience={setPreviousInterviewExperience}
                        isMockInterviewSelected={isMockInterviewSelected}
                        setIsMockInterviewSelected={setIsMockInterviewSelected}
                      />
                    )}

                    {currentStep === 3 && (
                      <AvailabilityDetails
                        selectedTimezone={selectedTimezone}
                        setSelectedTimezone={setSelectedTimezone}
                        times={times}
                        setTimes={setTimes}
                        availabilityDetailsData={availabilityDetailsData}
                        setAvailabilityDetailsData={setAvailabilityDetailsData}
                        errors={errors}
                        setErrors={setErrors}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <FooterButtons
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              currentStep={currentStep}
              isFreelancer={Freelancer || isInternalInterviewer}
              isInternalInterviewer={isInternalInterviewer}
              isSubmitting={loading}
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default MultiStepForm;