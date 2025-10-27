// v1.0.0 - Ashok - Improved responsiveness
// v2.0.0 - Added comprehensive interview details view
// v1.0.2 - Ashok - Again improved responsiveness

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";
import { useUserProfile } from "../../../../../../apiHooks/useUsers";
import AuthCookieManager from "../../../../../../utils/AuthCookieManager/AuthCookieManager";

// Format skill name with proper capitalization
const formatSkill = (skill) => {
  if (!skill) return "";
  return skill
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Format interview type for display
const formatInterviewType = (type) => {
  const formatMap = {
    technical: "Technical",
    mock: "Mock",
    system_design: "System Design",
    behavioral: "Behavioral",
    resume_review: "Resume Review",
    coding_challenge: "Coding Challenge",
    system_architecture: "System Architecture",
    leadership: "Leadership",
    case_study: "Case Study",
  };

  

  return (
    formatMap[type] ||
    type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

// Format currency values
const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null) return "0.00";
  return parseFloat(amount).toLocaleString("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InterviewUserDetails = ({
  mode,
  usersId,
  setInterviewEditOpen,
  externalData = null,
}) => {
  // const { usersRes } = useCustomContext();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({});

  // console.log('contact data in interview details', contactData);

  // useEffect(() => {
  //     console.log('Full contactData:', contactData);
  //     console.log('contactData.rates:', contactData?.rates);
  //     console.log('contactData.rates.junior:', contactData?.rates?.junior);
  //     console.log('contactData.rates.junior.isVisible:', contactData?.rates?.junior?.isVisible);
  //     console.log('contactData.previousExperienceConductingInterviews:', contactData?.previousExperienceConductingInterviews);
  // }, [contactData]);

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
    // const userId = tokenPayload?.userId;
  // const ownerId = usersId || userId;
  
    const ownerId = AuthCookieManager.getCurrentUserId();


  // Always call the hook to comply with React rules
  const { userProfile } = useUserProfile(usersId ? usersId :"");

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {

  //       //   const contact = singlecontact[0];
  //       // if (contact) {
  //       //   setContactData(contact);
  //       // }

  //         if (usersId) {
  //               const selectedContact = usersRes.find(user => user.contactId === usersId);
  //                 setContactData(selectedContact);
  //         //  fetchContacts(usersId);
  //       } else {
  //           const contact = singlecontact[0];
  //            if (contact) {
  //         setContactData(contact);
  //       }
  //       }

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchData();
  // }, [userId, singlecontact]);

  //  useEffect(() => {
  //   const selectedContact = usersId
  //     ? usersRes.find(user => user?.contactId === usersId)
  //     : usersRes.find(user => user?._id === userId);

  //   if (selectedContact) {
  //     setContactData(selectedContact);
  //     // console.log("Selected contact:", selectedContact);
  //   }
  // }, [usersId, userId, usersRes]);

  useEffect(() => {
    // Use external data if provided, otherwise use userProfile from hook
    if (externalData) {
      setContactData(externalData);
    } else if (userProfile && userProfile._id) {
      setContactData(userProfile);
    }
  }, [userProfile, ownerId, externalData]);

  // console.log("contactData?.contactId", contactData);

  const expYears = parseInt(contactData?.yearsOfExperience || 0, 10);

  const showJuniorLevel = expYears > 0;
  const showMidLevel = expYears >= 4;
  const showSeniorLevel = expYears >= 7;


// With this:
const formatKey = contactData?.interviewFormatWeOffer ? 'interviewFormatWeOffer' : 'InterviewFormatWeOffer';
  return (
    <div className="mx-2">
      <div
        className={`flex items-center justify-end my-4 ${
          mode === "users" ? "justify-end" : "py-2"
        }`}
      >
        {/* <h3 className={`text-lg font-medium ${mode === "users" ? "hidden" : ""}`}>
                    Interview Details
                </h3> */}
        <button
          onClick={() => {
            const editId = contactData?._id || ownerId || usersId;
            if (!editId) {
              console.error("No ID available for editing");
              return;
            }

            if (mode === "users") {
              setInterviewEditOpen(true);
            } else if (externalData) {
              // Navigate to outsource interviewer edit page
              navigate(`/outsource-interviewers/edit/interview/${editId}`);
            } else {
              // Navigate to my profile edit page
              navigate(`/account-settings/my-profile/interview-edit/${editId}`);
            }
          }}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
        >
          Edit
        </button>
      </div>

      <div className={`bg-white rounded-lg ${mode !== "users" ? "p-4" : ""}`}>
        {/* v1.0.2 <-------------------------------------------------------------------------------------------------------------- */}
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 mb-3">
        {/* v1.0.2 --------------------------------------------------------------------------------------------------------------> */}
          {/* Row 1: Technologies and Skills */}
          <div className="col-span-1 space-y-2">
            <p className="text-sm text-gray-500">Technologies</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contactData?.technologies?.length > 0 ? (
                contactData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-custom-blue rounded-full text-xs"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">-</p>
              )}
            </div>
          </div>

          <div className="col-span-1 space-y-2">
            <p className="text-sm text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contactData?.skills?.length > 0 ? (
                <>
                  {contactData.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-custom-blue rounded-full text-xs whitespace-nowrap"
                    >
                      {formatSkill(skill)}
                    </span>
                  ))}
                  {contactData.skills.length > 3 && (
                    <div className="relative group">
                      <span
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs cursor-default"
                        title={contactData.skills
                          .slice(3)
                          .map((skill) => formatSkill(skill))
                          .join(", ")}
                      >
                        +{contactData.skills.length - 3} more
                      </span>
                      <div className="absolute z-10 hidden group-hover:block bg-white p-2 rounded shadow-lg border border-gray-200 text-xs text-gray-700 whitespace-nowrap">
                        {contactData.skills.slice(3).map((skill, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 hover:bg-gray-50"
                          >
                            {formatSkill(skill)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">-</p>
              )}
            </div>
          </div>

          {/* Row 2: Interview Experience */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              Previous Experience Conducting Interviews
            </p>
            <p className="text-sm font-medium">
              {contactData?.previousExperienceConductingInterviews === "yes"
                ? "Yes"
                : "No"}
            </p>
          </div>

          {contactData?.previousExperienceConductingInterviews === "yes" && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Years of Experience Conducting Interviews
              </p>
              <p className="text-sm font-medium">
                {contactData?.previousExperienceConductingInterviewsYears ||
                  "0"}{" "}
                years
              </p>
            </div>
          )}

          {/* Row 3: Rates and Interview Formats */}
          {contactData?.rates &&
            Object.entries(contactData.rates).map(([level, rate]) => {
              const shouldShow =
                (level === "junior" && showJuniorLevel) || // Always show junior level
                (level === "mid" && showMidLevel) || // Show mid-level if 4+ years
                (level === "senior" && showSeniorLevel); // Show senior if 7+ years

              return (
                shouldShow && (
                  <div key={level} className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {level.charAt(0).toUpperCase() + level.slice(1)} Rate
                    </p>
                    <div className="text-sm">
                      <p className="font-medium">
                        {formatCurrency(rate?.usd, "USD")}
                      </p>
                      <p className="text-gray-600">
                        {formatCurrency(rate?.inr, "INR")}
                      </p>
                    </div>
                  </div>
                )
              );
            })}

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Interview Formats</p>
            <div className="flex flex-wrap gap-2">
              {contactData?.[formatKey]?.length > 0 ? (
                contactData?.[formatKey]?.map((format, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-custom-blue rounded-full text-xs"
                  >
                    {formatInterviewType(format)}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">-</p>
              )}
            </div>
          </div>

          {/* Row 5: Discount and Professional Title */}
          {contactData?.mock_interview_discount ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Discount</p>
              <p className="text-sm font-medium">
                {contactData.mock_interview_discount}%
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Discount</p>
              <p className="text-sm text-gray-500">-</p>
            </div>
          )}
        </div>

        {/* v1.0.2 <-------------------------------------------------------------------------------------------------------------- */}
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
        {/* v1.0.2 --------------------------------------------------------------------------------------------------------------> */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Professional Title</p>
            <p
              className="text-sm font-medium truncate"
              title={contactData?.professionalTitle || ""}
            >
              {contactData?.professionalTitle || "-"}
            </p>
          </div>

          {/* Row 6: Bio (full width) */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Professional Bio</p>
            <p
              className="text-sm font-medium truncate"
              title={contactData?.bio || ""}
            >
              {contactData?.bio || "No bio provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewUserDetails;
