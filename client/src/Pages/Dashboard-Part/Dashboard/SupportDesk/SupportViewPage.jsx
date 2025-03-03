import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import SupportForm from "./SupportForm";

const validReopenStatus = ["resolved", "cancel"];

const SupportViewPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState([]);
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const reopenStatus = validReopenStatus.includes(ticket?.status?.toLowerCase());

  const getTicket = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/get-ticket/${id}`;
      const response = await axios.get(url);
      setTicket(response.data.ticket);
    } catch (error) {
      alert(error && error.message);
    }
  };

  useEffect(() => {
    getTicket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div  className=" bg-white">
      <div className="p-4 pb-0 mb-0">
        <h2 className="text-lg text-gray-400">
          <span
            className="text-teal-600 font-bold cursor-pointer"
            onClick={() => navigate("/support")}
          >
            Support Desk
          </span>{" "}
          / {ticket && ticket._id?.slice(-5, -1)}
        </h2>
      </div>
      <ul className="flex justify-between items-center w-full p-5 text-base ">
        <li className="border-b-2 border-teal-700 cursor-pointer">Issue Details</li>
        <li>
          {reopenStatus ? (
            <>
              <button
                onClick={() => setOpenForm(true)}
                className="px-6 py-2 text-white rounded bg-teal-700 hover:bg-teal-800"
              >
                Reopen
              </button>
              {openForm && (
                <SupportForm
                  getTickets={getTicket}
                  ticketFromView={ticket}
                  reOpen={true}
                  setOpenForm={setOpenForm}
                />
              )}
            </>
          ) : (
            <button
              className="px-6 py-2 text-white rounded bg-gray-400 cursor-not-allowed"
              disabled
            >
              Reopen
            </button>
          )}
        </li>
      </ul>
      <div className="px-8 pb-4">
        <div className="p-4 border border-gray-400 rounded-lg flex flex-col gap-8">
          <h3 className="text-lg font-bold">Issue Details:</h3>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-start w-full">
              <p className="w-52 text-gray-700 font-medium">Ticket Id</p>
              <p className="text-gray-600">{ticket._id?.slice(-5, -1)}</p>
            </div>
            <div className="flex items-start w-full">
              <p className="w-52 text-gray-700 font-medium">Issue Type</p>
              <p className="text-gray-600">{ticket.issueType}</p>
            </div>
          </div>
          <div className="flex items-start w-full">
            <p className="w-52 text-gray-700 font-medium">Status</p>
            <p className="text-gray-600">{ticket.status}</p>
          </div>
          <div className="flex items-start w-full">
            <p className="w-52 text-gray-700 font-medium">Description</p>
            <p className="text-gray-600 ml-7 w-full">{ticket.description}</p>
          </div>
          <div className="flex items-start w-full">
            <p className="w-52 text-gray-700 font-medium">Resolution</p>
            <p className="text-gray-600 ml-7 w-full">{ticket.description}</p>
          </div>
          <div className="flex items-start w-full">
            <p className="w-52 text-gray-700 font-medium ">Choose File</p>
            <span className="text-gray-600">No file chosen</span>
          </div>
          <h3 className="text-lg font-bold">System Details:</h3>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-start w-full">
              <p className="w-52 text-gray-700 font-medium">Created By</p>
              <p className="text-gray-600">
                Shashank,{" "}
                {ticket.createdAt
                  ? format(parseISO(ticket.createdAt), "dd MMM yyyy. hh:mm a")
                  : "Invalid date"}
              </p>
            </div>
            <div className="flex items-start w-full">
              <p className="w-52 text-gray-700 font-medium">Modified By</p>
              <p className="text-gray-600">
                Shashank,{" "}
                {ticket.updatedAt
                  ? format(parseISO(ticket.updatedAt), "dd MMM yyyy. hh:mm a")
                  : "Invalid date"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportViewPage;

