// v1.0.0 - Ashok - fixed ShareReportPopup.

// components/ShareReportPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Users, Shield, Check, Search } from "lucide-react";
import { useUsers } from "../../../../apiHooks/useUsers.js";
import { useRolesQuery } from "../../../../apiHooks/useRoles.js";
import {
  useShareReport,
  useReportAccess,
} from "../../../../apiHooks/useReportTemplates.js";
import { notify } from "../../../../services/toastService.js";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { useUserProfile } from "../../../../apiHooks/useUsers.js"
import { usePermissions } from "../../../../Context/PermissionsContext";

const ShareReportPopup = ({ templateId, isOpen, onClose }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialRoles, setInitialRoles] = useState([]);
  const [initialUsers, setInitialUsers] = useState([]);


  const { data: accessData, isLoading: accessLoading } =
    useReportAccess(templateId);
  const { userProfile } = useUserProfile();
  console.log("userProfile", userProfile);
  const { effectivePermissions_RoleName } = usePermissions();
  console.log("effectivePermissions_RoleName", effectivePermissions_RoleName);





  const shareMutation = useShareReport();

  const { usersRes } = useUsers({ limit: 1000 });
  const { data: allRoles } = useRolesQuery({ fetchAllRoles: true });
  console.log("allRoles ========================================> ", allRoles);

  console.log("USERS ========================================> ", usersRes);

  // Normalize roles — your API returns different structures
  // Normalize roles — your API returns different structures
  const organizationRoles = (allRoles || [])
    .filter((role) => role.roleType === "organization")
    .map((role) => ({
      _id: role._id,
      name: role.label || role.roleName || role.name || "Unnamed Role",
      label: role.label || role.roleName || role.name || "Unnamed Role",
      usersCount: role.usersCount || role.users?.length || 0,
    }))
    // ❌ Hide role matching effectivePermissions_RoleName
    .filter((role) => role.name !== effectivePermissions_RoleName);


  // Normalize users
  // Normalize users and hide logged-in user
  const usersList = (usersRes?.users || [])
    .filter((user) => user?._id !== userProfile?._id) // ❌ Hide current user
    .map((user) => {
      const roleObj = allRoles?.find((r) => r._id === user.roleId);

      return {
        _id: user?._id,
        name: user?.firstName + " " + user?.lastName,
        email: user?.email,
        // ✅ Show label from role table instead of name
        role: roleObj?.label || roleObj?.name || user?.roleName,
        status: user?.status,
      };
    });


  // Filter users by search
  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load current sharing
useEffect(() => {
  if (!accessData || !isOpen) return;

  const loadedRoleIds = (accessData.roles || [])
    .map(role => typeof role === "string" ? role : role._id?.toString())
    .filter(Boolean);

  const loadedUserIds = (accessData.users || [])
    .map(user => typeof user === "string" ? user : user._id?.toString())
    .filter(Boolean);

  setSelectedRoles(loadedRoleIds);
  setSelectedUsers(loadedUserIds);
  setInitialRoles(loadedRoleIds);
  setInitialUsers(loadedUserIds);
}, [accessData, isOpen]);

  const hasChanges =
    JSON.stringify(initialRoles.sort()) !== JSON.stringify(selectedRoles.sort()) ||
    JSON.stringify(initialUsers.sort()) !== JSON.stringify(selectedUsers.sort());

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    if (selectedRoles.length === 0 && selectedUsers.length === 0) {
      notify.error("Please select at least one role or user");
      return;
    }

    shareMutation.mutate(
      { templateId, roleIds: selectedRoles, userIds: selectedUsers },
      {
        onSuccess: () => {
          notify.success("Report shared successfully!");
          onClose();
        },
        onError: () => notify.error("Failed to share report"),
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 sticky top-0 bg-white z-10">
          <h2 className="sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
            Share Report
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {accessLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-custom-blue border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* ROLES */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Shield className="w-6 h-6 text-custom-blue" />
                  <h3 className="text-lg font-semibold">
                    Roles ({selectedRoles.length} selected)
                  </h3>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  {organizationRoles.map((role) => {
                    const isSelected = selectedRoles.includes(role._id);
                    return (
                      <button
                        key={role._id}
                        onClick={() => toggleRole(role._id)}
                        className={`
                          px-5 py-3 rounded-xl border-2 text-left transition-all duration-200
                          ${isSelected
                            ? "border-custom-blue bg-custom-blue/10 shadow-lg ring-2 ring-custom-blue/20"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {role.name}
                            </p>
                            {/* <p className="text-xs text-gray-500 mt-1">
                              {role.usersCount}{" "}
                              {role.usersCount === 1 ? "user" : "users"}
                            </p> */}
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-custom-blue mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              {/* USERS */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">
                    Users ({selectedUsers.length} selected)
                  </h3>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">
                      No users found
                    </p>
                  ) : (
                    <div className="p-4 space-y-3">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        console.log(
                          "USERS ========================================> ",
                          user
                        );

                        return (
                          <button
                            key={user._id}
                            onClick={() => toggleUser(user._id)}
                            className={`
                              w-full p-4 rounded-lg text-left transition-all duration-200 border-2
                              ${isSelected
                                ? "border-green-500 bg-green-50 shadow-sm"
                                : "border-transparent hover:bg-white hover:shadow"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {capitalizeFirstLetter(user?.name)}
                                    </p>
                                    <p className="text-sm text-custom-blue font-semibold">
                                      ({capitalizeFirstLetter(user?.role)})
                                    </p>

                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {user?.email}
                                  </p>
                                </div>

                                <StatusBadge
                                  status={capitalizeFirstLetter(user?.status)}
                                />
                              </div>
                              {isSelected && (
                                <Check className="w-6 h-6 text-green-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {(selectedRoles.length > 0 || selectedUsers.length > 0) && (
                <div className="bg-gradient-to-r from-custom-blue/10 to-green-500/10 p-6 rounded-xl border-2 border-custom-blue/30">
                  <p className="font-bold text-custom-blue mb-4 text-lg">
                    Report will be shared with:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedRoles.map((id) => {
                      const role = organizationRoles.find((r) => r._id === id);
                      return (
                        <span
                          key={id}
                          className="bg-custom-blue text-white px-4 py-2 rounded-full font-medium shadow"
                        >
                          Role: {role?.label || role?.name}

                        </span>
                      );
                    })}
                    {selectedUsers.map((id) => {
                      const user = usersList.find((u) => u._id === id);
                      return (
                        <span
                          key={id}
                          className="bg-green-600 text-white px-4 py-2 rounded-full font-medium shadow"
                        >
                          {user?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={
              shareMutation.isPending ||
              !hasChanges || // <-- disable unless changes made
              (selectedRoles.length === 0 && selectedUsers.length === 0)
            }
            className="px-6 py-2 bg-custom-blue text-white font-bold rounded-xl hover:bg-custom-blue/90 disabled:opacity-50 shadow-lg transition"
          >
            {shareMutation.isPending ? "Sharing..." : "Share Report"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ShareReportPopup;
