import React, { useState, useEffect } from "react";
// import { MdOutlineCancel } from "react-icons/md";
import axios from 'axios';

const Sharing_settings_popup = ({ onClose, profile }) => {
  const [editMode, setEditMode] = useState(null);
  const [profiles, setProfiles] = useState(profile ? [profile] : []);

  useEffect(() => {
    if (profile) {
      setProfiles([profile]);
    }
  }, [profile]);

  const handleCheckboxChange = (profileIndex, accessIndex) => {
    const updatedProfiles = [...profiles];
    if (updatedProfiles[profileIndex] && updatedProfiles[profileIndex].accessBody[accessIndex]) {
      const currentValue = updatedProfiles[profileIndex].accessBody[accessIndex].GrantAccess;
      updatedProfiles[profileIndex].accessBody[accessIndex].GrantAccess = !currentValue;
      setProfiles(updatedProfiles);
    }
  };

  const handleSelectChange = (profileIndex, accessIndex, event) => {
    const updatedProfiles = [...profiles];
    if (updatedProfiles[profileIndex] && updatedProfiles[profileIndex].accessBody[accessIndex]) {
      updatedProfiles[profileIndex].accessBody[accessIndex].Access = event.target.value;
      setProfiles(updatedProfiles);
    }
  };

  const handleEditClick = async (profileIndex) => {
    if (editMode === profileIndex) {
      // Save changes
      const updatedProfile = profiles[profileIndex];
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/sharing-settings/${updatedProfile._id}`, updatedProfile);
        console.log('Saved successfully:', response.data);
        setEditMode(null);
      } catch (error) {
        console.error('Error saving sharing settings:', error);
      }
    } else {
      setEditMode(profileIndex);
    }
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg" style={{ width: "97%", height: "97%" }}>
        <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <p className="text-2xl font-semibold text-orange-500">Sharing Settings</p>
          <button className="shadow-lg rounded-full p-2 bg-gray-200 hover:bg-gray-300" onClick={onClose}>
            {/* <MdOutlineCancel className="text-2xl" /> */}
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 71px)" }}>
          {profiles.map((profile, profileIndex) => (
            <div key={profileIndex} className="mb-4">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <strong>Name:</strong> {profile.Name}
                </div>
                <button
                  onClick={() => handleEditClick(profileIndex)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editMode === profileIndex ? 'Save' : 'Edit'}
                </button>
              </div>
              <div className="mb-4">
                <strong>Organization ID:</strong> {profile.organizationId}
              </div>
              <div className="mb-4">
                <strong>Access Body:</strong>
                <table className="min-w-full bg-white border mt-2">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Access</th>
                      <th className="py-2 px-4 border-b">Grant Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.accessBody && profile.accessBody.map((access, accessIndex) => (
                      <tr key={accessIndex}>
                        <td className="py-2 px-4 border-b">{access.ObjName}</td>
                        <td className="py-2 px-4 border-b">
                          {editMode === profileIndex ? (
                            <select
                              value={access.Access}
                              onChange={(event) => handleSelectChange(profileIndex, accessIndex, event)}
                              className="border p-1 rounded"
                            >
                              <option value="Private">Private</option>
                              <option value="Public">Public</option>
                            </select>
                          ) : (
                            access.Access
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="checkbox"
                            checked={access.GrantAccess}
                            onChange={() => handleCheckboxChange(profileIndex, accessIndex)}
                            disabled={editMode !== profileIndex || access.Access === "Public"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sharing_settings_popup;