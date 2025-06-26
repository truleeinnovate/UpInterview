import { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import { useUserProfile } from '../../../../../../apiHooks/useUsers';

const InterviewUserDetails = ({ mode, usersId, setInterviewEditOpen }) => {
  const { usersRes } = useCustomContext();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({})

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload?.userId;
  const ownerId = usersId || userId;

  const { userProfile, isLoading, isError, error } = useUserProfile(ownerId)


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
    if (!userProfile || !userProfile._id) return;
    if (userProfile) {

      // console.log("contact userProfile",userProfile )
      setContactData(userProfile);
    }
  }, [userProfile, ownerId, userProfile._id]);

  console.log("contactData?.contactId", contactData);


  return (
    <div>
      <div className={`flex  items-center  ${mode === 'users' ? 'justify-end' : "justify-between mt-4 py-2"}`}>
        <h3 className={`text-lg font-medium ${mode === 'users' ? 'hidden' : ""}`}>Interview Details</h3>

        <button
          onClick={() => {
            mode === 'users' ?
              setInterviewEditOpen(true)
              :
              navigate(`/account-settings/my-profile/interview-edit/${contactData?._id}`)
            //  details/:idinterview-edit
            // navigate(`/account-settings/my-profile/interview-edit/${userId}`) 

          }}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>

      <div className={`bg-white rounded-lg space-y-4 ${mode !== 'users' ? 'p-4' : ''}`}>

        <div className="grid mb-2 grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">


          <div className=''>
            <p className="text-sm text-gray-500">Technologies</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contactData?.technologies && Array.isArray(contactData.technologies) && contactData?.technologies.length > 0 ? (
                contactData?.technologies.map((technology, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {technology || "N/A"}
                  </span>
                ))
              ) : (
                <span className='font-medium'>No Technologies Available</span>

              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contactData?.skills && Array.isArray(contactData?.skills) && contactData?.skills.length > 0 ? (
                contactData?.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {skill || "N/A"}
                  </span>
                ))
              ) : (
                <span className='font-medium'>No Skills Available</span>
              )}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Previous Experience Conducting Interviews</p>
            <p className="font-medium">{contactData?.previousExperienceConductingInterviews || 'Not Provided'}</p>
          </div>

          {contactData?.previousExperienceConductingInterviews === "yes" &&

            <>
              <div>
                <span className="text-sm text-gray-500">Previous Experience</span>
                <p className="font-medium">{contactData?.previousExperienceConductingInterviewsYears || 'Not Provided'} Years</p>
              </div>

            </>
          }



          <div>
            <p className="text-sm text-gray-500">Expertise Level Conducting Interviews</p>
            <p className="font-medium">{contactData?.expertiseLevelConductingInterviews || 'Not Provided'} </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hourly Charges</p>
            <p className="font-medium">$ {contactData?.hourlyRate || 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Interview Formats You Offer</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contactData?.interviewFormatWeOffer && Array.isArray(contactData?.interviewFormatWeOffer) && contactData?.interviewFormatWeOffer.length > 0 ? (
                contactData?.interviewFormatWeOffer.map((interview, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {interview || "N/A"}
                  </span>
                ))
              ) : (
                <span className='font-medium'>No Interview Formats You Offer Available</span>
              )}
            </div>
            {/* <p className="font-medium">$ {contactData?.InterviewFormatWeOffer || "N/A"}</p> */}
          </div>

          {/* <div>
          <p className="text-sm text-gray-500">Mock Interview</p>
          <p>{contactData?.IsReadyForMockInterviews || "NO"}</p>
       
        </div> */}
          {contactData?.expectedRatePerMockInterview &&
            <div>
              <p className="text-sm text-gray-500">Rate Per Mock Interview Charges</p>
              <p className="font-medium">{contactData?.expectedRatePerMockInterview ? `$ ${contactData?.expectedRatePerMockInterview}` : 'Not Provided'}</p>
            </div>
          }




          <div>
            <p className="text-sm text-gray-500">No Show Policy</p>
            <p className="font-medium">{contactData?.noShowPolicy || 'Not Provided'}</p>
          </div>



        </div>

             <div>
            <p className="text-sm text-gray-500">Professional Title</p>
            <p className='font-medium whitespace-pre-line break-words'>{contactData?.professionalTitle || 'Not Provided'}</p>
          </div>

        {/* <div className="flex flex-col mt-2"> */}
        <div className={`flex flex-col ${mode === 'users' ? 'w-full' : 'max-w-3xl'} break-words`}>
          <span className="text-sm text-gray-500">
            Professional Bio
          </span>

          {/* <p className="text-gray-800 text-sm sm:text-xs float-right mt-3 font-medium"> */}
          <p className="text-gray-800 text-sm sm:text-xs mt-1 font-medium whitespace-pre-line break-words">
            {contactData?.bio || 'Not Provided'}
          </p>
        </div>


      </div>


    </div>
  )
}

export default InterviewUserDetails