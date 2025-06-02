import  { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';

const InterviewUserDetails = ({mode,usersId}) => {
  const { usersRes  } = useCustomContext();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({})

   const authToken = Cookies.get("authToken");
   const tokenPayload = decodeJwt(authToken);
 
   const userId = tokenPayload?.userId;

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

 useEffect(() => {
  const selectedContact = usersId
    ? usersRes.find(user => user?.contactId === usersId)
    : usersRes.find(user => user?._id === userId);

  if (selectedContact) {
    setContactData(selectedContact);
    console.log("Selected contact:", selectedContact);
  }
}, [usersId, userId, usersRes]);


  return (
    <div className="space-y-6">
      <div className={`flex  items-center  ${mode === 'users' ? 'justify-end' : "justify-between mt-4"}`}>
        <h3 className={`text-lg font-medium ${mode === 'users' ? 'hidden' : ""}`}>Interview Details</h3>

        <button
          onClick={() => { 
             mode === 'users' ? 
               navigate(`/account-settings/users/details/${usersId}/interview-edit`, {
  state: { from: `/account-settings/users/details/${usersId}` }
})
               :
              navigate(`/account-settings/my-profile/interview-edit/${contactData?.contactId}`)
          //  details/:idinterview-edit
            // navigate(`/account-settings/my-profile/interview-edit/${userId}`) 
          
          }}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>

      <div className="bg-white p-6 rounded-lg shadow">

        <div className="grid mb-2 grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">


          <div className='mt-2'>
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
            <p className="font-medium">{contactData?.previousExperienceConductingInterviews || "N/A"}</p>
          </div>

          {contactData?.previousExperienceConductingInterviews === "yes" &&

            <>      
               <div>
              <span className="text-sm text-gray-500">Previous Experience</span>
              <p className="font-medium">{contactData?.previousExperienceConductingInterviewsYears || "N/A"} Years</p>
            </div>

            </>
          }



          <div>
            <p className="text-sm text-gray-500">Expertise Level Conducting Interviews</p>
            <p className="font-medium">{contactData?.expertiseLevelConductingInterviews || "NO"} </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hourly Charges</p>
            <p className="font-medium">$ {contactData?.hourlyRate || "N/A"}</p>
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

          <div>
            <p className="text-sm text-gray-500">No Show Policy</p>
            <p className="font-medium">{contactData?.noShowPolicy || "N/A"}</p>
          </div>


          <div>
            <p className="text-sm text-gray-500">Professional Title</p>
            <p className='font-medium'>{contactData?.professionalTitle || "N/A"}</p>
          </div>

          


        </div>

        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500">
            Professional Bio
          </span>

          <p className="text-gray-800 text-sm sm:text-xs float-right mt-3 font-medium">
            {contactData?.bio || "N/A"}
          </p>
        </div>


      </div>
 

    </div>
  )
}

export default InterviewUserDetails