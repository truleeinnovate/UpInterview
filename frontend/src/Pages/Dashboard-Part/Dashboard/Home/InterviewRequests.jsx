// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - fixed style issue

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  User,
  Video,
  Building,
  Inbox,
} from "lucide-react";
import axios from "axios";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { config } from "../../../../config";
// v1.0.0 <-----------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.0 ----------------------------------------------------------------------->

const InterviewRequests = () => {
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;

  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  //console.log("request",requests);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  //  v1.0.0 <----------------------------------------------------
  useScrollLock(!!selectedRequest);
  //  v1.0.0 ---------------------------------------------------->

  // Reusable function to fetch interview requests
  const fetchInterviewRequests = async (contactId) => {
    try {
      const requestRes = await axios.get(
        `${config.REACT_APP_API_URL}/interviewrequest/requests`,
        {
          params: { interviewerId: contactId },
        }
      );
      // console.log("Fetched interview requests:", requestRes.data);
      setRequests(requestRes.data);
      return requestRes.data;
    } catch (err) {
      console.error("Failed to fetch interview requests:", err);
      setError("Error fetching interview requests");
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Step 1: Fetch Contacts
        const contactRes = await axios.get(
          `${config.REACT_APP_API_URL}/contacts`
        );
        const allContacts = contactRes.data;
        // console.log("All contacts:", allContacts);

        // Step 2: Find the specific contact with matching ownerId
        const matchedContact = allContacts.find(
          (contact) => contact.ownerId?.toString() === ownerId
        );

        if (!matchedContact) {
          setError("No matching contact found.");
          setLoading(false);
          return;
        }

        setContacts(allContacts);
        setSelectedContact(matchedContact);

        // Step 3: Fetch Interview Requests using matched contact ID
        await fetchInterviewRequests(matchedContact._id);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ownerId]);

  // // Fetch interview requests
  // useEffect(() => {
  //   const fetchRequests = async () => {
  //     try {
  //       console.log("ownerId of interview requests :-", ownerId);
  //       const response = await axios.get(`${config.REACT_APP_API_URL}/interviewrequest/requests`, {
  //         params: { ownerId },
  //       });
  //       console.log("response of interview requests :-", response.data);
  //       setRequests(response.data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Failed to fetch interview requests');
  //       setLoading(false);
  //     }
  //   };
  //   fetchRequests();
  // }, []);

  // Handle Accept button click
  const handleAccept = async (requestId, contactId, roundId) => {
    try {
      // // First, verify the request is still available
      // const verifyResponse = await axios.get(
      //   `${config.REACT_APP_API_URL}/interviewrequest/requests?requestId=${requestId}`
      // );

      // const requestExists = verifyResponse.data.some(
      //   req => req._id === requestId && req.status === 'inprogress'
      // );

      // if (!requestExists) {
      //   // Refresh the requests list to show current status
      //   if (selectedContact?._id) {
      //     await fetchInterviewRequests(selectedContact._id);
      //   }
      //   alert('This interview request is no longer available. It may have been accepted by someone else or expired.');
      //   return;
      // }

      // If request is still available, proceed with acceptance
      await axios.post(`${config.REACT_APP_API_URL}/interviewrequest/accept`, {
        requestId,
        contactId,
        roundId,
      });

      // Refresh the requests list to get the latest data
      if (selectedContact?._id) {
        await fetchInterviewRequests(selectedContact._id);
      }

      console.log("Interview request accepted successfully!");
    } catch (err) {
      console.error("Failed to accept interview request", err);
      if (err.response?.status === 400) {
        // Refresh the requests list to show current status
        if (selectedContact?._id) {
          await fetchInterviewRequests(selectedContact._id);
        }
      }
    }
  };

  // Handle Details button click
  const handleDetails = (request) => {
    setSelectedRequest(request);
  };

  // Close the popup
  const closePopup = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        {/* v1.0.0 <----------------------------------------------------------------------------------------------------- */}
        <div>
          <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold">
            Interview Requests
          </h3>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            Recent interview requests from candidates
          </p>
        </div>
        {/* v1.0.0 -----------------------------------------------------------------------------------------------------> */}
        <button className="flex items-center space-x-2 text-sm bg-custom-blue text-white hover:text-white hover:bg-custom-blue/90 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
          {/* v1.0.0 <----------------------------------------------------------------- */}
          <span className="sm:hidden">View All Requests</span>
          <span className="md:hidden lg:hidden xl:hidden 2xl:hidden sm:text-sm">
            View All
          </span>
          {/* v1.0.0 -----------------------------------------------------------------> */}
          <ChevronRight size={16} />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg p-8 rounded-xl border border-gray-200 text-center">
          <Inbox size={48} className="text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold">No Requests Yet</h4>
          <p className="text-gray-500 text-sm mt-2">
            Looks good! You have no pending interview requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white/80 backdrop-blur-lg p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/5 rounded-lg">
                    <User size={18} className="text-custom-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {/* {request.contactId?.firstName + " " + request.contactId?.lastName} */}
                      {request?.roundDetails?.roundTitle}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {request.positionId?.title || "N/A"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    request.urgency === "High"
                      ? "bg-red-100 text-red-600"
                      : request.urgency === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Building size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">
                    {request.positionId?.companyname || "N/A"}
                  </span>
                </div>
                {/* <div className="flex items-center gap-1.5">
                  <Video size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">{request.type}</span>
                </div> */}
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Requested for {request.requestedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${request.status === 'scheduled' ? 'bg-blue-100 text-custom-blue' : 'bg-yellow-100 text-yellow-600'
                    }`}
                >
                  {request.status}
                </span> */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDetails(request)}
                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    Details
                  </button>
                  {/* <button
                    onClick={() => handleAccept(request.id, request.interviewerId, request.roundId)}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300"
                  >
                    Accept
                  </button> */}
                  {request.status === "accepted" ? (
                    <button
                      className="px-2.5 py-1 text-xs font-medium text-white bg-green-600/60 rounded-lg cursor-default"
                      disabled
                    >
                      Accepted
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleAccept(
                          request.id,
                          request.interviewerId,
                          request.roundId
                        )
                      }
                      className="px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 cursor-pointer"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* v1.0.1 <-------------------------------------------------------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-xl shadow-lg sm:w-full md:w-full mx-4 w-1/2 max-h-[90vh] overflow-y-auto">
          {/* v1.0.1 --------------------------------------------------------------------------------------------------------> */}
            <div className="flex justify-between items-center mb-4">
              {/* v1.0.0 <--------------------------------------------------------------------------------------------- */}
              <h3 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
                {/* v1.0.0 <--------------------------------------------------------------------------------------------- */}
                Interview Request Details
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5">
              {/* v1.0.0 <---------------------------------------------------------------------- */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-700 mb-2">
                  Candidate Information:-
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p className="sm:text-sm">
                    <strong>Candidate:</strong>{" "}
                    {selectedRequest.candidateId?.FirstName +
                      " " +
                      selectedRequest.candidateId?.LastName}
                  </p>
                  <p className="sm:text-sm">
                    <strong>Position:</strong>{" "}
                    {selectedRequest.positionId?.title || "N/A"}
                  </p>
                  <p className="sm:text-sm">
                    <strong>Company:</strong>{" "}
                    {selectedRequest.positionId?.companyname || "N/A"}
                  </p>
                </div>
              </div>
              {/* v1.0.0 ----------------------------------------------------------------------> */}
              {/* v1.0.0 <---------------------------------------------------------------------- */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-700 mb-2">
                  Interview Details:-
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p className="sm:text-sm">
                    <strong>Interview Type:</strong> {selectedRequest.type}
                  </p>
                  <p className="sm:text-sm">
                    <strong>Status: </strong>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedRequest.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </p>
                  <p className="sm:text-sm">
                    <strong>Requested Date:</strong>{" "}
                    {selectedRequest.requestedDate}
                  </p>
                  <p className="sm:text-sm">
                    <strong>Urgency: </strong>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedRequest.urgency === "High"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedRequest.urgency}
                    </span>
                  </p>
                </div>
              </div>
              {/* v1.0.0 ----------------------------------------------------------------------> */}

              {selectedRequest.roundDetails && (
                // v1.0.0 <---------------------------------------------------------------------
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-700 mb-2">
                    Round Information:-
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p className="sm:text-sm">
                      <strong>Round Title:</strong>{" "}
                      {selectedRequest.roundDetails.roundTitle}
                    </p>
                    <p className="sm:text-sm">
                      <strong>Duration:</strong>{" "}
                      {selectedRequest.roundDetails.duration}
                    </p>
                    <p className="sm:text-sm">
                      <strong>Date & Time:</strong>{" "}
                      {selectedRequest.roundDetails.dateTime}
                    </p>
                  </div>
                </div>
                // v1.0.0 --------------------------------------------------------------------->
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
              >
                Close
              </button>
              {selectedRequest.status === "accepted" ? (
                <button
                  className="px-2.5 py-1 text-xs font-medium text-white bg-green-600/60 rounded-lg cursor-default"
                  disabled
                >
                  Accepted
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleAccept(
                      selectedRequest.id,
                      selectedRequest.interviewerId,
                      selectedRequest.roundId
                    );
                    setSelectedRequest(null);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 cursor-pointer"
                >
                  Accept
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRequests;
