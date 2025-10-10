// v1.0.0 - Ashok - changed Minimize and Maximize icons for consistency and removed border left and set outline none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup

import React, { useEffect, useState } from "react";
import { useCustomContext } from "../../../../../Context/Contextfetch";

import { useNavigate, useParams } from "react-router-dom";
// v1.0.1 <--------------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
// v1.0.1 <--------------------------------------------------------------

const InterviewGroupDetails = () => {
  const { groups } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();
  // console.log("id",id);

  // console.log("InterviewGroupDetails", id,groups.find(group => group._id === id));

  const [selectedGroup, setSelectedGroup] = useState({});

  useEffect(() => {
    const fetchData = () => {
      try {
        // console.log('Groups:', groups);
        // console.log('Looking for ID:', id);
        const group = groups.find((group) => group._id === id);
        console.log("Found group:", group);
        setSelectedGroup(group || {});
        // setIsLoading(false);
        // const group = groups.find(group => group._id === id);

        // console.log("group", group);
        // setSelectedGroup(group || null);
      } catch (error) {
        setSelectedGroup({});
      }
    };
    fetchData();
  }, [id, groups]);

  return (
    // v1.0.1 <-----------------------------------------------------------------------
    <SidebarPopup
      title="Group Information"
      onClose={() => navigate("/account-settings/interviewer-groups")}
    >
      <div className="sm:p-0 p-6">
        <div className="space-y-6 border rounded-md  p-4">
          <div>
            <div className="space-y-4">
              <div>
                <p className="text-base text-gray-500">Name</p>
                <p className="font-medium">
                  {selectedGroup.name
                    ? selectedGroup.name.charAt(0).toUpperCase() +
                      selectedGroup.name.slice(1)
                    : "Not Provided"}
                </p>
              </div>
              <div className="break-words">
                <p className="text-base text-gray-500">Description</p>
                <p className="font-medium">
                  {selectedGroup.description
                    ? selectedGroup.description.charAt(0).toUpperCase() +
                      selectedGroup.description.slice(1)
                    : "Not Provided"}
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500 mb-1">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedGroup.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedGroup.status
                    ? selectedGroup.status.charAt(0).toUpperCase() +
                      selectedGroup.status.slice(1)
                    : "Not Provided"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-gray-500 font-base mb-2">
              {selectedGroup.numberOfUsers > 1 ? "Members" : "Member"} (
              {selectedGroup.numberOfUsers || 0})
            </h3>
            <div className="space-x-4 flex">
              {(selectedGroup.usersNames || []).map((member, idx) => (
                <div key={idx} className="flex flex-wrap gap-4">
                  {/* <div> */}
                  <span className="font-medium bg-custom-blue/10 text-custom-blue rounded-full text-sm pt-2 pl-3 pr-3 pb-2">
                    {member || "Not Provided"}
                  </span>
                  {/* <p className="text-sm text-gray-500">{member.role}</p> */}
                  {/* </div> */}
                  {/* <div className="flex items-center space-x-2"> */}
                  {/* <span className="text-sm text-gray-500">
                        Rating: {member.rating || "N/A"}
                      </span> */}
                  {/* <span className={`px-2 py-1 text-xs rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status || "N/A"}
                      </span> */}
                  {/* </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
    // v1.0.1 ----------------------------------------------------------------------->
  );
};

export default InterviewGroupDetails;
