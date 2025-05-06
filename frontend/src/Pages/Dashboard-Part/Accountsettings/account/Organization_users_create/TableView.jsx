import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MoreHorizontal, Info } from 'lucide-react';
import maleImage from "../../../Images/man.png";
import femaleImage from "../../../Images/woman.png";
import genderlessImage from "../../../Images/transgender.png";
import { useNavigate } from "react-router-dom";

const TableView = ({ currentFilteredRows, toggleAction, actionViewMore, handleUserClick, handleEditClick, loading, userData, toggleSidebar }) => {

  const navigate = useNavigate();
  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
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
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button onClick={() => toggleAction(users._id)}>
                            <MoreHorizontal className="text-3xl" />
                          </button>
                          {actionViewMore === users._id && (
                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                              <div className="space-y-1">
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() => {
                                    // handleUserClick(users);
                                    navigate(`details/${users._id}`, { state: { userData: users } });
                                  }}
                                >
                                  View
                                </p>
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() => {
                                    // handleEditClick(users);
                                    navigate(`edit/${users._id}`, { state: { userData: users } });
                                  }}
                                >
                                  Edit
                                </p>
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
