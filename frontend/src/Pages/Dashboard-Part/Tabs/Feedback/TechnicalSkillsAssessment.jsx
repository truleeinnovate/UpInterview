import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const levels = [
  { id: 'strong', label: 'Strong', color: '#16A34A' },
  { id: 'good', label: 'Good', color: '#2563EB' },
  { id: 'basic', label: 'Basic', color: '#F59E0B' },
  { id: 'noExperience', label: 'No Experience', color: '#6B7280' }
];

/**
 * TechnicalSkillsAssessment
 *
 * Props:
 *   presetSkillNames: string[]  — skills coming from position/mock interview data.
 *                                 These will show NO remove button.
 *                                 Any skill in skillOrder NOT in this list is custom-added
 *                                 and WILL show a remove button.
 */
export default function TechnicalSkillsAssessment({ formData, setFormData, onSkillChange, isReadOnly, presetSkillNames, fullscreenState }) {
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillLevel, setCustomSkillLevel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Build a Set of lowercase preset skill names for O(1) lookup
  const presetSet = new Set(
    (presetSkillNames || []).map(n => (n || '').trim().toLowerCase())
  );

  const isPresetSkill = (skillName) =>
    presetSet.has((skillName || '').trim().toLowerCase());

  const handleSkillLevelChange = (skillName, level) => {
    if (isReadOnly) return;
    const currentSkills = formData.technicalSkills || {};
    const updatedSkills = { ...currentSkills };
    const skillOrder = [...(formData.skillOrder || [])];

    // Remove from whatever bucket it's in
    Object.keys(updatedSkills).forEach(key => {
      if (Array.isArray(updatedSkills[key])) {
        updatedSkills[key] = updatedSkills[key].filter(s => s !== skillName);
      }
    });

    if (!updatedSkills[level]) updatedSkills[level] = [];
    updatedSkills[level].push(skillName);

    if (!skillOrder.includes(skillName)) skillOrder.push(skillName);

    setFormData(prev => ({ ...prev, technicalSkills: updatedSkills, skillOrder }));
    if (onSkillChange) onSkillChange();
  };

  const getSkillLevel = (skillName) => {
    const skills = formData.technicalSkills || {};
    for (const [level, skillsList] of Object.entries(skills)) {
      if (Array.isArray(skillsList) && skillsList.includes(skillName)) return level;
    }
    return null;
  };

  const removeSkill = (skillName) => {
    if (isReadOnly) return;
    const updatedSkills = { ...formData.technicalSkills };
    const skillOrder = (formData.skillOrder || []).filter(s => s !== skillName);
    Object.keys(updatedSkills).forEach(key => {
      if (Array.isArray(updatedSkills[key])) {
        updatedSkills[key] = updatedSkills[key].filter(s => s !== skillName);
      }
    });
    setFormData(prev => ({ ...prev, technicalSkills: updatedSkills, skillOrder }));
    if (onSkillChange) onSkillChange();
  };

  const addCustomSkill = () => {
    if (isReadOnly) return;
    if (customSkillInput.trim() && customSkillLevel) {
      handleSkillLevelChange(customSkillInput.trim(), customSkillLevel);
      setCustomSkillInput('');
      setCustomSkillLevel('');
      setShowCustomInput(false);
    }
  };

  console.log("fullscreenState", fullscreenState)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Skills Assessment</h3>
        <p className="text-sm text-gray-600">Select proficiency level for each skill</p>
      </div>

      <div className={`grid gap-2 ${fullscreenState
        ? 'sm:grid-cols-1 md:grid-cols-1 grid-cols-2 '
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2  '
        }`}>
        {(formData.skillOrder || []).map((skill) => {
          const currentLevel = getSkillLevel(skill);
          const isPreset = isPresetSkill(skill);
          return (
            <div key={skill} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
              {/* Skill name */}
              <div className="flex items-center gap-1 min-w-[90px] overflow-hidden">
                <span className="block text-sm font-medium text-gray-900 truncate" title={skill}>{skill}</span>
                {/* {!isPreset && (
                  <span className="text-[10px] text-gray-400 italic ml-1">(custom)</span>
                )} */}
              </div>

              {/* Level buttons */}
              <div className="flex gap-1 ml-auto">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSkillLevelChange(skill, level.id)}
                    disabled={isReadOnly}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${currentLevel === level.id
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 bg-white border border-gray-300 hover:border-gray-400'
                      } ${isReadOnly ? 'cursor-default' : ''}`}
                    style={currentLevel === level.id ? { backgroundColor: level.color } : {}}
                  >
                    {level.label}
                  </button>
                ))}
              </div>

              {/* Remove button — only for custom-added skills */}
              {!isReadOnly && !isPreset ? (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remove custom skill"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                /* Spacer keeps layout aligned when button is absent */
                !isReadOnly && <span className="w-3 h-3 flex-shrink-0 inline-block" />
              )}
            </div>
          );
        })}
      </div>

      {!isReadOnly && (
        <>
          {showCustomInput ? (
            <div className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded flex-wrap">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Skill name..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customSkillLevel) addCustomSkill();
                  }
                }}
              />
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setCustomSkillLevel(level.id)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${customSkillLevel === level.id
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                  style={customSkillLevel === level.id ? { backgroundColor: level.color } : {}}
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
                onClick={() => { setShowCustomInput(false); setCustomSkillInput(''); setCustomSkillLevel(''); }}
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
        </>
      )}
    </div>
  );
}
