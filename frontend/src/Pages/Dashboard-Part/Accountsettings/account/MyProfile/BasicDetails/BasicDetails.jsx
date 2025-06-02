import React, { useEffect, useState } from 'react'
// import noImage from '../../../../../Dashboard-Part/Images/no-photo.png';
// import BasicDetailsEditPage from './BasicDetailsEditPage';
// import axios from 'axios';
import Cookies from "js-cookie";
// import SidebarProfile from '../../Sidebar';
// import { navigation } from '../../../mockData/navigationData';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import BasicDetailsEditPage from './BasicDetailsEditPage';

const BasicDetails = ({mode,usersId}) => {
  const { usersRes  } = useCustomContext();


  const [contactData, setContactData] = useState({})
  const navigate = useNavigate();
   const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // const [isBasicUserModalOpen, setIsBasicUserModalOpen] = useState(false);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;

  
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
    <>
      {/* <SettingsPage /> */}
      {/* <SidebarProfile  isSidebarOpen = {isSidebarOpen} handleTabChange ={handleTabChange} activeTab ={activeTab} filteredNavigation={filteredNavigation}/> */}
      <div className="space-y-6">
        <div className={`flex   items-center  ${mode === 'users' ? 'justify-end' : "justify-between mt-4"}`}>
          <h3 className={`text-lg font-medium ${mode === 'users' ? 'hidden' : ""}`}>Basic Details</h3>

          <button
            onClick={() => {
              mode === 'users' ? 
               setIsSidebarOpen(true)
              //  navigate(`/account-settings/users/details/${usersId}/basic-edit`,
      
               
               :
              navigate(`/account-settings/my-profile/basic-edit/${contactData?.contactId}`)
            }
              //  onClick={() =>   navigate(`basic/edit/${userId}`)
              //  { navigate(`edit/${userId}`)}
            }
            className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
          >
            Edit
          </button>

        </div>

        <div className="bg-white p-6 rounded-lg shadow">

          {/* image */}
          {/* <div className="sm:col-span-6 col-span-2">
                              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-6 col-span-1">
                                     
                                  <div className="flex flex-col items-center space-x-4">
                                  
                                    <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                                      {contactData.imageData ? (
                                        <img src={contactData.imageData.path} alt="Preview" className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={noImage} alt="Preview" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">Profile </p>
        
                                  </div>
                                  
                                </div>
        
                              </div>
        
                            </div> */}


          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{contactData.email || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium ">{contactData.firstName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{contactData.lastName || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date Of Birth</p>
              <p className="font-medium">{contactData.dateOfBirth || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Profile ID</p>
              <p className="font-medium">{contactData.profileId || "N/A"}</p>
            </div>


            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{contactData.gender || "N/A"}</p>
            </div>



            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{contactData.countryCode || "N/A"} - {contactData.phone || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Linked In</p>
              <p className="font-medium truncate">{contactData.linkedinUrl || "N/A"}</p>
            </div>
            {
              contactData.portfolioUrl && <div>
                <p className="text-sm text-gray-500">Portfolio URL</p>
                <p className="font-medium truncate">{contactData.portfolioUrl || "N/A"}</p>
              </div> 
            }

             <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium truncate">{contactData?.label || "N/A"}</p>
            </div>

             {
              contactData.roleName === 'Internal_Interviewer' &&
               <div>
                <p className="text-sm text-gray-500">isProfile Completed</p>
                <p className="font-medium truncate">{contactData.isProfileCompleted || "N/A"}</p>
               </div> 
            }



          </div>
        </div>



      </div>

      {isSidebarOpen && 
      <BasicDetailsEditPage  id={usersId}/>
        
      }


    </>
  )
}

export default BasicDetails