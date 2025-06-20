import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MoreHorizontal, Info, Eye, Pencil, CheckCircle, XCircle } from 'lucide-react';
import maleImage from "../../../Images/man.png";
import femaleImage from "../../../Images/woman.png";
import genderlessImage from "../../../Images/transgender.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { config } from '../../../../../config';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { useState } from 'react';

const TableView = ({ currentFilteredRows, toggleAction, actionViewMore,setActionViewMore, handleUserClick, handleEditClick, loading, userData, toggleSidebar }) => {
const {
    toggleUserStatus,
   } = useCustomContext();
  const navigate = useNavigate();


  // State for confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const handleStatusToggle = (users) => {
    const status = users.status === "active" ? "inactive" : "active";
    setSelectedUser(users);
    setNewStatus(status);
    setShowConfirmation(true);
    setActionViewMore(false);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      toggleUserStatus.mutate({
        userId: selectedUser._id,
        newStatus
      });
    }
    setShowConfirmation(false);
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
  };


  //   const handleStatusToggle = (users) => {
  //     const newStatus = users.status === "active" ? "inactive" : "active";
  //   toggleUserStatus.mutate(
  //     {
  //         userId: users._id, // Make sure this is _id (not _Id)
  //     newStatus 
  //     });
  //     setActionViewMore(false)
  // };

//   const toggleUserStatus = async (user) => {
//   const newStatus = user.status === "active" ? "inactive" : "active";

//   try {
//     const response = await axios.patch(`${config.REACT_APP_API_URL}/users/${user._id}/status`, {
//       status: newStatus,
//       modifiedBy: "admin"  // Optional if you're tracking who made the change
//     });

//     console.log("User status updated:", response.data);

//     // Refresh UI: you should update the state in parent or refetch data
//     toggleSidebar(); // or any state refetch you use to trigger UI update
//     setActionViewMore(false)
//   } catch (error) {
//     console.error("Failed to update user status", error);
//   }
// };



  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
            <p className="mb-2">
              Are you sure you want to change the status of {selectedUser?.firstName} {selectedUser?.lastName} to {newStatus}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-custom-blue text-white rounded-md "
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentFilteredRows.map((users) => (
                    <motion.tr
                      key={users._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            {users?.imageUrl ? (
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={users.imageUrl}
                                alt={`${users.firstName || ''} ${users.lastName || ''}`}
                                onError={(e) => {
                                  e.target.src = users.gender === "Male" ? maleImage :
                                    users.gender === "Female" ? femaleImage :
                                      genderlessImage;
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                {users.firstName ? users.firstName.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-custom-blue">
                              {`${users.firstName || ''} ${users.lastName || ''}`.trim() || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {users.email}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {users.phone}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {users.label}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button onClick={() => toggleAction(users._id)}>
                            <MoreHorizontal className="text-3xl" />
                          </button>
                          {actionViewMore === users._id && (
                            <div className="absolute  w-32 z-10  rounded-md shadow-lg bg-white ring-1 pt-4 pb-4 pl-1 pr-1 ring-black ring-opacity-5 right-2">
                              <div className="space-y-1">
                                <button
                                  className={`hover:bg-gray-200 ${  users.status === "active" ? 'text-green-600' : 'text-red-600'} w-full p-1 rounded pl-3 cursor-pointer flex items-center gap-2`}
                                  onClick={() => handleStatusToggle(users)}
                                >{
                                  users.status === "active" ?
                                  <CheckCircle 
                                   size={16}
                                  //  className='fill-green-500'
                                  /> : 
                                  <XCircle 
                                  size={16}
                                  // className='fill-red-400'
                                  />
                                }
                                  {/* <Circle
                                    size={16}
                                    className={users.status === "active" ? "fill-green-500" : "fill-red-400"}
                                    // fill={users.status === "active" ? "currentColor" : "none"}
                                  /> */}
                                  {users.status === "active" ? "In Active" : "Active"}
                                </button>
                                <button
                                  className="hover:bg-gray-200 w-full p-1 rounded pl-3 cursor-pointer flex items-center gap-2"
                                  onClick={() => {
                                    // handleUserClick(users);
                                    navigate(`details/${users._id}`, { state: { userData: users } });
                                  }}
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  View
                                </button>
                                {/* <button
                                  className="hover:bg-gray-200 w-full p-1 rounded pl-3 cursor-pointer flex items-center gap-2"
                                  onClick={() => {
                                    // handleEditClick(users);
                                    navigate(`edit/${users._id}`, { state: { userData: users } });
                                  }}
                                >
                                  <Pencil className="w-4 h-4 text-green-600" />
                                  Edit
                                </button> */}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};


export default TableView;
