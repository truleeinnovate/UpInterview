
import { format } from 'date-fns';
import { 
  Calendar , 
  FileText, 
  UserCog ,
  Briefcase 
} from 'lucide-react';


const Timeline = ({ events, onViewInterview }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'interview':
        return <UserCog className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'application':
        return <Briefcase className="w-5 h-5 text-purple-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleViewInterviewDetails = (event) => {
    if (event.type === 'interview' && event.interviewId) {
      onViewInterview(event.interviewId);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold  text-custom-blue">
        Timeline
      </h3>
      
      <div className="relative space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start group">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                {getIcon(event.type)}
              </div>
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200" 
                   style={{ display: index === events.length - 1 ? 'none' : 'block' }} />
            </div>
            
            <div className="ml-6 flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transform transition-transform duration-200 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{event.title}</h4>
                  <span className="text-sm text-blue-600 font-medium">
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
                
                {event.type === 'interview' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => handleViewInterviewDetails(event)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                      View Interview Details
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;