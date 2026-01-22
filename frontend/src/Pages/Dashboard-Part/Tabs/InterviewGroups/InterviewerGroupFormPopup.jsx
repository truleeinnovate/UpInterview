// v2.0.0 - Updated to My Teams with new schema (department, lead_id, member_ids, is_active, color)
// Uses common FormFields components

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { validateTeamForm } from "../../../../utils/InterviewGroupValidations";
import useInterviewers from "../../../../hooks/useInterviewers";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import {
  InputField,
  DescriptionField,
  DropdownWithSearchField,
} from "../../../../Components/FormFields";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import {
  useCreateTeam,
  useTeamById,
  useTeamsQuery,
  useUpdateTeam,
} from "../../../../apiHooks/useInterviewerGroups";
import {
  UserGroupIcon,
  UsersIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ToggleSwitch from "../../../../Components/Buttons/ToggleButton";

// Team color options with hex values
const TEAM_COLORS = [
  { value: "Teal", label: "Teal", hex: "#14b8a6" },
  { value: "Blue", label: "Blue", hex: "#3b82f6" },
  { value: "Purple", label: "Purple", hex: "#8b5cf6" },
  { value: "Pink", label: "Pink", hex: "#ec4899" },
  { value: "Orange", label: "Orange", hex: "#f97316" },
  { value: "Green", label: "Green", hex: "#22c55e" },
  { value: "Red", label: "Red", hex: "#ef4444" },
  { value: "Yellow", label: "Yellow", hex: "#eab308" },
];

// Department options
const DEPARTMENT_OPTIONS = [
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "Support", label: "Support" },
  { value: "Other", label: "Other" },
];

