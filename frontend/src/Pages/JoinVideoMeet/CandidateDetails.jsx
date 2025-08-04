import React from 'react';
import { MapPin, Calendar, Award, Briefcase, Code, Star } from 'lucide-react';

const CandidateDetails = ({ candidate }) => {
  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSkillStars = (level) => {
    const levels = { 'Expert': 5, 'Intermediate': 3, 'Medium': 2 };
    return levels[level] || 1;
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#217989] to-[#2d96aa] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-sm"></div>
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.name}</h1>
              <p className="text-xl text-[#217989] font-semibold mb-1">{candidate.position}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Available for interview</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-900 font-semibold">{candidate.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Experience</p>
                  <p className="text-gray-900 font-semibold">{candidate.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#217989] bg-opacity-10 rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-[#217989]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Technical Skills</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {candidate.skills.map((skill, index) => (
            <div key={index} className="group hover:shadow-sm transition-all duration-200 border border-gray-200 rounded-lg p-4 hover:border-[#217989] hover:border-opacity-40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSkillLevelColor(skill.level)}`}>
                  {skill.level}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {skill.years} years experience
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#217989] bg-opacity-10 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-[#217989]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Certifications</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {candidate.certificates.map((cert, index) => (
            <div key={index} className="group hover:shadow-md transition-all duration-200 border border-gray-200 rounded-xl p-6 hover:border-[#217989] hover:border-opacity-30">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#217989] to-[#2d96aa] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{cert.name}</h3>
                  <p className="text-[#217989] font-semibold mb-3">{cert.issuer}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Issued:</span> {new Date(cert.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">ID:</span> {cert.credentialId}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#217989] bg-opacity-10 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#217989]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Key Projects</h2>
        </div>
        
        <div className="space-y-8">
          {candidate.projects.map((project, index) => (
            <div key={index} className="group hover:shadow-md transition-all duration-200 border border-gray-200 rounded-xl p-8 hover:border-[#217989] hover:border-opacity-30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{project.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#217989] rounded-full"></span>
                      <span className="font-semibold text-gray-700">Role:</span>
                      <span className="text-gray-600">{project.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#217989] rounded-full"></span>
                      <span className="font-semibold text-gray-700">Duration:</span>
                      <span className="text-gray-600">{project.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-gradient-to-r from-[#217989] to-[#2d96aa] bg-opacity-10 text-[#217989] rounded-lg text-sm font-medium border border-[#217989] border-opacity-20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed text-lg">{candidate.resumeSummary}</p>
      </div>
    </div>
  );
};

export default CandidateDetails;