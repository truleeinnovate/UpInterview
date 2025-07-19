import { motion } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { Building2, Briefcase, Clock, MapPin, Eye, Pencil } from "lucide-react";

const formatCreatedDate = (date) => {
  return date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMM, yyyy")
    : 'N/A';
};

const PositionKanban = ({ positions, loading, onView, onEdit, effectivePermissions }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-1/4 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-20 bg-gray-200 skeleton-animation rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center w-full space-x-3">
                  <div className="w-10 h-6 bg-gray-200 skeleton-animation rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter}>
      <motion.div
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800">All Positions</h3>
            <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {positions?.length} {`Position${positions?.length === 1 ? '' : 's'}`}
            </span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
            {positions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Positions Found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  There are no positions to display at the moment. Create a new position to get started.
                </p>
              </div>
            ) : (
              positions.map((position, index) => (
                <motion.div
                  key={position._id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => effectivePermissions.Positions?.View && onView(position)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="relative"></div>
                      <div>
                        <h4 className="text-sm font-medium text-custom-blue">{position?.title.charAt(0).toUpperCase() + position?.title.slice(1) || 'N/A'}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {effectivePermissions.Positions?.View && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(position);
                          }}
                          className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      )}
                      {effectivePermissions.Positions?.Edit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(position);
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
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
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {position?.skills?.slice(0, 3).map((skill, index) => (
                        <motion.span
                          key={index}
                          className="px-2 py-1 bg-custom-bg text-custom-blue rounded-lg text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          {skill.skill}
                        </motion.span>
                      ))}
                      {position?.skills?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                          +{position?.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </DndContext>
  );
};

export default PositionKanban;