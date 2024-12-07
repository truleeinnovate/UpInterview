import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import EditPositionForm from "./Editpositionform";
  import axios from "axios";
import Notification from "../Notifications/Notification";

import { ReactComponent as TbFoldersOff } from "../../../../icons/TbFoldersOff.svg";
import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
import { ReactComponent as MdOutlineImageNotSupported } from "../../../../icons/MdOutlineImageNotSupported.svg";

const PositionProfileDetails = ({ position, onCloseprofile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("position");
  const [searchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState([]);

  useEffect(() => {
    const fetchCandidateData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/candidate`
        );
        if (Array.isArray(response.data)) {
          const candidatesWithImages = response.data.map((candidate) => {
            if (candidate.ImageData && candidate.ImageData.filename) {
              const imageUrl = `${
                process.env.REACT_APP_API_URL
              }/${candidate.ImageData.path.replace(/\\/g, "/")}`;
              return { ...candidate, imageUrl };
            }
            return candidate;
          });
          setCandidateData(candidatesWithImages);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  const FilteredData = () => {
    return candidateData.filter(
      (user) =>
        (user.name && user.name.includes(searchQuery)) ||
        (user.id && user.id.includes(searchQuery)) ||
        (user.email && user.email.includes(searchQuery)) ||
        (user.skills && user.skills.includes(searchQuery)) ||
        (user.phoneNumber && user.phoneNumber.includes(searchQuery))
    );
  };

  const currentFilteredRows = FilteredData();

  const trFontstyle = {
    fontSize: "13px",
  };
  const Navigate = useNavigate();

  const scheduling = () => {
    Navigate("/scheduletype_save");
  };

  const [currentPage] = useState(0);
  const rowsPerPage = 5;

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, candidateData.length);
  const currentRows = currentFilteredRows.slice(startIndex, endIndex).reverse();
  const closeModalAndNavigate = () => {
    navigate("/position");
  };

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleEditClick = (position) => {
    setShowNewCandidateContent(position);
  };
  const handleclose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const [filteredCandidates, setFilteredCandidates] = useState([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "candidate") {
      const filtered = candidateData.filter(
        (candidate) =>
          candidate.Position === position.title ||
          candidate.position === position.title
      );
      setFilteredCandidates(filtered);
    }
  };

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const matchedUser = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/users/${position.OwnerId}`
      );
      setUserProfile(matchedUser.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        {showMainContent && (
          <div>
            <div className="overflow-auto mx-10">
              <div>
                <div className=" my-3 flex justify-between sm:justify-start items-center">
                  {/* <button
                    className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                    onClick={onCloseprofile}
                  >
                    <IoArrowBack className="text-2xl" />
                  </button> */}
                  <p className="text-xl" onClick={onCloseprofile}>
                    <span className="text-[#217989] font-semibold cursor-pointer">
                      Positions
                    </span>{" "}
                    / {position.title}
                  </p>
                </div>
              </div>
              <div className="pb-2 sm:hidden md:hidden">
                <p className="text-xl space-x-10">
                  <span
                    className={`cursor-pointer ${
                      activeTab === "position"
                        ? "pb-3 border-b-2 border-custom-blue"
                        : "text-black"
                      }`}
                    onClick={() => handleTabClick("position")}
                  >
                    Position
                  </span>
                  <span
                    className={`cursor-pointer ${
                      activeTab === "candidate"
                        ? "pb-3 border-b-2 border-custom-blue"
                        : "text-black"
                      }`}
                    onClick={() => handleTabClick("candidate")}
                  >
                    Candidates
                  </span>
                  <span
                    className={`cursor-pointer ${activeTab === "Notification"
                        ? "pb-3 border-b-2 border-custom-blue"
                        : "text-black"
                      }`}
                    onClick={() => handleTabClick("Notification")}
                  >
                    Notifications
                  </span>
                </p>
              </div>

              <div>
                <select
                  className="w-52 p-2 text-custom-blue border border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
                  onChange={(e) => handleTabClick(e.target.value)}
                  value={activeTab}
                >
                  <option value="position">Position</option>
                  <option value="candidate">Candidate</option>
                </select>
              </div>

              {activeTab === "position" && (
                <>
                  <div className="flex float-end -mt-7">
                    <button
                      className="bg-custom-blue text-white px-3 py-1 rounded-md"
                      onClick={() => handleEditClick(position)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mt-7 grid grid-cols-2 sm:mt-5  border-gray-300">
                    {position ? (
                      <>
                        <div className="sm:col-span-3 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2 sm:mt-[1rem] ">
                          <div className=" rounded-lg p-4 border border-gray-300 mb-5">
                            <div className="font-bold text-lg mb-5">
                              Position Details:
                            </div>
                            <div className="flex mb-5">
                              <div className="w-1/4 sm:w-1/2">
                                <p className="font-medium">Title</p>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <p className="font-normal text-gray-500">
                                  {position.title}
                                </p>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">Owner</div>
                              </div>
                              <div>
                                <p className="font-normal text-gray-500">
                                  {userProfile
                                    ? userProfile.Name
                                    : "Loading..."}
                                </p>
                              </div>
                            </div>

                            <div className="flex mb-5">
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">Company Name</div>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <p className="font-normal text-gray-500">
                                  {position.companyname}
                                </p>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">Experience</div>
                              </div>
                              <p className="font-normal text-gray-500">
                                {position.minexperience} to{" "}
                                {position.maxexperience} years
                              </p>
                            </div>

                            <div className="flex mb-16">
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">
                                  Job Description
                                </div>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <p className="font-normal text-gray-500">
                                  {position.jobdescription}
                                </p>
                              </div>
                            </div>

                            <div className="flex mb-16">
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">
                                  {" "}
                                  Additional Notes
                                </div>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <p>
                                  <span className="font-normal text-gray-500">
                                    {position.additionalnotes}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="font-bold text-lg mb-5">
                              System Details:
                            </div>

                            <div className="flex mb-5">
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">Created By</div>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <p className="font-normal text-gray-500">
                                  {position.CreatedBy}
                                </p>
                              </div>
                              <div className="w-1/4 sm:w-1/2">
                                <div className="font-medium">Modified By</div>

                                <p className="font-normal text-gray-500">
                                  {position.modifiedBY}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-lg mb-5">
                            Skills Details:
                          </div>
                          {/* Skills */}
                          <div className="mb-5 rounded-lg border border-gray-300">
                            <div className="sm:mx-0">
                            <div className="grid grid-cols-3 p-4">
                              <div className="block font-medium leading-6 text-gray-900">
                                Skills
                              </div>
                              <div className="block font-medium leading-6 text-gray-900">
                                Experience
                              </div>
                              <div className="block font-medium leading-6 text-gray-900">
                                Expertise
                              </div>
                            </div>
                              <div className="font-medium text-xs text-gray-900 dark:text-gray-400 border-t px-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <tbody>
                                    {position.skills.map(
                                      (skillEntry, index) => (
                                        <tr
                                          key={index}
                                          className="grid grid-cols-3 gap-4"
                                        >
                                          <td className="py-5 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            {skillEntry.skill}
                                          </td>
                                          <td className="py-5 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            {skillEntry.experience}
                                          </td>
                                          <td className="py-5 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            {skillEntry.expertise}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="font-bold text-lg mb-5">
                            Rounds Details:
                          </div>

                          {/* Rounds */}
                          <div className="mb-5 rounded-lg border border-gray-300 ">
                            <div className="sm:mx-0">
                              <div className="grid grid-cols-4 p-4">
                              <div className="block font-medium leading-6 text-gray-900">
                                  Round Title
                                </div>
                                <div className="block font-medium leading-6 text-gray-900">
                                Interview Mode
                                </div>
                                <div className="block font-medium leading-6 text-gray-900">
                                Duration
                                </div>
                                <div className="block font-medium leading-6 text-gray-900">
                                Interviewer
                                </div>
                              </div>

                              <div className="font-medium text-xs text-gray-900 dark:text-gray-400 border-t px-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <tbody>
                                    {position.rounds.map(
                                      (roundEntry, index) => (
                                        <tr key={index}>
                                          <td className="py-5 text-left w-96 text-md font-medium text-gray-500 uppercase tracking-wider">
                                            {roundEntry.round}
                                          </td>
                                          <td className="py-5 text-left w-96 text-md font-medium text-gray-500 uppercase tracking-wider">
                                            {roundEntry.mode}
                                          </td>
                                          <td className="py-5 text-left w-96 text-md font-medium text-gray-500 uppercase tracking-wider">
                                            {roundEntry.duration}
                                          </td>
                                          <td className="py-5 text-left w-96 text-md font-medium text-gray-500 uppercase tracking-wider">
                                            {roundEntry.interviewer}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>No position data available.</p>
                    )}
                  </div>
                </>
              )}

              {activeTab === "candidate" && (
                <div>
                  <div
                    className="overflow-x-auto relative mt-6"
                    style={{ overflowX: "auto" }}
                  >
                    <table className="text-left w-full border-collapse border-gray-300">
                      <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
                        <tr style={{ fontSize: "13px" }}>
                          <th scope="col" className="py-3 px-6">
                            Candidate Name
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Email
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Phone
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Higher Qualification
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Current Experience
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Skill/Technology
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Action
                          </th>
                        </tr>
                      </thead>
                      {filteredCandidates.length > 0 ? (
                        <tbody>
                          {filteredCandidates.map((row, index) => (
                            <tr
                              key={index}
                              className="bg-white border-b cursor-pointer text-xs"
                            >
                              <td className="py-2 px-6 text-blue-400">
                                <div className="flex items-center gap-3">
                                  {row.imageUrl ? (
                                    <img
                                      src={row.imageUrl}
                                      alt="Candidate"
                                      className="w-7 h-7 rounded-full border border-gray-300"
                                    />
                                  ) : (
                                    <MdOutlineImageNotSupported
                                      className="w-7 h-7 text-gray-900"
                                      alt="Default"
                                    />
                                  )}
                                  {row.LastName}
                                </div>
                              </td>
                              <td className="py-2 px-6">{row.Email}</td>
                              <td className="py-2 px-6">{row.Phone}</td>
                              <td className="py-2 px-6">
                                {row.HigherQualification}
                              </td>
                              <td className="py-2 px-6">
                                {row.CurrentExperience}
                              </td>
                              <td className="py-2 px-6">
                                {row.skills.map((skillSet, index) => (
                                  <div key={index}>{skillSet.skill}</div>
                                ))}
                              </td>
                              <td className="py-2 px-6 relative">
                                <button>
                                  <FiMoreHorizontal className="text-3xl" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan="7" className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center p-5">
                                <p className="mt-5 text-9xl">
                                  <TbFoldersOff />
                                </p>
                                <p className="text-center text-xl font-normal">
                                  You don't have candidates yet. Create new
                                  candidate.
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "Notification" && (
                <Notification />
              )}
            </div>
          </div>
        )}

        {showNewCandidateContent && (
          <EditPositionForm
            onClose={handleclose}
            candidate1={showNewCandidateContent}
            rounds={showNewCandidateContent.rounds}
          />
        )}
      </div>
    </>
  );
};

export default PositionProfileDetails;
