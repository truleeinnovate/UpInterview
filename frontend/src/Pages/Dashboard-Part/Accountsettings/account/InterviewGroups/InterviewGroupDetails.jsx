// v1.0.0 - Ashok - changed Minimize and Maximize icons for consistency and removed border left and set outline none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup
// v2.0.0 - Updated to Team Details with new schema (department, lead_id, member_ids, is_active, color)
// v2.1.0 - Improved layout, moved Edit button to header

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import { useTeamsQuery, useTeamById } from "../../../../../apiHooks/useInterviewerGroups.js";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { Users } from "lucide-react";

// Team color map with hex values
const TEAM_COLOR_MAP = {
  Teal: { bg: "bg-teal-100", icon: "text-teal-600", hex: "#14b8a6" },
  Blue: { bg: "bg-blue-100", icon: "text-blue-600", hex: "#3b82f6" },
  Purple: { bg: "bg-purple-100", icon: "text-purple-600", hex: "#8b5cf6" },
  Pink: { bg: "bg-pink-100", icon: "text-pink-600", hex: "#ec4899" },
  Orange: { bg: "bg-orange-100", icon: "text-orange-600", hex: "#f97316" },
  Green: { bg: "bg-green-100", icon: "text-green-600", hex: "#22c55e" },
  Red: { bg: "bg-red-100", icon: "text-red-600", hex: "#ef4444" },
  Yellow: { bg: "bg-yellow-100", icon: "text-yellow-600", hex: "#eab308" },
};

const TeamDetails = () => {
  const { data: teams = [], isLoading: teamsLoading } = useTeamsQuery();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: teamData } = useTeamById(id);

  const [selectedTeam, setSelectedTeam] = useState({});

  useEffect(() => {
    const fetchData = () => {
      try {
        // First check if we have data from useTeamById
        if (teamData?.data) {
          setSelectedTeam(teamData.data);
          return;
        }

        // Fallback to finding in the teams list
        const team = teams.find((team) => team._id === id);
        setSelectedTeam(team || {});
      } catch (error) {
        setSelectedTeam({});
      }
    };
    fetchData();
  }, [id, teams, teamData]);

  const colorConfig = TEAM_COLOR_MAP[selectedTeam.color] || TEAM_COLOR_MAP.Teal;
  const isActive = selectedTeam.is_active !== undefined
    ? selectedTeam.is_active
    : selectedTeam.status === "active";

  return (
    <SidebarPopup
      title="Team Details"
      onClose={() => navigate("/account-settings/my-teams")}
      id={id}
      showEdit={true}
      editPath="/account-settings/my-teams/team-edit"
    >
      <div className="sm:p-0 p-6">
        {/* Header Card with Team Icon */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${colorConfig.bg} flex items-center justify-center`}>
              <UserGroupIcon className={`w-7 h-7 ${colorConfig.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {selectedTeam.name
                  ? selectedTeam.name.charAt(0).toUpperCase() + selectedTeam.name.slice(1)
                  : "Unnamed Team"}
              </h2>
              <p className="text-gray-500 truncate">
                {selectedTeam.department || "No department assigned"}
              </p>
            </div>
            <StatusBadge status={isActive ? "Active" : "Inactive"} />
          </div>
        </div>

        {/* Team Information */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-gray-800">
              {selectedTeam.description
                ? selectedTeam.description.charAt(0).toUpperCase() + selectedTeam.description.slice(1)
                : "No description provided"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Department</p>
              <p className="font-medium text-gray-900">
                {selectedTeam.department || "Not assigned"}
              </p>
            </div>

            {/* Team Color */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Team Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: colorConfig.hex }}
                />
                <span className="font-medium text-gray-900">
                  {selectedTeam.color || "Teal"}
                </span>
              </div>
            </div>

            {/* Team Lead */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Team Lead</p>
              <p className="font-medium text-gray-900">
                {selectedTeam.leadName || "No lead assigned"}
              </p>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Team Members ({selectedTeam.numberOfUsers || 0})
              </h3>
            </div>

            {(selectedTeam.usersNames || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(selectedTeam.usersNames || []).map((member, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium"
                  >
                    {member || "Unknown"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No members in this team</p>
            )}
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
};

// Export with both names for compatibility
export default TeamDetails;
export { TeamDetails as InterviewGroupDetails };
