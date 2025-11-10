// v.0.0.1  changes made in interviwers getting data and creating groups and editing groups view group data
// v.0.0.2 - Venkatesh---  add error msg scroll
// v1.0.2 - Ashok - Removed border left and set outline as none and improved some styles
// v1.0.3 - Ashok - Improved responsiveness and added common code to popup and added loading view

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classNames from "classnames";
import Modal from "react-modal";
import Cookies from "js-cookie";
import { Maximize, Minimize, X } from "lucide-react";
import axios from "axios";
import { validateGroupForm } from "../../../../../utils/InterviewGroupValidations";
import useInterviewers from "../../../../../hooks/useInterviewers";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../../config";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError";
import {
  DescriptionField,
  DropdownWithSearchField,
  InputField,
} from "../../../../../Components/FormFields";
import DropdownSelect from "../../../../../Components/Dropdowns/DropdownSelect";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useCreateGroup, useGroupById, useGroupsQuery, useUpdateGroup } from "../../../../../apiHooks/useInterviewerGroups";

const InterviewerGroupFormPopup = () => {
  const { id } = useParams();
  const { interviewers } = useInterviewers();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    members: [],
  });

  // Get groups data and mutations from TanStack Query
  const { data: groups = [] } = useGroupsQuery();
  const { data: existingGroup } = useGroupById(id);
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();

  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  // v1.0.3 <-------------------------------------------
  const [loading, setLoading] = useState(false);
  // v1.0.3 ------------------------------------------->

  // console.log("tenantId InterviewerGroupFormPopup", tenantId);

  useEffect(() => {
    const fetchData = () => {
      try {
        console.log("InterviewerGroupFormPopup:", groups);
        console.log("InterviewerGroupFormPopup for ID:", id);
        const group = groups.find((group) => group._id === id);
        console.log("InterviewerGroupFormPopup group:", group);

        if (group) {
          // Map the API data to our form structure
          setFormData({
            name: group.name || "",
            description: group.description || "",
            status: group.status || "active",
            members: group.userIds || [], // Changed from userIds to members
          });
        }
      } catch (error) {
        console.error("Error setting form data:", error);
        setFormData({
          name: "",
          description: "",
          status: "active",
          members: [],
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, groups]);

  // interviewers
  // useEffect(() => {
  //   console.log("interviewers", interviewers?.data);

  //   if (interviewers?.data) {
  //     setUsers(interviewers?.data || []);
  //   } else {
  //     setUsers([])
  //   }

  // }, [tenantId, interviewers?.data])

  // <------------------- v.0.0.1 by Ranjith
  // getting only internal and admin only filtering data based for organization only
  useEffect(() => {
    const interviewersArray =
      interviewers?.data && Array.isArray(interviewers.data)
        ? interviewers.data
        : [];

    console.log("interviewersArray", interviewersArray);

    if (interviewersArray) {
      const filteredInterviewers = interviewersArray
        .filter((interviewer) => {
          // Only include internal interviewers who are NOT admins
          return (
            interviewer.type === "internal" || interviewer.roleLabel === "Admin"
          );
        })
        .map((interviewer) => ({
          ...interviewer,
        }));

      console.log("filteredInterviewers", filteredInterviewers);
      setUsers(filteredInterviewers || []);
    } else {
      setUsers([]);
    }
  }, [tenantId, interviewers?.data]);
  // ----------------------------------->

  //<-----v1.0.2------
  const fieldRefs = {
    name: useRef(null),
    description: useRef(null),
    status: useRef(null),
    members: useRef(null),
  };
  //-----v1.0.2------>

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateGroupForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors, fieldRefs); //<-----v1.0.2------
      return;
    }
    // v1.0.3 <-------------------------------------------
    setLoading(true);
    // v1.0.3 ------------------------------------------->

    try {
      // Different API calls for create vs update
      // if (id) {
      //   // Update existing group
      //   await axios.patch(`${config.REACT_APP_API_URL}/groups/update/${id}`, {
      //     name: formData.name,
      //     description: formData.description,
      //     status: formData.status,
      //     users: formData.members,
      //     tenantId: tenantId,
      //   });
      // } else {
      //   // Create new group
      //   await axios.post(`${config.REACT_APP_API_URL}/groups`, {
      //     name: formData.name,
      //     description: formData.description,
      //     status: formData.status,
      //     users: formData.members,
      //     tenantId: tenantId,
      //   });
      // }

        const groupPayload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        users: formData.members,
        tenantId: tenantId,
      };
      
      if (id) {
        // Update existing group
        await updateGroup.mutateAsync({
          groupId: id,
          groupData: groupPayload
        });
      } else {
        // Create new group
        await createGroup.mutateAsync(groupPayload);
      }


      navigate("/account-settings/interviewer-groups");
    } catch (error) {
      console.error("Error saving group:", error);
      alert(`Failed to ${id ? "update" : "create"} group. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members?.includes(memberId) // Added optional chaining
        ? prev.members.filter((id) => id !== memberId)
        : [...(prev.members || []), memberId], // Handle case where members is undefined
    }));
  };

  //     const handleSubmit = async (e) => {
  //       e.preventDefault();

  //       const errors = validateGroupForm(formData);
  //       setFormErrors(errors);

  //       if (Object.keys(errors).length > 0) {
  //         return;
  //       }

  //       // Basic validation
  //       if (!formData.name || !formData.members.length) {
  //         alert('Group name and at least one member are required.');
  //         return;
  //       }

  //       try {
  //         const response = await axios.post(`${config.REACT_APP_API_URL}/groups`, {
  //           name: formData.name,
  //           description: formData.description,
  //           status: formData.status,
  //           users: formData.members,       // members = array of selected user IDs
  //           tenantId: organizationId       // required by backend
  //         });

  //         // console.log('Group created:', response.data);
  //         // Optionally show a success message or redirect
  //         navigate('/account-settings/interviewer-groups');
  //       } catch (error) {
  //         console.error('Error creating group:', error);
  //         alert('Failed to create group. Please try again.');
  //       }
  //     };

  // const handleMemberToggle = (memberId) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     members: prev.members.includes(memberId)
  //       ? prev.members.filter(id => id !== memberId)
  //       : [...prev.members, memberId]
  //   }))
  // }

  const title = id ? "Edit Group" : "Create New Group";

  return (
    <SidebarPopup
      title={title}
      onClose={() => navigate(`/account-settings/interviewer-groups`)}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}
      <div className="sm:p-0 p-6 mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Group Information</h3>
            <div className="space-y-4">
              <div>
                <InputField
                  label="Group Name"
                  type="text"
                  name="GroupName"
                  id="GroupName"
                  placeholder="Enter Group Name"
                  ref={fieldRefs.name} //<-----v1.0.2------
                  value={formData.name}
                  error={formErrors.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <DescriptionField
                  label="Description"
                  name="Description"
                  id="Description"
                  placeholder="Write a description of the group"
                  ref={fieldRefs.description} //<-----v1.0.2------
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  error={formErrors.description}
                  rows={3}
                  required
                />
              </div>

              <div>
                <DropdownWithSearchField
                  label="Status"
                  name="Status"
                  id="Status"
                  required
                  value={formData.status}
                  ref={fieldRefs.status} //<-----v1.0.2------
                  placeholder="Select Status"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">
              Select Members <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-2">
              {formErrors.members && (
                <p className="text-red-500 text-sm mt-2">
                  {formErrors.members}
                </p>
              )}
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {/* v1.0.3 <-------------------------------------------------------------------- */}
                {/* <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y  divide-gray-200">
                      {users.length > 0 ? (
                        users.map((member, index) => (
                          <tr key={member._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={formData.members.includes(
                                  member?.contact?._id
                                )}
                                onChange={() =>
                                  handleMemberToggle(member?.contact?._id)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {member?.contact?.firstName ||
                                  member?.contact?.lastName
                                    ? `
                              ${
                                member?.contact?.firstName +
                                " " +
                                member?.contact?.lastName
                              }`
                                    : "Not Provided"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member?.contact?.email || "Not Provided"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member?.roleLabel || "Not Provided"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <p className="flex w-full justify-center items-center mx-auto p-4">
                          No Interviwers Found
                        </p>
                      )}
                    </tbody>
                  </table> */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((member) => (
                        <tr key={member._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={formData.members.includes(
                                member?.contact?._id
                              )}
                              onChange={() =>
                                handleMemberToggle(member?.contact?._id)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                {member?.contact?.firstName ||
                                member?.contact?.lastName
                                  ? `${member?.contact?.firstName || ""} ${
                                      member?.contact?.lastName || ""
                                    }`
                                  : "Not Provided"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member?.contact?.email || "Not Provided"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member?.roleLabel || "Not Provided"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No Interviewers Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* v1.0.3 --------------------------------------------------------------------> */}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/account-settings/interviewer-groups`)}
              className="text-sm font-semibold px-4 py-2 text-gray-700 hover:bg-blue-50 border border-custom-blue rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm font-semibold px-4 py-2 bg-custom-blue text-white rounded-lg"
            >
              {id ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </SidebarPopup>
  );
};

export default InterviewerGroupFormPopup;
