import React, { useState, useEffect } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import fetchOrganizationData from '../../../../utils/fetchOrganizationData';

const Sharing_settings = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(null); 

    useEffect(() => {
        const fetchSharingSettings = async () => {
            try {
                const data = await fetchOrganizationData('sharing-settings');
                const filteredProfiles = data;
                setProfiles(filteredProfiles);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSharingSettings();
    }, []);

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
                setEditMode(null); // Exit edit mode
            } catch (error) {
                console.error('Error saving sharing settings:', error);
            }
        } else {
            setEditMode(profileIndex); // Enter edit mode
        }
    };

    if (loading) return <div className='ml-64'>Loading...</div>;
    if (error) return <div className='ml-64'>Error: {error.message}</div>;

    return (
        <div className='ml-64'>
            <div className="p-4 overflow-y-auto">
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
                                    {profile.accessBody.map((access, accessIndex) => (
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
    );
}

export default Sharing_settings;