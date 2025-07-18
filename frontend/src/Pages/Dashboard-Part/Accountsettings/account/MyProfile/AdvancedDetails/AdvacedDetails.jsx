// v1.0.0  -  Ashraf  - fixed base path issues
import { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import { useUserProfile } from '../../../../../../apiHooks/useUsers';

const AdvancedDetails = ({ mode, usersId, setAdvacedEditOpen, type }) => {
  console.log("type in AdvancedDetails", type);

  // const { usersRes } = useCustomContext();
  const navigate = useNavigate();

  const [contactData, setContactData] = useState({})

  const authToken = Cookies.get("authToken");
  const impersonationToken = Cookies.get("impersonationToken");
  const tokenPayload = decodeJwt(authToken);
  const impersonatedTokenPayload = decodeJwt(impersonationToken);
  let ownerId;
  if (type === 'superAdmin') {
    ownerId = impersonatedTokenPayload?.impersonatedUserId;
  } else {
    ownerId = tokenPayload?.userId;
    ownerId = usersId;

  }


  const { userProfile } = useUserProfile(ownerId)


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
    if (!userProfile || !userProfile._id) return;
    if (userProfile) {

      // console.log("contact userProfile",userProfile )
      setContactData(userProfile);
    }
  }, [userProfile, ownerId, userProfile._id]);

  //  console.log("contactData?.contactId", contactData);


  return (
    <div>
      <div className={`flex items-center justify-end ${mode !== 'users' ? 'py-2' : ''}`}>
        {/* <------------------------------- v1.0.0  */}
        <button
          onClick={
            () => {
              mode === 'users' ?
                setAdvacedEditOpen(true)
                :
                navigate(`/account-settings/my-profile/advanced-edit/${contactData?._id}`)
            }
          }
          // ------------------------------ v1.0.0 >
          // onClick={() => setIsBasicModalOpen(true)}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>


      <div className={`bg-white rounded-lg space-y-4 ${mode !== 'users' ? 'p-4' : ''}`}>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-medium">{contactData.currentRole || 'Not Provided'}</p>
          </div>


          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{contactData.industry || 'Not Provided'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Years of Experience</p>
            <p className="font-medium">{contactData.yearsOfExperience ? `${contactData.yearsOfExperience} Years` : 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{contactData.location || 'Not Provided'}</p>
          </div>



        </div>


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

        {/*  Cover Letter Description */}
        {
          contactData.coverLetterdescription ?
            (
              // <div className="flex flex-col">
              <div className={`flex flex-col ${mode === 'users' ? 'w-full' : 'max-w-3xl'} break-words`}>
                <span className="text-sm text-gray-500">
                  Cover Letter Description
                </span>

                {/* <p className="text-gray-800 text-sm sm:text-xs float-right mt-1 font-medium"> */}
                <p className="text-gray-800 text-sm sm:text-xs mt-1 font-medium whitespace-pre-line break-words">
                  {contactData.coverLetterdescription}
                </p>
              </div>
            ) : ""
        }

      </div>

    </div>
  )
}

export default AdvancedDetails;