const TeamFormPopup = () => {
  const { id } = useParams();
  const { interviewers } = useInterviewers();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    lead_id: "",
    member_ids: [],
    is_active: true,
    color: "Teal",
  });

  const { data: teams = [] } = useTeamsQuery();
  const { data: existingTeam } = useTeamById(id);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [memberOptions, setMemberOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  const [loading, setLoading] = useState(false);

  // Load existing team data for editing
  useEffect(() => {
    if (id && (existingTeam?.data || teams.length > 0)) {
      const team = existingTeam?.data || teams.find((t) => t._id === id);
      if (team) {
        setFormData({
          name: team.name || "",
          description: team.description || "",
          department: team.department || "",
          lead_id: team.lead_id || "",
          member_ids: (team.member_ids || team.userIds || []).map(String),
          is_active:
            team.is_active !== undefined
              ? team.is_active
              : team.status === "active",
          color: team.color || "Teal",
        });
      }
    }
  }, [id, teams, existingTeam]);

  // Build member options from interviewers
  useEffect(() => {
    const interviewersArray = Array.isArray(interviewers) ? interviewers : [];

    if (interviewersArray.length > 0) {
      const options = interviewersArray
        .filter(
          (interviewer) =>
            interviewer.type === "internal" ||
            interviewer.roleLabel === "Admin",
        )
        .map((interviewer) => ({
          value: String(interviewer?.contact?._id || interviewer?._id),
          label:
            `${interviewer?.contact?.firstName || ""} ${interviewer?.contact?.lastName || ""}`.trim() ||
            "Unknown",
          role:
            interviewer?.roleLabel ||
            interviewer?.contact?.CurrentRole ||
            "Team Member",
        }))
        .filter((opt) => opt.value);

      setMemberOptions(options);
    } else {
      setMemberOptions([]);
    }
  }, [interviewers]);

  // Lead options (same as members)
  const leadOptions = memberOptions;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "lead_id") {
      setFormData((prev) => {
        const oldLeadId = prev.lead_id;
        let newMemberIds = [...(prev.member_ids || [])];

        // Remove old lead from members
        if (oldLeadId) {
          newMemberIds = newMemberIds.filter((id) => id !== oldLeadId);
        }

        // Add new lead to members
        if (value && !newMemberIds.includes(value)) {
          newMemberIds.push(value);
        }

        return {
          ...prev,
          lead_id: value,
          member_ids: newMemberIds,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateTeamForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const teamPayload = {
        name: formData.name,
        description: formData.description,
        department: formData.department,
        lead_id: formData.lead_id || null,
        member_ids: formData.member_ids,
        is_active: formData.is_active,
        color: formData.color,
        tenantId: tenantId,
      };

      if (id) {
        await updateTeam.mutateAsync({
          teamId: id,
          teamData: teamPayload,
        });
      } else {
        await createTeam.mutateAsync(teamPayload);
      }

      navigate("/my-teams");
    } catch (error) {
      console.error("Error saving team:", error);
      alert(`Failed to ${id ? "update" : "create"} team. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const title = id ? "Edit Team" : "Create Team";
  const selectedColorHex =
    TEAM_COLORS.find((c) => c.value === formData.color)?.hex || "#14b8a6";

  return (
    <SidebarPopup title={title} onClose={() => navigate(`/my-teams`)}>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}

      <div className="sm:p-0 p-4 mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name & Color Row */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
            <InputField
              label="Team Name"
              type="text"
              name="name"
              id="name"
              placeholder="e.g. Frontend Engineers"
              value={formData.name}
              error={formErrors.name}
              onChange={handleInputChange}
              required
            />

            {/* Team Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Color
              </label>
              <div className="flex items-center gap-2 px-3 py-[9px] border border-gray-300 rounded-lg bg-white">
                {TEAM_COLORS.map((colorOpt) => (
                  <button
                    key={colorOpt.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        color: colorOpt.value,
                      }))
                    }
                    className={`w-6 h-6 rounded-full transition-all flex-shrink-0 ${formData.color === colorOpt.value
                      ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                      : "hover:scale-105"
                      }`}
                    style={{ backgroundColor: colorOpt.hex }}
                    title={colorOpt.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Department & Team Lead Row */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
            <DropdownWithSearchField
              label="Department"
              name="department"
              options={DEPARTMENT_OPTIONS}
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Select department"
            />

            <div>
              <DropdownWithSearchField
                label="Team Lead"
                name="lead_id"
                options={leadOptions}
                value={formData.lead_id}
                onChange={handleInputChange}
                placeholder="Select team lead"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-added as team member
              </p>
            </div>
          </div>

          {/* Description */}
          <DescriptionField
            label="Description"
            name="description"
            id="description"
            placeholder="Describe the team's focus, responsibilities, and expertise areas..."
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: !prev.is_active,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? "bg-custom-blue" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ToggleSwitch
              label="Status"
              value={formData.is_active}
              activeText="Active"
              inactiveText="Inactive"
              color="custom-blue"
              onChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: checked,
                }))
              }
            />
          </div>

          {/* Team Members Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Team Members
                </h3>
              </div>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-custom-blue/10 text-custom-blue">
                {formData.member_ids?.length || 0} selected
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select team members who can be assigned to interviews together
            </p>

            {formErrors.members && (
              <p className="text-red-500 text-sm mb-3">{formErrors.members}</p>
            )}

            {/* Member Grid */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
              {memberOptions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                  {memberOptions.map((member) => {
                    const isChecked = formData.member_ids.includes(
                      member.value,
                    );
                    const initial = (
                      member.label?.charAt(0) || "?"
                    ).toUpperCase();
                    const colors = [
                      "bg-teal-500",
                      "bg-blue-500",
                      "bg-purple-500",
                      "bg-pink-500",
                      "bg-orange-500",
                      "bg-green-500",
                    ];
                    const colorIndex =
                      (member.label?.charCodeAt(0) || 0) % colors.length;
                    const avatarColor = colors[colorIndex];

                    return (
                      <label
                        key={member.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isChecked
                          ? "bg-white border-2 border-custom-blue shadow-sm"
                          : "bg-white border border-transparent hover:border-gray-200"
                          }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}
                          >
                            {initial}
                          </div>
                          {isChecked && (
                            <CheckCircleIcon className="absolute -bottom-1 -right-1 w-4 h-4 text-custom-blue bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {member.label}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {member.role}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setFormData((prev) => {
                              const currentIds = prev.member_ids || [];
                              const newIds = isChecked
                                ? currentIds.filter(
                                  (memberId) => memberId !== member.value,
                                )
                                : [...currentIds, member.value];
                              return { ...prev, member_ids: newIds };
                            });
                          }}
                          className="hidden"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No team members available</p>
                  <p className="text-xs mt-1">
                    Add interviewers first to build your team
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-semibold px-6 py-2.5 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-sm font-semibold px-6 py-2.5 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {id ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </SidebarPopup>
  );
};

export default TeamFormPopup;
export { TeamFormPopup as InterviewerGroupFormPopup };
