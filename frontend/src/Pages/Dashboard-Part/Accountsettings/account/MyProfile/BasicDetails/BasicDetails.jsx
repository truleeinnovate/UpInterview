import React, { useEffect, useState } from 'react'

import noImage from '../../../../../Dashboard-Part/Images/no-photo.png';
import BasicDetailsEditPage from './BasicDetailsEditPage';
import axios from 'axios';
import Cookies from "js-cookie";
import SidebarProfile from '../../Sidebar';
import { navigation } from '../../../mockData/navigationData';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';

const BasicDetails = () => {
  const {contacts,setContacts} = useCustomContext();


  const [userData, setUserData] = useState({})
  const navigate = useNavigate();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isBasicUserModalOpen, setIsBasicUserModalOpen] = useState(false);

const userId = Cookies.get("userId");

// const organization = Cookies.get("organization") === "true"; 
  // const activeTab =  'my-profile'

        useEffect(() => {
            const fetchData =() => {
              try {
             
            const user = contacts.find(user => user._id === userId);

            console.log("user",user);
            
  
            if (user) {
              setUserData(user);
           
            }
                
              } catch (error) {
                console.error('Error fetching data:', error);
              } finally {
                // setLoading(false);
              }
            };
        
            if (userId) {
              fetchData();
            }
          }, [userId,contacts]);


          
   

  return (
    <>
    {/* <SettingsPage /> */}
   {/* <SidebarProfile  isSidebarOpen = {isSidebarOpen} handleTabChange ={handleTabChange} activeTab ={activeTab} filteredNavigation={filteredNavigation}/> */}
 <div className="space-y-6">
       <div className="flex justify-between items-center mt-4">
         <h3 className="text-lg font-medium">Basic Details</h3>
      
           <button
           onClick={() =>{
             navigate(`/account-settings/my-profile/basic-edit/${userId}`)}
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
                                      {userData.imageData ? (
                                        <img src={userData.imageData.path} alt="Preview" className="w-full h-full object-cover" />
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
             <p className="font-medium">{userData.email || "N/A"}</p>
           </div>
           
           <div>
             <p className="text-sm text-gray-500">First Name</p>
             <p className="font-medium">{userData.firstName || "N/A"}</p>
           </div>
           <div>
             <p className="text-sm text-gray-500">Last Name</p>
             <p className="font-medium">{userData.lastName || "N/A"}</p>
           </div>

           <div>
             <p className="text-sm text-gray-500">Date Of Birth</p>
             <p className="font-medium">{userData.dateOfBirth || "N/A"}</p>
           </div>

           <div>
             <p className="text-sm text-gray-500">Profile ID</p>
             <p className="font-medium">{userData.profileId || "N/A"}</p>
           </div>
 
           
           <div>
             <p className="text-sm text-gray-500">Gender</p>
             <p className="font-medium">{userData.gender || "N/A"}</p>
           </div>


          
           <div>
             <p className="text-sm text-gray-500">Phone</p>
             <p className="font-medium">{userData.countryCode || "N/A"} - {userData.phone || "N/A"}</p>
           </div>
          
           <div>
                <p className="text-sm text-gray-500">Linked In</p>
                <p className="font-medium">{userData.linkedinUrl || "N/A"}</p>
              </div>
              {
                userData.portfolioUrl ?  <div>
                <p className="text-sm text-gray-500">Portfolio URL</p>
                <p className="font-medium">{userData.portfolioUrl || "N/A"}</p>
              </div> : ""
              }
          
 
 
         </div>
         </div>


 
     </div>


     </>
  )
}

export default BasicDetails 

  