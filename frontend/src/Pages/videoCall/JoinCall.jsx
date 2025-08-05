import React, { useState } from 'react';
import RoleSelector from './RoleSelector';
import CandidateView from './CandidateView';
import InterviewerView from './InterviewerView';

function JoinMeeting() {
  const [currentRole, setCurrentRole] = useState(null);

  const handleRoleSelect = (role) => {
    setCurrentRole(role);
  };

  const handleBack = () => {
    setCurrentRole(null);
  };

  if (!currentRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  if (currentRole === 'candidate') {
    return <CandidateView onBack={handleBack} />;
  }

  return <InterviewerView onBack={handleBack} />;
}

export default JoinMeeting;