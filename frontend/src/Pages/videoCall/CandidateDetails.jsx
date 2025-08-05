import React, { useState } from 'react';
import { User, Award, GraduationCap, Briefcase, ChevronUp, ChevronDown } from 'lucide-react';

const CandidateDetails = ({ candidate }) => {
  const [expandedSections, setExpandedSections] = useState({
    skills: false,
    certificates: false,
    projects: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mock position data since it's not in the candidate object
  const position = {
    title: candidate.position,
    department: "Engineering"
  };

  // Use candidate data directly
  const candidateDetails = {
    skills: candidate.skills || [],
    certificates: candidate.certificates || [],
    projects: candidate.projects || []
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
          <h3 className="text-lg font-medium text-gray-900">Candidate Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-gray-900">{candidate?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Experience</p>
            <p className="text-gray-900">{candidate?.experience}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Position Applied</p>
            <p className="text-gray-900">{position?.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p className="text-gray-900">{position?.department}</p>
          </div>
        </div>
      </div>
      
      {/* Skills */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <button
          onClick={() => toggleSection('skills')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
            <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
          </div>
          {expandedSections.skills ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.skills && (
          <div className="mt-4 space-y-3">
            {candidateDetails.skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{skill.name}</p>
                  <p className="text-sm text-gray-500">{skill.years} years experience</p>
                </div>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                    skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                    skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Certificates */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <button
          onClick={() => toggleSection('certificates')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
            <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
          </div>
          {expandedSections.certificates ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.certificates && (
          <div className="mt-4 space-y-3">
            {candidateDetails.certificates.map((cert, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium text-gray-900">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.issuer} • {new Date(cert.date).getFullYear()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Projects */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <button
          onClick={() => toggleSection('projects')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
            <h3 className="text-lg font-medium text-gray-900">Projects</h3>
          </div>
          {expandedSections.projects ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.projects && (
          <div className="mt-4 space-y-4">
            {candidateDetails.projects.map((project, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Duration: {project.duration}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetails;