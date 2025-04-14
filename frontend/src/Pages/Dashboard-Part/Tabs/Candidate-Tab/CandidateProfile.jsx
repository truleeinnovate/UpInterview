import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const CandidateProfile = ({ candidate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          <FaUser className="w-10 h-10 text-gray-400" />
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <p className="text-gray-600">{candidate.currentRole}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <FaEnvelope className="text-gray-500 mr-2" />
          <span>{candidate.email}</span>
        </div>
        <div className="flex items-center">
          <FaPhone className="text-gray-500 mr-2" />
          <span>{candidate.phone}</span>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-gray-500 mr-2" />
          <span>{candidate.location}</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;