/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { format, isValid, parseISO } from 'date-fns';
import { Menu } from '@headlessui/react';
import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';

const TableView = ({ userRole, currentTickets, tickets, toggleAction, actionViewMore, currentUserId, currentOrganizationId }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuButtonRefs = useRef([]);

  const handleMenuOpen = (index) => {
    setOpenMenuIndex(index);
    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[index];

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 100; // Match SupportDesk menu size
      const spaceBelow = containerRect.bottom - buttonRect.bottom;
      setOpenUpwards(spaceBelow < dropdownHeight);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd MMM yyyy') : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'close':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasActionAccess = (ticket) => {
    if (userRole === 'SuperAdmin') {
      return true;
    } else if (userRole === 'Support Team') {
      return ticket.assignedToId === currentUserId || ticket.owner === currentUserId;
    } else if (userRole === 'Admin') {
      return true;
    } else {
      return ticket.assignedToId === currentUserId;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-9rem)] flex flex-col"
    >
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1">
        <div className="overflow-x-auto">
          <div className="inline-block w-full align-middle">
            <div className="border border-t border-b">
              <div className="h-[calc(100vh-9rem)] overflow-y-auto pb-6" ref={scrollContainerRef}>
                <table className="w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Ticket ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Contact</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Issue Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Status</th>
                      {(userRole === 'SuperAdmin' || userRole === 'Support Team') && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Priority</th>
                      )}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Created On</th>
                      {userRole === 'SuperAdmin' && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Assigned To</th>
                      )}
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTickets.map((ticket, index) => (
                      <motion.tr
                        key={ticket._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td
                          className="px-6 py-2 whitespace-nowrap text-sm font-medium text-custom-blue cursor-pointer"
                          onClick={() => {
                            if (userRole === 'Admin') {
                              navigate(`/support-desk/${ticket._id}`, {
                                state: { ticketData: ticket },
                              });
                            } else if (userRole === 'SuperAdmin' || userRole === 'Support Team') {
                              navigate(`/support-desk/view/${ticket._id}`, {
                                state: { ticketData: ticket },
                              });
                            }
                          }}
                        >
                          #{ticket._id.slice(-5, -1)}
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{ticket.contact || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{ticket.issueType || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status || 'N/A'}
                          </span>
                        </td>
                        {(userRole === 'SuperAdmin' || userRole === 'Support Team') && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority || 'N/A'}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(ticket.createdAt)}</td>
                        {userRole === 'SuperAdmin' && (
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{ticket.assignedTo || 'N/A'}</td>
                        )}
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                          <Menu as="div" className="relative">
                            {userRole === 'Admin' ? (
                              <Menu.Button
                                ref={(el) => (menuButtonRefs.current[index] = el)}
                                onClick={() => handleMenuOpen(index)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                              >
                                <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                              </Menu.Button>
                            ) : hasActionAccess(ticket) ? (
                              <Menu.Button
                                ref={(el) => (menuButtonRefs.current[index] = el)}
                                onClick={() => handleMenuOpen(index)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                              >
                                <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                              </Menu.Button>
                            ) : (
                              <span className="text-gray-300">
                                <FiMoreHorizontal className="w-5 h-5" />
                              </span>
                            )}
                            {openMenuIndex === index && (
                              <Menu.Items
                                className={`absolute w-48 bg-white rounded-lg shadow-lg border py-1 z-50 ${openUpwards ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                                  }`}
                              >
                                {(userRole === 'SuperAdmin' || userRole === 'Support Team') && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          navigate(`/support-desk/view/${ticket._id}`, {
                                            state: { ticketData: ticket },
                                          });
                                          setOpenMenuIndex(null);
                                        }}
                                        className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <Eye className="w-4 h-4 text-blue-600" />
                                        View Details
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                                {userRole === 'Admin' && (
                                  <>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            navigate(`/support-desk/${ticket._id}`, {
                                              state: { ticketData: ticket },
                                            });
                                            setOpenMenuIndex(null);
                                          }}
                                          className={`${active ? 'bg-gray-50' : ''
                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                          <Eye className="w-4 h-4 text-blue-600" />
                                          View Details
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            navigate(`/support-desk/edit-ticket/${ticket._id}`, {
                                              state: { ticketData: ticket },
                                            });
                                            setOpenMenuIndex(null);
                                          }}
                                          className={`${active ? 'bg-gray-50' : ''
                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                          <Pencil className="w-4 h-4 text-green-600" />
                                          Edit
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </>
                                )}
                              </Menu.Items>
                            )}
                          </Menu>
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
    </motion.div>
  );
};

export default TableView;