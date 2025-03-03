import { AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import { MdFilterAlt, MdOutlineViewKanban } from "react-icons/md";
import { BiSearch } from "react-icons/bi";

import { IoIosList } from "react-icons/io";
import { useState, useEffect, useCallback } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tooltip } from 'react-tooltip';
import { nextPage, prevPage } from "../../../../../utils/SubscriptionValidations";
export const formatDate = (date) => {
  if (!date) return "N/A";
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString("en-US", { month: "short" });
  const year = formattedDate.getFullYear();
  const hours = formattedDate.getHours();
  const minutes = formattedDate.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? "PM" : "AM";

  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${period}`;
};
const SubscriptionTable = () => {
  const [subscritionPlanData, setSubscritionPlanData] = useState([]);
  const [filteredSubscritions, setFilteredSubscritions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [showFilterCard, setShowFilterCard] = useState(false);






  const navigate = useNavigate();

  const applyFilters = useCallback(() => {
    if (!subscritionPlanData || !Array.isArray(subscritionPlanData)) return;

    const filtered = subscritionPlanData.filter((plan) => {
      const matchesSearch = searchTerm
        ? plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.CreatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return matchesSearch;
    });

    setFilteredSubscritions(filtered);
  }, [searchTerm, subscritionPlanData]);




  useEffect(() => {
    applyFilters();
  }, [searchTerm, subscritionPlanData, applyFilters]);

  useEffect(() => {
    handlesubscritionPlanData();
  }, []);


  const handlesubscritionPlanData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/all-subscription-plans`);
      const rev_data = response.data?.reverse?.() || [];

      setSubscritionPlanData(rev_data);
      setFilteredSubscritions(rev_data);

    } catch (error) {
      console.error("Error fetching candidates:", error);
      alert("Failed to fetch candidates. Please try again later.");

      setSubscritionPlanData([]);
      setFilteredSubscritions([]);
    }
  };




  const recordsPerPage = 10;
  const totalPages = Math.ceil(filteredSubscritions.length / recordsPerPage);
  const currentRecords = filteredSubscritions.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );





  const handleViewDetails = (eachPlan) => {
    navigate(`/subscription-view/${eachPlan._id}`, { state: { eachPlan } });
  }

  const handleEdit = (candidate) => {

  };

  // const handleCloseEdit = () => {
  //   setEditMode(false);
  //   setCandidateToEdit(null);
  //   handlesubscritionPlanData();
  // };

  return (
    <>
      <div className="p-6 bg-white">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Subscription Plan</h2>
          <button
            onClick={() => navigate('/create-plan')}
            className="bg-[#217989] text-white px-4 py-2 rounded shadow "
          >
            Create
          </button>
        </div>

        <div className="flex justify-between items-center w-full mb-4 ms-4">
          <div className="flex text-2xl items-center gap-2">
            <button
              onClick={() => setViewMode("card")}

            >
              <MdOutlineViewKanban
                id="kanban-view"
                className={`cursor-pointer focus:outline-none ${viewMode === "table" ? "text-black" : "text-blue-500"}`}
              />
            </button>

            <Tooltip
              anchorId="kanban-view"
              content="Kanban View"
              place="top"
              className=" !text-xs !bg-black !text-[#C7EBF2]"
            />

            <button
              onClick={() => setViewMode("table")}

            >
              <IoIosList
                id="list-view"
                className={`cursor-pointer focus:outline-none ${viewMode !== "table" ? "text-black" : "text-blue-500"}`}
              />
            </button>
            <Tooltip
              anchorId="list-view"
              content="List View"
              place="top"
              className="!text-xs !bg-black !text-[#C7EBF2]"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center w-52 gap-4 h-8">
              <div className="flex items-center border border-black rounded-lg w-full h-full bg-white">
                <BiSearch className="text-[#217989] text-lg mx-3" />
                <input
                  type="text"
                  className="flex-1  text-xs placeholder-gray-500 focus:outline-none bg-transparent"
                  placeholder="Search Candidate"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>




            <div className="flex items-center h-8 ">

              <span className=" pe-1 text-md">
                {currentPage}-{totalPages}/{totalPages}
              </span>

              <button
                onClick={() => prevPage(currentPage, setCurrentPage)}
                disabled={currentPage === 1}
                className="px-2  text-lg me-1  bg-gray-300 text-gray-500 rounded "
              >
                &lt;
              </button>

              <button
                onClick={() => nextPage(currentPage, totalPages, setCurrentPage)}
                disabled={currentPage === totalPages}
                className="px-2 text-lg  bg-gray-300 text-gray-500 rounded"
              >
                &gt;
              </button>
            </div>
            <div
              className="h-7"
            // onMouseEnter={() => setShowFilterCard(true)}
            // onMouseLeave={() => setShowFilterCard(false)}

            >

              <button
                className="h-full  px-1 border rounded shadow border-[#217989] bg-white"
                onClick={() => setShowFilterCard(!showFilterCard)}
              >
                <MdFilterAlt className="text-2xl text-primary text-[#217989]" />
              </button>

            </div>


          </div>
        </div>
        <div className="h-screen flex overflow-hidden bg-white">


          <div
            className={`transition-all duration-300 ease-in-out ${showFilterCard ? "w-4/5" : "w-full"
              } overflow-auto `}
          >
            {viewMode === "table" ? (
              <table className=" w-full bg-white ">
                <thead className="">
                  <tr className="border-t-2 border-b-2 text-left text-lg border-gray-50 text-[#217989] bg-slate-100">
                    <th className="p-4 font-semibold">Plan ID</th>
                    <th className="p-4 font-semibold">Plan Name</th>
                    <th className="p-4 font-semibold">Entity Type</th>
                    <th className="p-4 font-semibold">Created By</th>
                    <th className="p-4 font-semibold">Modified By</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-left">
                  {currentRecords.map((eachPlan) => (
                    <tr key={eachPlan._id}
                      className="border-t-2 border-b-2 text-lg  border-gray-200 "
                    >
                      <td className="flex items-center p-4"
                        onClick={() => handleViewDetails(eachPlan)}
                      >


                        <span className=" text-[#217989] font-[500] ">{eachPlan?.planId || "N/A"}</span>
                      </td>
                      <td className="p-4">{eachPlan?.name || "N/A"}</td>
                      <td className="p-4">{eachPlan?.subscriptionType || "N/A"}</td>
                      <td className="p-4">{(eachPlan?.CreatedBy || "N/A") + ", " + formatDate(eachPlan?.createdAt) || "N/A"}</td>

                      <td className="p-4">{(eachPlan.modifiedBy || "N/A") + ", " + formatDate(eachPlan?.updatedAt) || "N/A"} </td>

                      <td className="p-2 text-center">
                        <div className="flex ps-2 pt-2 pb-2 justify-start ">
                          <button

                            onClick={() => handleViewDetails(eachPlan)}
                            className="text-black transition duration-200 hover:text-[#217989]"
                          >
                            <AiOutlineEye />
                          </button>
                          {/* <button
                      className="text-black transition duration-200 hover:text-[#217989] ps-6"
                      onClick={() => handleEdit(eachPlan)}
                    >
                      <AiOutlineEdit />
                    </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>) : (""

            )}
          </div>


          {/* {showFilterCard && (
            <div className=" h-full w-1/5 mr-5     ">
              <CandidateFilterView
                onApplyFilters={setFilters}
                onClose={() => setShowFilterCard(false)}
              />
            </div>
          )} */}

          {/* <CreateSubscription show={showForm} onClose={() => setShowForm(false)} /> */}

          {/* {editMode && (
          <EditCandidateFrom candidateData={candidateToEdit} show={editMode} onClose={() => setEditMode(false)} />
        )} */}

        </div>
      </div>
    </>
  );
};

export default SubscriptionTable;