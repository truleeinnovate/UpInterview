import React, { useState } from "react";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import { IoMdSearch } from "react-icons/io";
import { LuFilterX } from "react-icons/lu";
import { FiFilter } from "react-icons/fi";  
import Tooltip from "@mui/material/Tooltip";


const Interviewers = ({ onClose }) => {
  const [selectedIndices, setSelectedIndices] = useState([]);

  const handleSelectClick = (index) => {
    setSelectedIndices((prevSelectedIndices) =>
      prevSelectedIndices.includes(index)
        ? prevSelectedIndices.filter((i) => i !== index)
        : [...prevSelectedIndices, index]
    );
  };

  const interviewers = [
    {
      name: "Rupha",
      role: "Full stack Developer",
      experience: "2 - 3 Years",
      skills: "Node.js, React.js",
    },
    {
      name: "Rupha",
      role: "Full stack Developer",
      experience: "2 - 3 Years",
      skills: "Node.js, React.js",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const [isFilterActive, setIsFilterActive] = useState(false);

  const handleFilterIconClick = () => {
    setIsFilterActive(!isFilterActive);
  };




  return (
    <div>
      <div className="flex justify-between p-4 border border-b bg-custom-blue text-white z-10">
        <h2 className="text-lg font-bold">Internal Interviewers</h2>
        <button onClick={onClose} className="focus:outline-none">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

          {/* filter and search */}
          <div className="flex justify-between my-2 mr-4">
                <div className="relative">
                  <div className="w-[250px] ml-5 border rounded-md relative">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button type="submit" className="p-2">
                        <IoMdSearch className="text-custom-blue" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search interviewers"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="rounded-full h-8 pl-10 text-left"
                    />
                  </div>
                </div>



                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2 ">
                  <Tooltip
                    title="Filter"
                    enterDelay={300}
                    leaveDelay={100}
                    arrow
                  >
                    <span
                      onClick={handleFilterIconClick}
                      style={{
                        opacity: interviewers.length === 0 ? 0.2 : 1,
                        pointerEvents:
                          interviewers.length === 0 ? "none" : "auto",
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

      <div className="flex">
        {interviewers.map((interviewer, index) => (
          <div
            key={index}
            className="border border-custom-blue m-4 w-[300px] bg-white rounded-lg overflow-hidden"
            >
            <div className="flex items-start gap-4 p-4 bg-[#F5F9FA]">
              <img
                src={interviewer.image || femaleImage}
                alt="Interviewer"
                className="w-16 h-16 rounded-full"
              />
              <div className="text-sm">
                <p className="font-bold text-blue-400">{interviewer.name}</p>
                <p>{interviewer.company}</p>
                <p>{interviewer.role}</p>
                <p>{interviewer.experience}</p>
                <p>{interviewer.skills}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-2 border-t">
              <button className="border border-custom-blue py-1 px-4 rounded">
                View
              </button>
              <button
                className={`border border-custom-blue py-1 px-4 rounded ${
                  selectedIndices.includes(index) ? "bg-custom-blue text-white" : ""
                }`}
                onClick={() => handleSelectClick(index)}
              >
                {selectedIndices.includes(index) ? "Selected" : "Select"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="footer-buttons flex justify-end">
        <button type="submit" className="footer-button bg-custom-blue">
          Schedule
        </button>
      </div>{" "}
    </div>
  );
};

export default Interviewers;
