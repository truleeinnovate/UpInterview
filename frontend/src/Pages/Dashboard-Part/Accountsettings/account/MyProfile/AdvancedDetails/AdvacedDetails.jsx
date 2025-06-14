import { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';

const AdvancedDetails = ({ mode, usersId,setAdvacedEditOpen }) => {
  const { usersRes } = useCustomContext();
  const navigate = useNavigate();

  const [contactData, setContactData] = useState({})

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;

  // console.log("userId AdvancedDetails", userId);

 useEffect(() => {
   const selectedContact = usersId
     ? usersRes.find(user => user?.contactId === usersId)
     : usersRes.find(user => user?._id === userId);
 
   if (selectedContact) {
     setContactData(selectedContact);
     console.log("Selected contact:", selectedContact);
   }
 }, [usersId, userId, usersRes]);

 console.log("contactData?.contactId", contactData?.contactId);
 

  return (
    <div>
      <div className={`flex  items-center  ${mode === 'users' ? 'justify-end' : "justify-between mt-4"}`}>
        <h3 className={`text-lg font-medium  ${mode === 'users' ? 'hidden' : ""}`}>Advanced Details</h3>

        <button
          onClick={
            () => {
              mode === 'users' ?
              setAdvacedEditOpen(true)            
                :
                navigate(`/account-settings/my-profile/advanced-edit/${contactData?.contactId}`)
            }
          }
          // onClick={() => setIsBasicModalOpen(true)}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>


      <div className="bg-white rounded-lg">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-medium">{contactData.currentRole || "N/A"}</p>
          </div>


          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{contactData.industry || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Years of Experience</p>
            <p className="font-medium">{contactData.experienceYears || "N/A"} Years</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{contactData.location || "N/A"}</p>
          </div>



        </div>


        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Resume PDF </p>
            <p className="font-medium">{contactData.ResumePdf || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cover Letter </p>
            <p className="font-medium">{contactData.coverletter || "N/A"}</p>
          </div>

        </div>


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
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  Cover Letter Description
                </span>

                <p className="text-gray-800 text-sm sm:text-xs float-right mt-1 font-medium">
                  {contactData.coverLetterdescription || "N/A"}
                </p>
              </div>
            ) : ""
        }

      </div>

    </div>
  )
}

export default AdvancedDetails;