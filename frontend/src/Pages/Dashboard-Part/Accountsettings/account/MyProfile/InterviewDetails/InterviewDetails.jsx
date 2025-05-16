import React, { useEffect, useState } from 'react'
import EditInterviewDetails from './EditInterviewDetails';
import Cookies from "js-cookie";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';

const InterviewUserDetails = (
  // {userData, setUserData }
) => {
  const { contacts, setContacts } = useCustomContext();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({})

 
   const authToken = Cookies.get("authToken");
   const tokenPayload = decodeJwt(authToken);
 
   const userId = tokenPayload.userId;

  useEffect(() => {
    const fetchData = async () => {
      try {

        // "67d77741a9e3fc000cbf61fd"
        const user = contacts.find(user => user.ownerId === userId);
        // console.log("user", user);

        if (user) {
          setUserData(user);

        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // setLoading(false);
      }
    };


    fetchData();

  }, [userId, contacts]);




  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-4">
        <h3 className="text-lg font-medium">Interview Details</h3>

        <button
          onClick={() => { navigate(`/account-settings/my-profile/interview-edit/${userId}`) }}
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
              {userData?.technologies && Array.isArray(userData.technologies) && userData.technologies.length > 0 ? (
                userData.technologies.map((technology, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {technology || "N/A"}
                  </span>
                ))
              ) : (
                "No Technologies Available"
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData?.skills && Array.isArray(userData.skills) && userData.skills.length > 0 ? (
                userData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {skill || "N/A"}
                  </span>
                ))
              ) : (
                "No Skills Available"
              )}
            </div>
          </div>




        </div>



        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">





          <div>
            <p className="text-sm text-gray-500">Previous Experience Conducting Interviews</p>
            <p className="font-medium">{userData?.PreviousExperienceConductingInterviews || "N/A"}</p>
          </div>

          {userData?.PreviousExperienceConductingInterviews === "yes" &&

            <>         <div>
              <span className="text-sm text-gray-500">Previous Experience</span>
              <p className="font-medium">{userData?.PreviousExperienceConductingInterviewsYears || "N/A"} Years</p>
            </div>

            </>
          }



          <div>
            <p className="text-sm text-gray-500">Expertise Level Conducting Interviews</p>
            <p className="font-medium">{userData?.ExpertiseLevel_ConductingInterviews || "NO"} </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hourly Charges</p>
            <p className="font-medium">$ {userData.hourlyRate || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Interview Formats You Offer</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData?.InterviewFormatWeOffer && Array.isArray(userData.InterviewFormatWeOffer) && userData.InterviewFormatWeOffer.length > 0 ? (
                userData.InterviewFormatWeOffer.map((interview, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {interview || "N/A"}
                  </span>
                ))
              ) : (
                "No Interview Formats You Offer Available"
              )}
            </div>
            {/* <p className="font-medium">$ {userData.InterviewFormatWeOffer || "N/A"}</p> */}
          </div>

          {/* <div>
          <p className="text-sm text-gray-500">Mock Interview</p>
          <p>{userData?.IsReadyForMockInterviews || "NO"}</p>
       
        </div> */}

          <div>
            <p className="text-sm text-gray-500">No Show Policy</p>
            <p className="font-medium">{userData?.NoShowPolicy || "N/A"}</p>
          </div>


          <div>
            <p className="text-sm text-gray-500">Professional Title</p>
            <p>{userData?.professionalTitle || "N/A"}</p>
          </div>

          


        </div>

        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500">
            Professional Bio
          </span>

          <p className="text-gray-800 text-sm sm:text-xs float-right mt-3 font-medium">
            {userData.bio || "N/A"}
          </p>
        </div>


      </div>
      {/* // )} */}

      {/* {isBasicModalOpen && (

     <EditInterviewDetails 
     isBasicModalOpen={isBasicModalOpen}
     setIsBasicModalOpen={setIsBasicModalOpen}
     // editData={editData}
     // setEditData={setEditData}
     userData={userData}
     setUserData={setUserData}
  
     
     />
       
    )} */}

    </div>
  )
}

export default InterviewUserDetails