import React from 'react';
import { format,parseISO, isValid } from 'date-fns';
import { FaBuilding, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import { PiSuitcaseSimpleBold  } from "react-icons/pi";
const AppliedPositions = ({ positions, onViewDetails }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold   text-custom-blue">
          Applied Positions
        </h3>
        <button className="px-4 py-2 bg-custom-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">
          Add Position
        </button>
      </div>

      {positions.length > 0 ? 

        // 'sm': {'max': '639px'},
  // 'md': {'min': '640px', 'max': '1023px'},
  // 'lg': {'min': '1024px', 'max': '1279px'},
  // 'xl': {'min': '1280px', 'max': '1535px'},
  // '2xl': {'min': '1536px'},

      <div className="grid gap-6  lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
        {positions.map((position, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-xl font-semibold text-gray-800">{position.positionInfo.title}</h4>
                <p className="text-gray-600">{position.positionInfo.companyname}</p>
              </div>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${position.status === 'Active' ? 'bg-green-100 text-green-800' :
                  position.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}
              `}>
                {position.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FaBuilding className="w-4 h-4" />
                <span className="text-sm">{position.positionInfo.companyname}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <PiSuitcaseSimpleBold  className="w-4 h-4" />
                <span className="text-sm">Exp {position.positionInfo.minexperience}-{position.positionInfo.maxexperience}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaCalendarAlt className="w-4 h-4" />
                <span className="text-sm">
                {position.applicationDate && isValid(parseISO(position.applicationDate))
                    ? format(parseISO(position.applicationDate), 'MMM dd, yyyy')
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock className="w-4 h-4" />
                <span className="text-sm">Full Time</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Application Stage</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">2/3</span>
                  </div>
                </div>
                <button 
                  onClick={() => onViewDetails(position)}
                  className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      : <p className='text-center text-lg font-semibold'>No positions are Applied yet</p>}
    </div>
  );
};

export default AppliedPositions;