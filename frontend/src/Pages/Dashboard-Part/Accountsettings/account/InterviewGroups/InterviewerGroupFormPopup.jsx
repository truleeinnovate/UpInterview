// v2.0.0 - Updated to My Teams with new schema (department, lead_id, member_ids, is_active, color)
// Uses common FormFields components

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { validateTeamForm } from "../../../../../utils/InterviewGroupValidations";
import useInterviewers from "../../../../../hooks/useInterviewers";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import {
  InputField,
  DescriptionField,
  DropdownWithSearchField,
} from "../../../../../Components/FormFields";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import {
  useCreateTeam,
  useTeamById,
  useTeamsQuery,
  useUpdateTeam,
} from "../../../../../apiHooks/useInterviewerGroups";
import { UserGroupIcon } from "@heroicons/react/24/outline";

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
          is_active: team.is_active !== undefined ? team.is_active : team.status === "active",
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
        .filter((interviewer) =>
          interviewer.type === "internal" || interviewer.roleLabel === "Admin"
        )
        .map((interviewer) => ({
          value: String(interviewer?.contact?._id || interviewer?._id),
          label: `${interviewer?.contact?.firstName || ""} ${interviewer?.contact?.lastName || ""}`.trim() || "Unknown",
          role: interviewer?.roleLabel || interviewer?.contact?.CurrentRole || "Team Member",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      navigate("/account-settings/my-teams");
    } catch (error) {
      console.error("Error saving team:", error);
      alert(`Failed to ${id ? "update" : "create"} team. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const title = id ? "Edit Team" : "Create Team";
  const subtitle = id ? "Update your interviewer team" : "Create a new interviewer team";

  return (
    <SidebarPopup
      title={title}
      onClose={() => navigate(`/account-settings/my-teams`)}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}

      <div className="sm:p-0 p-6 mb-10">
        <p className="text-gray-500 text-sm mb-6">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Information Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserGroupIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium">Team Information</h3>
            </div>

            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              {/* Team Name */}
              <InputField
                label="Team Name"
                type="text"
                name="name"
                id="name"
                placeholder="Frontend Team"
                value={formData.name}
                error={formErrors.name}
                onChange={handleInputChange}
                required
              />

              {/* Department */}
              <DropdownWithSearchField
                label="Department"
                name="department"
                options={DEPARTMENT_OPTIONS}
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Select Department"
              />

              {/* Team Lead */}
              <div>
                <DropdownWithSearchField
                  label="Team Lead"
                  name="lead_id"
                  options={leadOptions}
                  value={formData.lead_id}
                  onChange={handleInputChange}
                  placeholder="Select team lead"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Team lead will be automatically added as a team member.
                </p>
              </div>

              {/* Team Color */}
              <div>
                {/* Label and circles on same line */}
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Team Color
                  </label>
                  {(() => {
                    const selectedColor = TEAM_COLORS.find(c => c.value === formData.color) || TEAM_COLORS[0];
                    const otherColors = TEAM_COLORS.filter(c => c.value !== formData.color).slice(0, 2);
                    const displayColors = [selectedColor, ...otherColors];

                    return displayColors.map((colorOpt) => (
                      <button
                        key={colorOpt.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, color: colorOpt.value }))
                        }
                        className={`w-5 h-5 rounded-full border-2 transition-all ${formData.color === colorOpt.value
                          ? "border-gray-700 ring-2 ring-offset-1 ring-gray-400"
                          : "border-gray-200 hover:border-gray-400"
                          }`}
                        style={{ backgroundColor: colorOpt.hex }}
                        title={colorOpt.label}
                      />
                    ));
                  })()}
                </div>
                {/* Dropdown */}
                <DropdownWithSearchField
                  name="color"
                  options={TEAM_COLORS.map(c => ({ value: c.value, label: c.label }))}
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Select color"
                />
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-4">
              <DescriptionField
                label="Description"
                name="description"
                id="description"
                placeholder="Describe the team's focus and responsibilities..."
                value={formData.description}
                onChange={handleInputChange}
                error={formErrors.description}
                rows={3}
              />
            </div>

            {/* Active Team Toggle */}
            <div className="mt-4 flex items-center gap-3">
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
              <span className="text-sm font-medium text-gray-700">Active team</span>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <UserGroupIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium">Team Members</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select interviewers to add to this team. Team members can be assigned to interviews collectively.
            </p>

            {formErrors.members && (
              <p className="text-red-500 text-sm mb-3">{formErrors.members}</p>
            )}

            {/* Member cards grid */}
            <div className="max-h-80 overflow-y-auto">
              {memberOptions.length > 0 ? (
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-3">
                  {memberOptions.map((member) => {
                    const isChecked = formData.member_ids.includes(member.value);
                    const initial = (member.label?.charAt(0) || "?").toUpperCase();
                    const colors = ["bg-teal-600", "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-orange-600", "bg-green-600"];
                    const colorIndex = (member.label?.charCodeAt(0) || 0) % colors.length;
                    const avatarColor = colors[colorIndex];

                    return (
                      <label
                        key={member.value}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isChecked
                          ? "border-custom-blue bg-custom-blue/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setFormData((prev) => {
                              const currentIds = prev.member_ids || [];
                              const newIds = isChecked
                                ? currentIds.filter((id) => id !== member.value)
                                : [...currentIds, member.value];
                              return { ...prev, member_ids: newIds };
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 accent-custom-blue focus:ring-custom-blue"
                        />
                        <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{member.label}</div>
                          <div className="text-xs text-gray-500 truncate">{member.role}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                  No interviewers found
                </div>
              )}
            </div>

            {/* Show selected count */}
            <p className="text-sm text-gray-500 mt-2">
              {formData.member_ids?.length || 0} members selected
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/account-settings/my-teams`)}
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
