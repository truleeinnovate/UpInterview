import React, { useState } from 'react';
import { format } from 'date-fns';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

const statusColumns = [
    { id: 'Requested', title: 'Requested', color: 'bg-blue-100 text-blue-800' },
    { id: 'Contacted', title: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Follow Up 1', title: 'Follow Up 1', color: 'bg-purple-100 text-purple-800' },
    { id: 'Follow Up 2', title: 'Follow Up 2', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'Approved', title: 'Approved', color: 'bg-green-100 text-green-800' }
];

const KanbanView = ({ data = [], onViewDetails, selectedOrganizationId }) => {
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCardExpand = (id) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Group data by status
    const groupedData = data.reduce((acc, item) => {
        const status = item.status || 'Requested';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(item);
        return acc;
    }, {});

    const getInitials = (firstName = '', lastName = '') => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` || 'CN';
    };

    return (
        <div className="flex space-x-4 overflow-x-auto p-4 bg-gray-50 min-h-screen">
            {statusColumns.map((column) => {
                const items = groupedData[column.id] || [];
                return (
                    <div key={column.id} className="flex-shrink-0 w-72">
                        <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${column.color}`}>
                                        {column.title}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {items.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {items.map((item) => {
                                const contact = item.contactId || {};
                                const tenant = item.tenantId || {};
                                const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A';

                                const isExpanded = expandedCards[item._id];
                                const isSelected = selectedOrganizationId === item._id;

                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white rounded-lg shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} hover:shadow-md transition-all`}
                                    >
                                        <div className="p-4">
                                            {/* Organization Request Code Badge */}
                                            {item.organizationRequestCode && (
                                                <div className="mb-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-custom-blue border border-blue-200">
                                                        {item.organizationRequestCode}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {tenant.company || 'No Company'}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => onViewDetails(item)}
                                                        className="text-gray-400 hover:text-blue-500"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCardExpand(item._id);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-gray-500 mb-3">
                                                {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                                            </div>

                                            {(isExpanded || isSelected) && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium mr-2 flex-shrink-0">
                                                                {getInitials(contact.firstName, contact.lastName)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-900">
                                                                    {fullName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {contact.email || 'No email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {contact.phone && (
                                                            <div className="text-xs text-gray-500">
                                                                <span className="font-medium">Phone: </span>
                                                                {contact.countryCode ? `${contact.countryCode} ` : ''}
                                                                {contact.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {items.length === 0 && (
                                <div className="text-center py-4 text-sm text-gray-500">
                                    No items
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanView;
