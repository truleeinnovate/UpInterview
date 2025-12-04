// v1.0.0 - Ashok - fixed ShareReportPopup.

// components/ShareReportPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Users, Shield, Check, Search } from "lucide-react";
import { useUsers } from "../../../../apiHooks/useUsers.js";
import { useRolesQuery } from "../../../../apiHooks/useRoles.js";
import { useShareReport } from "../../../../apiHooks/useReportTemplates.js";
import { useAllReportAccess } from "../../../../apiHooks/useReportTemplates.js"; // ← NEW: Tenant-wide access
import { notify } from "../../../../services/toastService.js";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { useUserProfile } from "../../../../apiHooks/useUsers.js";
import { usePermissions } from "../../../../Context/PermissionsContext";

const ShareReportPopup = ({ templateId, isOpen, onClose }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Global hooks
  const { userProfile } = useUserProfile();
  const { effectivePermissions_RoleName } = usePermissions();
  const { usersRes } = useUsers({ limit: 1000 });
  const { data: allRoles } = useRolesQuery({ fetchAllRoles: true });

  // ONE API CALL: Get access for ALL reports in tenant
  const { data: accessMap = {}, isLoading: accessLoading } = useAllReportAccess();

  // Current access for this specific template
  const currentAccess = accessMap[templateId] || { roles: [], users: [] };

  const shareMutation = useShareReport();

  // Load current sharing when popup opens
  useEffect(() => {
    if (!isOpen || accessLoading) return;

    const roleIds = currentAccess.roles?.map(r => r._id?.toString() || r) || [];
    const userIds = currentAccess.users?.map(u => u._id?.toString() || u) || [];

    setSelectedRoles(roleIds);
    setSelectedUsers(userIds);
  }, [currentAccess, isOpen, accessLoading]);

  // Normalize roles (hide current user's role + organization only)
  const organizationRoles = (allRoles || [])
    .filter((role) => role.roleType === "organization")
    .map((role) => ({
      _id: role._id,
      name: role.label || role.roleName || role.name || "Unnamed Role",
      label: role.label || role.roleName || role.name || "Unnamed Role",
      usersCount: role.usersCount || role.users?.length || 0,
    }))
    .filter((role) => role.name !== effectivePermissions_RoleName); // Hide own role

  // Normalize users (exclude current user)
  const usersList = (usersRes?.users || [])
    .filter((user) => user?._id !== userProfile?._id)
    .map((user) => {
      const roleObj = allRoles?.find((r) => r._id === user.roleId);
      return {
        _id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: roleObj?.label || roleObj?.name || user?.roleName || "No Role",
        status: user.status,
      };
    });

  // Search filter
  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle handlers
  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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

  // Detect changes
  const hasChanges =
    JSON.stringify(currentAccess.roles?.map(r => r._id).sort() || []) !==
      JSON.stringify(selectedRoles.sort()) ||
    JSON.stringify(currentAccess.users?.map(u => u._id).sort() || []) !==
      JSON.stringify(selectedUsers.sort());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white border-b">
          <h2 className="text-2xl font-bold text-custom-blue">Share Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizationRoles.map((role) => {
                    const isSelected = selectedRoles.includes(role._id);
                    return (
                      <button
                        key={role._id}
                        onClick={() => toggleRole(role._id)}
                        className={`
                          px-5 py-3 rounded-xl border-2 text-left transition-all
                          ${isSelected
                            ? "border-custom-blue bg-custom-blue/10 shadow-lg ring-2 ring-custom-blue/20"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-gray-900">{role.name}</p>
                          {isSelected && <Check className="w-5 h-5 text-custom-blue" />}
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

                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-blue"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">No users found</p>
                  ) : (
                    <div className="p-4 space-y-3">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        return (
                          <button
                            key={user._id}
                            onClick={() => toggleUser(user._id)}
                            className={`
                              w-full p-4 rounded-lg text-left transition-all border-2
                              ${isSelected
                                ? "border-green-500 bg-green-50 shadow-sm"
                                : "border-transparent hover:bg-white hover:shadow"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <p className="font-medium text-gray-900">
                                    {capitalizeFirstLetter(user.name)}
                                  </p>
                                  <span className="text-sm font-semibold text-custom-blue">
                                    ({capitalizeFirstLetter(user.role)})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={capitalizeFirstLetter(user.status)} />
                                {isSelected && <Check className="w-6 h-6 text-green-600" />}
                              </div>
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
                        <span key={id} className="bg-custom-blue text-white px-4 py-2 rounded-full font-medium">
                          Role: {role?.name}
                        </span>
                      );
                    })}
                    {selectedUsers.map((id) => {
                      const user = usersList.find((u) => u._id === id);
                      return (
                        <span key={id} className="bg-green-600 text-white px-4 py-2 rounded-full font-medium">
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
        <div className="flex justify-end gap-4 px-6 py-4 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={
              shareMutation.isPending ||
              !hasChanges ||
              (selectedRoles.length === 0 && selectedUsers.length === 0)
            }
            className="px-8 py-2.5 bg-custom-blue text-white font-bold rounded-xl hover:bg-custom-blue/90 disabled:opacity-50 shadow-lg transition"
          >
            {shareMutation.isPending ? "Sharing..." : "Share Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareReportPopup;
