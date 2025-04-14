import React, { useRef, useEffect, useState } from 'react';
import { X, ExternalLink, User, FileText, Mail, Phone, Clock, MapPin, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion } from 'framer-motion';

function EntityDetailsSidebar({ 
  onClose, 
  entity, 
  entityType,
  onOpenInNew
}) {
  const sidebarRef = useRef(null);
  const [expandedRounds, setExpandedRounds] = useState({});

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Toggle round expansion
  const toggleRoundExpansion = (index) => {
    setExpandedRounds(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Render different content based on entity type
  const renderContent = () => {
    switch (entityType) {
      case 'candidate':
        const candidate = entity;
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              {candidate.imageUrl ? (
                <img 
                  src={candidate.imageUrl} 
                  alt={candidate.LastName} 
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 mr-4"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-foreground">{candidate.LastName}</h2>
                <div className="mt-1 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{candidate.Email}</span>
                </div>
                <div className="mt-1 flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{candidate.Phone}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary/50 p-4 rounded-md border border-border">
              <h3 className="text-md font-medium text-foreground mb-2">Experience</h3>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-foreground">{candidate.CurrentExperience} years</span>
              </div>
            </div>
            
            {candidate.resume && (
              <div>
                <h3 className="text-md font-medium text-foreground mb-2">Resume</h3>
                <a 
                  href={candidate.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    View Resume
                  </Button>
                </a>
              </div>
            )}
          </div>
        );
      
      case 'position':
        const position = entity;
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{position.title}</h2>
              <div className="mt-2 flex items-center text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />
                <span>{position.companyname}</span>
              </div>
              <div className="mt-1 flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {/* <span>{position.location}</span> */}
              </div>
            </div>
            
            <div className="bg-secondary/50 p-4 rounded-md border border-border">
              <h3 className="text-md font-medium text-foreground mb-2">Job Details</h3>
              <p className="text-muted-foreground">
                This is a {position.title} position in the {position.companyname} department, 
                {/* located in {position.location}. */}
              </p>
            </div>
          </div>
        );
      
      case 'template':
        const template = entity;
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{template.name}</h2>
              <p className="mt-1 text-muted-foreground">{template.description}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-foreground mb-3">Interview Rounds</h3>
              <div className="space-y-3">
                {template.rounds.map((round, index) => (
                  <div key={index} className="bg-secondary/50 rounded-md overflow-hidden border border-border">
                    <button 
                      onClick={() => toggleRoundExpansion(index)}
                      className="w-full flex justify-between items-center p-3 text-left hover:bg-secondary transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {index + 1}. {round.name}
                        </h4>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <span className="mr-2">{round.type}</span>
                          <span>•</span>
                          <span className="mx-2">{round.mode}</span>
                        </div>
                      </div>
                      {expandedRounds[index] ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    
                    {expandedRounds[index] && (
                      <div className="p-3 border-t border-border">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Sequence:</span>
                          <span className="ml-1 text-xs text-foreground">{round.sequence}</span>
                        </div>
                        
                        {round.interviewers.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Interviewers:</span>
                            <span className="ml-1 text-xs text-foreground">{round.interviewers.length} assigned</span>
                          </div>
                        )}
                        
                        {round.questions.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Questions:</span>
                            <span className="ml-1 text-xs text-foreground">{round.questions.length} prepared</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>No details available</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden top-9">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-black/50 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <section className="absolute inset-y-0 right-0 max-w-full flex">
          <motion.div 
            ref={sidebarRef} 
            className="w-screen max-w-full md:max-w-[50%] transform transition-all ease-in-out duration-500"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <div className="h-full bg-card shadow-xl glass-sidebar overflow-y-auto">
              <div className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">
                    {entityType === 'candidate' ? 'Candidate Details' : 
                     entityType === 'position' ? 'Position Details' : 
                     entityType === 'template' ? 'Template Details' : 
                     'Details'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onOpenInNew}
                      className="text-gray-400 hover:text-gray-500"
                      title="Open in popup"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 px-4 sm:px-6">
                <div className="absolute inset-0 px-4 sm:px-6">
                  <div className="h-full" aria-hidden="true">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default EntityDetailsSidebar;