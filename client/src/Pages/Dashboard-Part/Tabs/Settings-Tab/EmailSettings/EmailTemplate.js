import { AiOutlineEye } from "react-icons/ai";
import { MdFilterAlt } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import { useState, useEffect, } from "react";

import axios from "axios";
import { nextPage, prevPage } from "../../../../../utils/SubscriptionValidations.js";
import CreateEmailTemplate from "./CreateEmailTemplate.js";
import EmailTemplateViewPage from "./EmailTemplateViewPage.js";

const EmailTemplate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [emailRecords, setEmailRecords] = useState([]);
  const [viewPage, setViewPage] = useState(false);
  const [viewPageData, setViewPageData] = useState([])


  const totalPages = 10

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const reponse = await axios.get(`${process.env.REACT_APP_API_URL}/get-templates`);
      const emailData = reponse.data.reverse();
      setEmailRecords(emailData);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }


  // console.log("record", emailRecords);

  const handleViewDetails = (email) => {
    setViewPage(true);
    setViewPageData(email);

  }
  return (
    <>
    <div className="fixed top-16 left-0 ml-64 right-0">
        <div>
          {
            viewPage ?
              <EmailTemplateViewPage show={viewPage} onClose={() => setViewPage(false)} record={viewPageData} /> :
              (
                <div>
                  <div className="flex justify-between items-center mb-4 px-4">
                    <h2 className="text-xl text-[#217989] font-semibold">Email Templates</h2>
                    <button
                      onClick={() => setShow(true)}
                      className="bg-[#217989] text-white px-4 py-2 rounded shadow "
                    >
                      New
                    </button>
                  </div>

                  <div className="flex justify-end items-center w-full mb-4 px-4">


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
                      <div className="h-7">
                        <button
                          className="h-full  px-1 border rounded shadow border-[#217989] bg-white"
                          onClick={() => setShowFilterCard(!showFilterCard)}
                        >
                          <MdFilterAlt className="text-2xl text-primary text-[#217989]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <table className=" w-full bg-white ">
                    <thead className="">
                      <tr className="border-t-2 border-b-2 text-left text-lg border-gray-50 text-[#217989] bg-slate-100">
                        <th className="p-4 font-semibold">Email Templates</th>
                        <th className="p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-left">
                      {emailRecords.map((email, index) => (
                        <tr key={index} className="border-t-2 border-b-2  border-gray-200">
                          <td className="p-4 ">{email.name}</td>
                          <td className="p-4 text-xl "
                            onClick={() => handleViewDetails(email)}

                          ><AiOutlineEye /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          }
        </div>
    </div>
    {show ? <CreateEmailTemplate show={show} onClose={setShow} refreshData={fetchData} /> : ""}
    </>
  )
}

export default EmailTemplate