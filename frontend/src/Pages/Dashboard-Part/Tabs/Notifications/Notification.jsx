import React, { useState } from 'react'
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as FaArrowRight } from '../../../../icons/FaArrowRight.svg';
import { ReactComponent as AiTwotoneSchedule } from '../../../../icons/AiTwotoneSchedule.svg';
import { ReactComponent as PiNotificationBold } from '../../../../icons/PiNotificationBold.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import Tooltip from "@mui/material/Tooltip";

const Notification = ({isassesmentProfileDetails}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isArrowUp2, setIsArrowUp2] = useState(false);
    const toggleArrow2 = () => {
      setIsArrowUp2(!isArrowUp2);
    };
    const [isFilterActive, setIsFilterActive] = useState(false);
    const candidateData = [];
  
    const handleSearchInputChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const prevPage = () => {
      if (currentPage > 0) setCurrentPage(currentPage - 1);
    };
  
    const nextPage = () => {
      if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };
  
    const handleFilterIconClick = () => {
      setIsFilterActive(!isFilterActive);
    };
  
    const [openPopup, setOpenPopup] = useState("");
    const filteredNotifications = [];
  
    const handleNotificationFilterChange = (filter) => {
      console.log(`Filter changed to: ${filter}`);
    };

  return (
    <div>
    <div className="mt-7">
      <div className={`flex bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl p-2 text-md ${isassesmentProfileDetails ? "justify-end" : " space-x-8  justify-between items-center "}`}>
        {!isassesmentProfileDetails && (
            <>
        <p className="pr-4 ml-2 w-1/4">Developer</p>
        <p className="rounded px-2 ml-4 text-center">IBM</p>
            </>
        )}
        <div
          className="flex items-center text-3xl ml-3 mr-3"
          onClick={toggleArrow2}
        >
          {isArrowUp2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      <div
        className="p-4 bg-gray-100"
        style={{ display: isArrowUp2 ? "block" : "none" }}
      >
        <div className="mb-5">
          <div className="flex justify-between">
            <div className=" font-medium text-xl">
              Notification
            </div>
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
                    onChange={handleSearchInputChange}
                    className="rounded-full h-8"
                  />
                </div>
              </div>

              <div>
                <span className="p-2 text-xl sm:text-sm md:text-sm">
                  {currentPage + 1}/{totalPages}
                </span>
              </div>
              <div className="flex">
                <Tooltip
                  title="Previous"
                  enterDelay={300}
                  leaveDelay={100}
                  arrow
                >
                  <span
                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0
                      ? " cursor-not-allowed"
                      : ""
                      }`}
                    onClick={prevPage}
                  >
                    <IoIosArrowBack className="text-custom-blue" />
                  </span>
                </Tooltip>

                <Tooltip
                  title="Next"
                  enterDelay={300}
                  leaveDelay={100}
                  arrow
                >
                  <span
                    className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1
                      ? " cursor-not-allowed"
                      : ""
                      }`}
                    onClick={nextPage}
                  >
                    <IoIosArrowForward className="text-custom-blue" />
                  </span>
                </Tooltip>
              </div>
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
                        candidateData.length === 0 ? 0.2 : 1,
                      pointerEvents:
                        candidateData.length === 0
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
    </div>
    {/* Notification Popup */}
    {openPopup === "notification" && (
      <div className="absolute right-80 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() =>
            handleNotificationFilterChange("thisWeek")
          }
        >
          This Week
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() =>
            handleNotificationFilterChange("nextWeek")
          }
        >
          Next Week
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() =>
            handleNotificationFilterChange("thisMonth")
          }
        >
          This Month
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() => handleNotificationFilterChange("all")}
        >
          All
        </button>
      </div>
    )}
    {filteredNotifications.length === 0 ? (
      <p className="text-center p-3">No data found.</p>
    ) : (
      filteredNotifications.slice(0, 3).map((notification, i) => (
        <div
          key={i}
          className="flex text-sm border-b w-full justify-between"
        >
          <div className="flex item-center mt-2">
            <div className="w-14 ml-3 mt-1">
              {notification.Status === "Scheduled" ? (
                <AiTwotoneSchedule className="text-xl" />
              ) : (
                <PiNotificationBold className="text-xl" />
              )}
            </div>
            <div>
              <p className="font-bold">
                {notification.Status === "Scheduled"
                  ? "Interview Scheduled"
                  : "New Interview Requests"}
              </p>
              <p>{notification.Body}</p>
              <p className="mb-2">{notification.CreatedDate}</p>
            </div>
          </div>
          <div className="text-xl mt-12 mr-2">
            <FaArrowRight />
          </div>
        </div>
      ))
    )}
  </div>
  )
}

export default Notification