import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, Calendar, CheckCircle, Building, MapPin, Briefcase } from 'lucide-react';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';
import { config } from '../../../../config';

const InterviewersList = () => {
    const tokenPayload = decodeJwt(Cookies.get('authToken'));
    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;
    

  const [interviewers, setInterviewers] = useState([]);
  console.log('interviewers from home', interviewers);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const response = await fetch(`${config.REACT_APP_API_URL}/users/interviewers/${tenantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch interviewers');
        }
        const data = await response.json();
        setInterviewers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewers();
  }, [tenantId]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  // if (error) {
  //   return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  // }

  return (
   <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Available Interviewers</h2>
          <p className="text-sm text-gray-500">Expert interviewers ready to help</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-xl hover:bg-custom-blue/90 transition-all duration-300">
          <span className="text-sm font-medium">View All</span>
          <ChevronRight size={18} />

        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 -mr-2">
        {interviewers.map((interviewer) => (
          <div 
            key={interviewer.id} 
            className="p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={interviewer.image}
                  alt={interviewer.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                />
                <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                  interviewer.type === 'Internal' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {interviewer.type}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{interviewer.name}</h3>
                    <p className="text-xs text-gray-600">{interviewer.role}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">{interviewer.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <Building size={14} />
                    <span>{interviewer.department || interviewer.company}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <MapPin size={14} />
                    <span>{interviewer.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <Briefcase size={14} />
                    <span>{interviewer.completedInterviews} interviews</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>Next: {interviewer.nextAvailable}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    interviewer.availability === 'Available' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <CheckCircle size={14} className="mr-1" />
                    {interviewer.availability}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                      Profile
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewersList;