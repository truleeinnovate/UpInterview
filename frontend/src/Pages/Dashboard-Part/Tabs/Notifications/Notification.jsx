import React, { useState, useEffect } from 'react';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as FaArrowRight } from '../../../../icons/FaArrowRight.svg';
// import { ReactComponent as AiTwotoneSchedule } from '../../../../icons/AiTwotoneSchedule.svg';
// import { ReactComponent as PiNotificationBold } from '../../../../icons/PiNotificationBold.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";

const Notification = ({ isassesmentProfileDetails, objectId, candidateId, category }) => {
  console.log("ObjectId", objectId);
  const [notificationsData, setNotificationsData] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        let url = `${process.env.REACT_APP_API_URL}/notification?category=${category}`;

        if (category === "assessment" || category === "interview") {
          url += `&objectId=${objectId}`;
        } else if (category === "candidate") {
          url += `&candidateId=${candidateId}`;
        }

        const response = await axios.get(url);
        const sortedNotifications = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotificationsData(sortedNotifications);
        setFilteredNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (category && ((category === "assessment" || category === "interview") && objectId) || (category === "candidate" && candidateId)) {
      fetchNotificationData();
    }
  }, [category, objectId, candidateId]);

  useEffect(() => {
    const filteredData = notificationsData.filter(notification =>
      notification.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotifications(filteredData);
    setCurrentPage(0); // Reset to first page when searching
  }, [searchQuery, notificationsData]);

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleFilterIconClick = () => {
    setIsFilterActive(!isFilterActive);
  };

  const handleFilterChange = (filterType) => {
    const now = new Date();
    let filteredData = notificationsData;
  
    if (filterType !== "all") {
      filteredData = notificationsData.filter((notification) => {
        const notificationDate = new Date(notification.createdAt);
        switch (filterType) {
          case "day":
            return now - notificationDate <= 24 * 60 * 60 * 1000; // Last 24 hours
          case "week":
            return now - notificationDate <= 7 * 24 * 60 * 60 * 1000; // Last 7 days
          case "month":
            return now - notificationDate <= 30 * 24 * 60 * 60 * 1000; // Last 30 days
          case "year":
            return now - notificationDate <= 365 * 24 * 60 * 60 * 1000; // Last 1 year
          default:
            return true;
        }
      });
    }
  
    setFilteredNotifications(filteredData);
    setCurrentPage(0); // Reset to the first page when filtering
  };
  

  return (
    <div>
      <div className="mt-7 p-4 bg-gray-100">
        <div className="mb-5">
          <div className="flex justify-between">
            <div className="font-medium text-xl">Notification</div>
            <div className="flex items-center">
              <div className="relative">
                <div className="searchintabs border rounded-md relative py-[2px]">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <button type="submit" className="p-2">
                      <IoMdSearch className="text-custom-blue" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-full h-8 pl-10"
                  />
                </div>
              </div>

              <span className="p-2 text-xl sm:text-sm md:text-sm">
                {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
              </span>

              <div className="flex">
                <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={prevPage}
                  >
                    <IoIosArrowBack className="text-custom-blue" />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 || totalPages === 0 ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={nextPage}
                  >
                    <IoIosArrowForward className="text-custom-blue" />
                  </span>
                </Tooltip>
                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                  <Tooltip
                    title="Filter"
                    enterDelay={300}
                    leaveDelay={100}
                    arrow
                  >
                    <span
                      onClick={handleFilterIconClick}
                      style={{
                        opacity:
                        filteredNotifications.length === 0 ? 0.2 : 1,
                        pointerEvents:
                        filteredNotifications.length === 0
                            ? "none"
                            : "auto",
                      }}
                    >
                      {isFilterActive ? (
                        <LuFilterX className="text-custom-blue" />
                      ) : (
                        <FiFilter className="text-custom-blue" />
                      )}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] sm:max-h-[50vh] p-2">
  {/* Filter and Checkbox Section */}
  <div className="flex justify-between items-center mb-4 px-7">
    <div className="flex items-center">
      <input type="checkbox" className="mr-2 w-5 h-5" />
      <select
        className="border rounded-md px-3 py-1"
        onChange={(e) => handleFilterChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="day">Last 24 Hours</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="year">Last Year</option>
      </select>
    </div>
  </div>

  {/* Notifications List */}
  {filteredNotifications.length === 0 ? (
    <p className="text-center p-3">No data found.</p>
  ) : (
    filteredNotifications
      .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
      .map((notification, index) => (
        <div
          key={index}
          className="flex justify-between items-start mx-7 py-4 border-t border-b border-gray-400"
        >
          <div className="flex items-start">
            <div className="w-16">
              {/* {notification.notificationType === "email" && (
                <MdEmail className="text-3xl mt-2 text-blue-500" />
              )}
              {notification.notificationType === "whatsapp" && (
                <FaWhatsapp className="text-3xl mt-2 text-green-500" />
              )} */}
            </div>
            <div className="ml-4">
              <p>{notification.body}</p>
              <p className="mb-2 text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-2xl mt-2 cursor-pointer">
            <FaArrowRight className="text-black" />
          </div>
        </div>
      ))
  )}
</div>

      </div>
    </div>
  );
};

export default Notification;
