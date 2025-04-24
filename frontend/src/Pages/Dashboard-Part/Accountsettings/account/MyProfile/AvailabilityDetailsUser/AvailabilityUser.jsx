import React, { useEffect, useState } from 'react';

import { FaMinus, } from 'react-icons/fa';
import Cookies from "js-cookie";
import "react-datepicker/dist/react-datepicker.css";
import EditAvailabilityDetails from './EditAvailabilityDetails';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';

const AvailabilityUser = (
  // {
  //   userData, setUserData
  //   // selectedOption,setSelectedOption,times,setTimes,setSelectedTimezone,selectedTimezone

  // }
) => {
   const {contacts,setContacts} = useCustomContext();
   const navigate = useNavigate();
 const [userData, setUserData] = useState({})
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [times, setTimes] = useState({
    Monday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Tuesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Wednesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Thursday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Friday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Saturday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Sunday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
  });

  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchData =  () => {
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

  }, [userId,contacts]);


  const fetchData = () => {
    if (!userData) return;

    // Set timezone and preferred duration regardless of availability
    // typeof userData.timeZone === 'object' ? userData.timeZone.label : userData.timeZone
    // setSelectedTimezone(userData.timeZone || '');
    setSelectedTimezone(typeof userData.timeZone === 'object' ? userData.timeZone.label : userData.timeZone)
    
    setSelectedOption(userData.preferredDuration || null);

    // Only process availability if it exists and has data
    if (userData.availability && userData.availability.length > 0) {
      const updatedTimes = {
        Monday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Tuesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Wednesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Thursday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Friday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Saturday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Sunday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
      };

      const days = userData.availability[0].days || [];
      days.forEach(day => {
        updatedTimes[day.day] = day.timeSlots.map(slot => ({
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        }));
      });

      setTimes(updatedTimes);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center mt-4">
        <h3 className="text-lg font-medium">Availability</h3>

        <button
          onClick={() => navigate(`/account-settings/my-profile/availability-edit/${userId}`)}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6 
    sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8  bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg shadow">





        <div className="text-sm flex flex-col">
          {/* <h2 className="block text-sm font-medium text-gray-900 mb-2">Availability</h2> */}
          <div className="border border-gray-300 rounded-lg w-full max-w-md  p-4 
        sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-4">
            {Object.entries(times).map(([day, slots]) => (
              <div key={day} className="mb-3 last:mb-0">
                <div className="flex items-start gap-3 
              sm:gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3">
                  <p className="border border-gray-400 rounded text-center font-medium
                min-w-[70px] py-2
                sm:text-xs sm:min-w-[60px] sm:py-1.5
                md:min-w-[70px]
                lg:min-w-[80px]
                xl:min-w-[90px]
                2xl:min-w-[100px]">
                    {day}</p>
                  <div className="flex-1 space-y-2 sm:space-y-1 md:space-y-1.5">
                    {slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3 
                    sm:gap-2 md:gap-2 lg:gap-3">

                        {slot.startTime === 'unavailable'
                          ? <span className="w-full py-2 bg-gray-200 text-center rounded text-sm 
                        sm:text-xs md:text-sm">Unavailable</span>
                          :
                          <>
                            <span className="border border-gray-400 rounded text-center py-2 px-3 
                          w-24 text-sm
                          sm:w-2/3 sm:text-xs sm:px-2
                          md:w-2/3 md:px-2.5
                          lg:w-2/3
                          xl:w-2/3
                          2xl:w-32">
                              {slot.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <FaMinus className="text-gray-600 
                          sm:text-xs md:text-sm lg:text-sm" />
                            <span className="border border-gray-400 rounded text-center py-2 px-3 
                          w-24 text-sm
                          sm:w-2/3 sm:text-xs sm:px-2
                          md:w-2/3 md:px-2.5
                          lg:w-2/3
                          xl:w-2/3
                          2xl:w-32" >
                              {slot.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>

                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 ">
          <div>
            <p className="text-sm text-gray-500 sm:text-xs md:text-sm lg:text-base">Timezone</p>
            <div className="flex-grow w-full overflow-visible">
              <p className="font-medium 
            sm:text-sm md:text-base lg:text-lg">{selectedTimezone || "N/A"}</p>
            </div>
          </div>


          <div className="mt-5">
            <p className="text-sm text-gray-500 sm:text-xs md:text-sm lg:text-base">Preferred Duration</p>
            <p className="font-medium sm:text-sm md:text-base lg:text-lg">{selectedOption || "N/A"} minutes</p>
          </div>
        </div>



      </div>

      {/* {
        isBasicModalOpen && (
          <EditAvailabilityDetails
            isBasicModalOpen={isBasicModalOpen}
            setIsBasicModalOpen={setIsBasicModalOpen}

            times={times}
            setTimes={setTimes}
            setSelectedOption={setSelectedOption}
            setSelectedTimezone={setSelectedTimezone}
            selectedTimezone={selectedTimezone}
            selectedOption={selectedOption}
            userData={userData}
            setUserData={setUserData}
          />
        )
      } */}

    </div>
  )
}

export default AvailabilityUser