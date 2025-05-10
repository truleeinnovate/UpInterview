// Import necessary dependencies and components

import { DndContext, closestCenter } from '@dnd-kit/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { Building2, Briefcase, Clock, MapPin } from "lucide-react";

import { Eye, Pencil } from 'lucide-react';

const formatCreatedDate = (date) => {
  return date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMM, yyyy")
    : 'N/A';
}
// Status badge component for displaying   candidate status
// const StatusBadge = ({ status }) => {
//   const styles = {
//     active: 'bg-green-100 text-green-800',
//     onhold: 'bg-yellow-100 text-yellow-800',
//     rejected: 'bg-red-100 text-red-800'
//   };

//   return (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// };

// Candidate list component for displaying candidates in a grid layout

// Main Kanban component with drag-and-drop functionality
const PositionKanban = ({ positions}) => {
  const navigate = useNavigate();
  const location= useLocation();
  return (
    <DndContext collisionDetection={closestCenter}>
       <div className="w-full  bg-gray-50 rounded-xl p-4 h-[calc(100vh-11rem)]">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">All Positions</h3>
      <span className="px-2 py-1 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
        {positions?.length} Positions
      </span>
    </div>
    {/* Grid layout for position cards */}
   {positions.length === 0 ? (
    <div className="flex justify-center items-center h-full py-20 text-gray-500 text-lg">
      No positions found.
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {positions.map((position) => (
        <div
          key={position._id}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* position card header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <div className="relative">

                {/* <StatusBadge status={position?.Status || "?"} /> */}
              </div>
              <div className=""
               onClick={() =>  navigate(`/positions/view-details/${position._id}`, { state: { from: location.pathname }})}
              >
                <h4 className="text-sm font-medium text-custom-blue">{position?.title || 'N/A'}</h4>
                {/* <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaBriefcase className="w-3 h-3" />
                  {position.companyName || 'position'}
                </p> */}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
               onClick={() =>  navigate(`/positions/view-details/${position._id}`, { state: { from: location.pathname }})}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
               onClick={() =>   navigate(`/positions/edit-position/${position._id}`)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {/* <button
                onClick={() => window.open(`/candidates/${position._id}`, '_blank')}
                className="p-1.5 text-custom-blue hover:bg-gray-50 rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <FaExternalLinkAlt className="w-4 h-4 text-custom-blue" />
              </button> */}
            </div>
          </div>

          {/* Contact information */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="truncate"> {position?.companyname || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="truncate">
                  {position?.minexperience && position?.maxexperience
                    ? `${position.minexperience} - ${position.maxexperience} years`
                    : position?.minexperience
                      ? `${position.minexperience} - Not Disclosed`
                      : position?.maxexperience
                        ? `${position.maxexperience} - Not Disclosed`
                        : 'Not Disclosed'}
                </span>

              </div>
            </div>


            <div className="grid grid-cols-2 gap-2">

              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                {formatCreatedDate(position?.createdDate)}
              </div>

              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>{position?.Location || 'Not disclosed'}</span>
              </div>
            </div>

          </div>

          {/* Skills section */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {position?.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-custom-bg text-custom-blue rounded-lg text-xs font-medium"
                >
                  {skill.skill}
                </span>
              ))}
              {position?.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                  +{position?.skills.length - 3} more
                </span>
              )}
            </div>
          </div>


        </div>
      ))}
    </div>
  )}
  </div>
    </DndContext>
  );
};

export default PositionKanban;