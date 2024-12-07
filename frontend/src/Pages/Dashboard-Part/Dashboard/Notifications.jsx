import { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";

import { ReactComponent as IoIosArrowBack } from '../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../icons/IoIosArrowForward.svg';
import { ReactComponent as IoMdSearch } from '../../../icons/IoMdSearch.svg';
import { ReactComponent as FaFilter } from '../../../icons/FiFilter.svg';
import { ReactComponent as FaCaretDown } from '../../../icons/FaCaretDown.svg';
import { ReactComponent as MdCancel } from '../../../icons/MdCancel.svg';
import { ReactComponent as FaClockRotateLeft } from '../../../icons/FaClockRotateLeft.svg';
import { ReactComponent as IoMdClock } from '../../../icons/IoMdClock.svg';
import { ReactComponent as FaArrowRight } from '../../../icons/FaArrowRight.svg';

const Notifications = () => {
  useEffect(() => {
    document.title = "Notifications";
  }, []);

  return (
    <div>
      <Notifications1 />
      <Notifications2 />
    </div>
  );
};

const Notifications1 = () => {
  return (
    <div className="fixed top-24 left-0 right-0">
      <div className="flex justify-between p-4">
        <div>
          <span className="p-3 w-fit text-lg font-semibold">Notifications</span>
        </div>
      </div>
    </div>
  );
};

const OffcanvasMenu = ({ isOpen, toggleMenu }) => {
  return (
    <div
      className="absolute w-72 text-sm bg-white border right-0 z-30 overflow-y-scroll"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
        height: isOpen ? "calc(100vh - 30%)" : "auto",
      }}
    >
      <div className="p-2">
        <h2 className="text-lg shadow-sm font-bold p-2 mb-4">Filter</h2>
        {[
          "Today",
          "Tomorrow",
          "This Week",
          "Next Week",
          "This Month",
          "Next Month",
        ].map((label) => (
          <div className="flex mt-2" key={label}>
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5" />
                <span className="ml-3">{label}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Notifications2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsData, setNotificationsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10; // Show 10 lines per page
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/notification`);
        setNotificationsData(response.data);
      } catch (error) {
        console.error("Error fetching notificationData:", error);
      }
    };
    fetchNotificationData();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const nextPage = () => {
    if (
      currentPage <
      Math.ceil(filteredNotifications.length / rowsPerPage) - 1
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Filter notifications based on the search query
  const filteredNotifications = notificationsData.filter((notification) =>
    notification.Body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="container mx-auto mt-5 flex">
        <div
          className={`flex-grow transition-all duration-300 ${
            isMenuOpen ? "mr-72" : ""
          }`}
        >
          <div className="mx-3 mb-16">
            <div className="flex items-center justify-between">
              <div className="fixed top-24 left-0 right-0 z-10">
                <div className="flex justify-between p-4">
                  <div className="flex">
                    <div className="cursor-pointer">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 mt-10 ml-8"
                        />
                        <div className="cursor-pointer mt-10">
                          <FaCaretDown className="ml-5" />
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="searchintabs mr-5 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center">
                          <button
                            type="button"
                            onClick={() => {}}
                            className="p-2"
                          >
                            <IoMdSearch />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          className="pl-10 pr-12"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="p-2 text-xl mr-2">
                        {currentPage + 1}/
                        {Math.ceil(filteredNotifications.length / rowsPerPage)}
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
                          className={`border-2 p-2 mr-2 ${
                            currentPage === 0
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={prevPage}
                        >
                          <IoIosArrowBack className="text-2xl" />
                        </span>
                      </Tooltip>
                      <Tooltip
                        title="Next"
                        enterDelay={300}
                        leaveDelay={100}
                        arrow
                      >
                        <span
                          className={`border-2 p-2 ${
                            currentPage >=
                            Math.ceil(
                              filteredNotifications.length / rowsPerPage
                            ) -
                              1
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={nextPage}
                        >
                          <IoIosArrowForward className="text-2xl" />
                        </span>
                      </Tooltip>
                    </div>
                    <div className="ml-4 text-2xl border-2 rounded-md p-2">
                      <Tooltip
                        title="Filter"
                        enterDelay={300}
                        leaveDelay={100}
                        arrow
                      >
                        <span
                          onClick={
                            notificationsData.length === 0 ? null : toggleMenu
                          }
                          style={{
                            opacity: notificationsData.length === 0 ? 0.2 : 1,
                            pointerEvents:
                              notificationsData.length === 0 ? "none" : "auto",
                          }}
                        >
                          <FaFilter
                            className={`${isMenuOpen ? "text-blue-500" : ""}`}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {isMenuOpen && (
                  <OffcanvasMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
                )}
              </div>
            </div>
          </div>
          <div className="fixed top-56 left-0 right-0 mx-auto mb-10">
            <div
              className="flex-grow"
              style={{ marginRight: isMenuOpen ? "290px" : "0" }}
            >
              <div className="flex flex-col text-sm w-full overflow-y-scroll max-h-[420px]">
                {filteredNotifications
                  .slice(
                    currentPage * rowsPerPage,
                    (currentPage + 1) * rowsPerPage
                  )
                  .map((interview, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start mx-7 my-4"
                    >
                      <div className="flex items-start">
                        <div className="w-16">
                          {interview.Status === "Scheduled" && (
                            <IoMdClock className="text-3xl mt-2" />
                          )}
                          {interview.Status === "ReSchedule" && (
                            <FaClockRotateLeft className="text-3xl mt-2" />
                          )}
                          {interview.Status === "ScheduleCancel" && (
                            <MdCancel className="text-3xl mt-2" />
                          )}
                        </div>
                        <div className="ml-4">
                          {" "}
                          {/* Added margin for spacing */}
                          <p className="font-bold">
                            {interview.Status === "Scheduled"
                              ? "Interview Scheduled"
                              : interview.Status === "ReSchedule"
                              ? "Interview Rescheduled"
                              : "Interview Cancelled"}
                          </p>
                          <p>{interview.Body}</p>
                          <p className="mb-2">{interview.CreatedDate}</p>
                        </div>
                      </div>
                      <div
                        className="text-xl mt-2 cursor-pointer"
                        onClick={() => {}}
                      >
                        <FaArrowRight />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
