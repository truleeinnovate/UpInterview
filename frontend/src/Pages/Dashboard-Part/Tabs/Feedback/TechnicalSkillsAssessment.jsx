import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const commonSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'TypeScript',
  'AWS', 'Docker', 'MongoDB', 'REST APIs', 'GraphQL', 'CI/CD', 'Testing'
];

const levels = [
  { id: 'strong', label: 'Strong', color: 'rgb(34, 197, 94)' },
  { id: 'good', label: 'Good', color: 'rgb(59, 130, 246)' },
  { id: 'needsWork', label: 'Needs Work', color: 'rgb(251, 146, 60)' }
];

export default function TechnicalSkillsAssessment({ formData, setFormData }) {
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillLevel, setCustomSkillLevel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSkillLevelChange = (skillName, level) => {
    const currentSkills = formData.technicalSkills || {};
    const updatedSkills = { ...currentSkills };

    Object.keys(updatedSkills).forEach(key => {
      if (updatedSkills[key]) {
        updatedSkills[key] = updatedSkills[key].filter(s => s !== skillName);
      }
    });

    if (!updatedSkills[level]) {
      updatedSkills[level] = [];
    }
    updatedSkills[level].push(skillName);

    setFormData(prev => ({
      ...prev,
      technicalSkills: updatedSkills
    }));
  };

  const getSkillLevel = (skillName) => {
    const skills = formData.technicalSkills || {};
    for (const [level, skillsList] of Object.entries(skills)) {
      if (skillsList && skillsList.includes(skillName)) {
        return level;
      }
    }
    return null;
  };

  const removeSkill = (skillName) => {
    const updatedSkills = { ...formData.technicalSkills };
    Object.keys(updatedSkills).forEach(key => {
      if (updatedSkills[key]) {
        updatedSkills[key] = updatedSkills[key].filter(s => s !== skillName);
      }
    });
    setFormData(prev => ({
      ...prev,
      technicalSkills: updatedSkills
    }));
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && customSkillLevel) {
      handleSkillLevelChange(customSkillInput.trim(), customSkillLevel);
      setCustomSkillInput('');
      setCustomSkillLevel('');
      setShowCustomInput(false);
    }
  };

  const getAllSkills = () => {
    const skills = formData.technicalSkills || {};
    const allSkills = new Set();
    Object.values(skills).forEach(skillsList => {
      if (skillsList) {
        skillsList.forEach(skill => allSkills.add(skill));
      }
    });
    return Array.from(allSkills);
  };

  const getCustomSkills = () => {
    return getAllSkills().filter(skill => !commonSkills.includes(skill));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Skills Assessment</h3>
        <p className="text-sm text-gray-600">Select proficiency level for each skill</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
        {commonSkills.map((skill) => {
          const currentLevel = getSkillLevel(skill);
          return (
            <div key={skill} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="block text-sm font-medium text-gray-900 truncate max-w-[90px]">{skill}</span>
              <div className="flex gap-1 ml-auto">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSkillLevelChange(skill, level.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      currentLevel === level.id
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                    style={
                      currentLevel === level.id
                        ? { backgroundColor: level.color }
                        : {}
                    }
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {getCustomSkills().map((skill) => {
          const currentLevel = getSkillLevel(skill);
          return (
            <div key={skill} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-1 min-w-[90px]">
                <span className="block text-sm font-medium text-gray-900 truncate max-w-[120px]">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-1 ml-auto">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSkillLevelChange(skill, level.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      currentLevel === level.id
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                    style={
                      currentLevel === level.id
                        ? { backgroundColor: level.color }
                        : {}
                    }
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCustomInput ? (
        <div className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            placeholder="Skill name..."
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (customSkillLevel) {
                  addCustomSkill();
                }
              }
            }}
          />
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setCustomSkillLevel(level.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                customSkillLevel === level.id
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 bg-white border border-gray-300 hover:border-gray-400'
              }`}
              style={
                customSkillLevel === level.id
                  ? { backgroundColor: level.color }
                  : {}
              }
            >
              {level.label}
            </button>
          ))}
          <button
            type="button"
            onClick={addCustomSkill}
            disabled={!customSkillInput.trim() || !customSkillLevel}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomSkillInput('');
              setCustomSkillLevel('');
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="w-full p-2 border border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Skill</span>
        </button>
      )}
    </div>
  );
}
