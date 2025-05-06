import React, { useEffect, useState } from 'react'
import EditAdvacedDetails from './EditAdvacedDetails';
import axios from 'axios';
import Cookies from "js-cookie";
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';

const AdvancedDetails = () => {
  const { contacts, setContacts } = useCustomContext();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({})

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;

  console.log("userId AdvancedDetails", userId);

  useEffect(() => {
    const fetchData = () => {
      try {

        // "67d77741a9e3fc000cbf61fd"
        const user = contacts.find(user => user._id === userId);
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
      <div className="flex justify-between items-center  mt-4">
        <h3 className="text-lg font-medium">Advanced Details</h3>

        <button
          onClick={
            () => { navigate(`/account-settings/my-profile/advanced-edit/${userId}`) }
          }
          // onClick={() => setIsBasicModalOpen(true)}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>


      <div className="space-y-4 bg-white p-6 rounded-lg shadow">

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-medium">{userData.CurrentRole || "N/A"}</p>
          </div>


          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{userData.industry || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Years of Experience</p>
            <p className="font-medium">{userData.YearsOfExperience || "N/A"} Years</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{userData.location || "N/A"}</p>
          </div>



        </div>


        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Resume PDF </p>
            <p className="font-medium">{userData.ResumePdf || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cover Letter </p>
            <p className="font-medium">{userData.coverletter || "N/A"}</p>
          </div>

        </div>


        {/* <div>
                <p className="text-sm text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                      {skill || "N/A"}
                    </span>
                  ))}
                </div>
              </div> */}

        {/*  Cover Letter Description */}
        {
          userData.coverLetterdescription ?
            (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  Cover Letter Description
                </span>

                <p className="text-gray-800 text-sm sm:text-xs float-right mt-3 font-medium">
                  {userData.coverLetterdescription || "N/A"}
                </p>
              </div>
            ) : ""
        }




      </div>



      {/* {isBasicModalOpen && (

            <EditAdvacedDetails
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

export default AdvancedDetails;