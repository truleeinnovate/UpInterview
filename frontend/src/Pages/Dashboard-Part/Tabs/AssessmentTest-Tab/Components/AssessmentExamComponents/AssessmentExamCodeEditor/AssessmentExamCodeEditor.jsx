// Added by Ashok
// A simple code editor component with line numbers and basic actions

import { useState } from "react";
import { Play, Trash2 } from "lucide-react"; // optional icons

function CodeEditor({ value, onChange, disabled }) {
  const [language, setLanguage] = useState("javascript");

  const handleClear = () => onChange("");

  return (
    <div className="mt-4">
      <div className="relative rounded-lg shadow-md border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-3 py-2 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium">
              Code Editor
            </span>
            {/* Language Selector */}
            {/* <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 focus:outline-none border border-gray-600"
              disabled={disabled}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
            </select> */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* <button
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={disabled}
              onClick={() => alert("Run logic goes here")}
            >
              <Play size={14} /> Run
            </button> */}
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={disabled}
              onClick={handleClear}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Editor with line numbers */}
        <div className="relative flex">
          {/* Line numbers */}
          <div className="bg-gray-800 text-gray-500 text-xs text-right p-4 select-none border-r border-gray-700">
            {Array.from({ length: value?.split("\n").length || 1 }, (_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-80 bg-gray-900 text-gray-100 font-mono text-sm leading-6 p-4 focus:outline-none resize-none overflow-auto caret-gray-100"
            spellCheck="false"
            placeholder="// Write your code here..."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
