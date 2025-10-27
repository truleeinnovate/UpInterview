// v1.0.0  -  Ashraf  - fixed base path issues
// v1.0.1  -  Ashok   - Improved responsiveness

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";
import { useUserProfile } from "../../../../../../apiHooks/useUsers";
import AuthCookieManager from "../../../../../../utils/AuthCookieManager/AuthCookieManager";

const AdvancedDetails = ({ mode, usersId, setAdvacedEditOpen, type, externalData = null }) => {

  // const { usersRes } = useCustomContext();
  const navigate = useNavigate();

  const [contactData, setContactData] = useState({});

  const ownerId = AuthCookieManager.getCurrentUserId();


  // Always call the hook to comply with React rules
  const { userProfile } = useUserProfile(usersId ? usersId :"");

  console.log("userProfile AdvancedDetails", userProfile);
  // console.log("userId AdvancedDetails", userId);

  //  useEffect(() => {
  //    const selectedContact = usersId
  //      ? usersRes.find(user => user?.contactId === usersId)
  //      : usersRes.find(user => user?._id === userId);

  //    if (selectedContact) {
  //      setContactData(selectedContact);
  //      console.log("Selected contact:", selectedContact);
  //    }
  //  }, [usersId, userId, usersRes]);

  useEffect(() => {
    // Use external data if provided, otherwise use userProfile from hook
    if (externalData) {
      setContactData(externalData);
    } else if (userProfile && userProfile._id) {
      setContactData(userProfile);
    }
  }, [userProfile, ownerId, externalData]);

  //  console.log("contactData?.contactId", contactData);

  return (
    // v1.0.1 <----------------------------------------------------------------------------------
    <div className="mx-2">
      <div
        className={`flex items-center justify-end my-4 ${
          mode !== "users" ? "py-2" : ""
        }`}
      >
        {/* v1.0.1 <---------------------------------------------------------------------------- */}
        {/* <------------------------------- v1.0.0  */}
        <button
          onClick={() => {
            const editId = contactData?._id || ownerId || usersId;
            if (!editId) {
              console.error("No ID available for editing");
              return;
            }

            if (mode === "users") {
              setAdvacedEditOpen(true);
            } else if (externalData) {
              // Navigate to outsource interviewer edit page
              navigate(`/outsource-interviewers/edit/advanced/${editId}`);
            } else {
              // Navigate to my profile edit page
              navigate(`/account-settings/my-profile/advanced-edit/${editId}`);
            }
          }}
          // ------------------------------ v1.0.0 >
          // onClick={() => setIsBasicModalOpen(true)}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
        >
          Edit
        </button>
      </div>

      <div
        className={`bg-white rounded-lg space-y-4 ${
          mode !== "users" ? "p-4" : ""
        }`}
      >
        {/* v1.0.1 <--------------------------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-medium sm:text-sm">
              {contactData.currentRole || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium sm:text-sm">
              {contactData.industry || "Not Provided"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Years of Experience</p>
            <p className="font-medium sm:text-sm">
              {contactData.yearsOfExperience
                ? `${contactData.yearsOfExperience} Years`
                : "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium sm:text-sm">
              {contactData.location || "Not Provided"}
            </p>
          </div>
        </div>
        {/* v1.0.1 <--------------------------------------------------------------------------------------------- */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Resume PDF </p>
            <p className="font-medium">{contactData?.resume?.filename || 'No File'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cover Letter </p>
            <p className="font-medium">{contactData?.coverLetter?.filename || 'No File'}</p>
          </div>

        </div> */}

        {/* <div>
                <p className="text-sm text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {contactData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                      {skill || "N/A"}
                    </span>
                  ))}
                </div>
              </div> */}
      </div>
    </div>
  );
};

export default AdvancedDetails;
