// v1.0.0  -  Ashraf  - fixed base path issues
// v1.0.1  -  Ashok   - Improved responsiveness

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../../../../../apiHooks/useUsers";
import AuthCookieManager from "../../../../../../utils/AuthCookieManager/AuthCookieManager";

const AdvancedDetails = ({ mode, usersId, setAdvacedEditOpen, type }) => {
  const navigate = useNavigate();

  const [contactData, setContactData] = useState({});

  const ownerId = AuthCookieManager.getCurrentUserId();

  // Always call the hook to comply with React rules
  const { userProfile } = useUserProfile(usersId ? usersId : "");

  useEffect(() => {
    // Use external data if provided, otherwise use userProfile from hook
    // if (externalData) {
    //   setContactData(externalData);
    // }
    if (userProfile) {
      setContactData(userProfile);
    }
  }, [userProfile, usersId, mode]);

  return (
    // v1.0.1 <----------------------------------------------------------------------------------
    <div className="mx-2">
      <div
        className={`flex items-center justify-end my-4 ${mode !== "users" ? "py-2" : ""
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

            if (mode === "users" || mode === "outsource") {
              setAdvacedEditOpen(true);
            } else {
              // Navigate to my profile edit page
              navigate(`/account-settings/my-profile/advanced-edit/${editId}`);
            }
          }}
          // ------------------------------ v1.0.0 >

          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
        >
          Edit
        </button>
      </div>

      <div
        className={`bg-white rounded-lg space-y-4 ${mode !== "users" ? "p-4" : ""
          }`}
      >
        {/* v1.0.1 <--------------------------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role / Technology</p>
            <p className="font-medium sm:text-sm">
              {contactData?.currentRoleLabel || "Not Provided"}
            </p>
          </div>
                      <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-medium sm:text-sm">
                {contactData.yearsOfExperience
                  ? `${contactData.yearsOfExperience} Years`
                  : "Not Provided"}
              </p>
            </div>
          <div>
            <p className="text-sm text-gray-500">Current Company</p>
            <p className="font-medium sm:text-sm">
              {contactData?.company || "Not Provided"}
            </p>
          </div>


   <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-medium sm:text-sm">
                {contactData?.industry || "Not Provided"}
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

      </div>
    </div>
  );
};

export default AdvancedDetails;
