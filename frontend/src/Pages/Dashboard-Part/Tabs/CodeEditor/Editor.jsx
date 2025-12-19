import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { config } from "../../../../config";
import Cookies from "js-cookie";

const LANGUAGES = [
  {
    label: "Python",
    value: "python3",
    version: "4",
    icon: "🐍",
    defaultCode:
      'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))',
    monacoLang: "python",
  },
  {
    label: "JavaScript (Node.js)",
    value: "nodejs",
    version: "4",
    icon: "⚡",
    defaultCode:
      'const greet = (name) => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet("World"));',
    monacoLang: "javascript",
  },
  {
    label: "Java",
    value: "java",
    version: "4",
    icon: "☕",
    defaultCode:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    monacoLang: "java",
  },
  {
    label: "C++",
    value: "cpp17",
    version: "1",
    icon: "⚙️",
    defaultCode:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    monacoLang: "cpp",
  },
  {
    label: "C",
    value: "c",
    version: "5",
    icon: "🔧",
    defaultCode:
      '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    monacoLang: "c",
  },
  {
    label: "Go",
    value: "go",
    version: "4",
    icon: "🔷",
    defaultCode:
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    monacoLang: "go",
  },
  {
    label: "Ruby",
    value: "ruby",
    version: "4",
    icon: "💎",
    defaultCode:
      'def greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")',
    monacoLang: "ruby",
  },
  {
    label: "PHP",
    value: "php",
    version: "4",
    icon: "🐘",
    defaultCode:
      '<?php\nfunction greet($name) {\n    return "Hello, $name!";\n}\n\necho greet("World");\n?>',
    monacoLang: "php",
  },
  {
    label: "Rust",
    value: "rust",
    version: "4",
    icon: "🦀",
    defaultCode: 'fn main() {\n    println!("Hello, World!");\n}',
    monacoLang: "rust",
  },
  {
    label: "Kotlin",
    value: "kotlin",
    version: "3",
    icon: "🎯",
    defaultCode: 'fun main() {\n    println("Hello, World!")\n}',
    monacoLang: "kotlin",
  },
  {
    label: "Swift",
    value: "swift",
    version: "4",
    icon: "🦅",
    defaultCode: 'print("Hello, World!")',
    monacoLang: "swift",
  },
  {
    label: "TypeScript",
    value: "nodejs",
    version: "4",
    icon: "📘",
    defaultCode:
      'const greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet("World"));',
    monacoLang: "typescript",
  },
  {
    label: "C#",
    value: "csharp",
    version: "4",
    icon: "💠",
    defaultCode:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    monacoLang: "csharp",
  },
  {
    label: "R",
    value: "r",
    version: "4",
    icon: "📊",
    defaultCode:
      'greet <- function(name) {\n  paste("Hello,", name, "!")\n}\n\nprint(greet("World"))',
    monacoLang: "r",
  },
  {
    label: "Scala",
    value: "scala",
    version: "4",
    icon: "🎼",
    defaultCode: 'object Main extends App {\n  println("Hello, World!")\n}',
    monacoLang: "scala",
  },
];

// const API_URL = `${
//   import.meta.env.VITE_SUPABASE_URL
// }/functions/v1/execute-code`;

export default function CodeEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);

  const authToken = Cookies.get("authToken");

  const handleLanguageChange = (e) => {
    const language = LANGUAGES.find((lang) => lang.value === e.target.value);
    setSelectedLanguage(language);
    setCode(language.defaultCode);
    setOutput("");
  };

  // const runCode = async () => {
  //   setIsRunning(true);
  //   setOutput("⏳ Executing code...");

  //   try {
  //     const response = await axios.post(API_URL, {
  //       code: code,
  //       language: selectedLanguage.value,
  //       versionIndex: selectedLanguage.version,
  //     });

  //     if (response.data.output) {
  //       setOutput(response.data.output);
  //     } else if (response.data.error) {
  //       setOutput(`❌ Error:\n${response.data.error}`);
  //     } else {
  //       setOutput("✅ Execution completed with no output");
  //     }
  //   } catch (error) {
  //     setOutput(
  //       `❌ Error: ${error.message}\n\nPlease try again or select a different language.`
  //     );
  //   } finally {
  //     setIsRunning(false);
  //   }
  // };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("⏳ Executing code...");

    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/execute`,
        {
          code,
          language: selectedLanguage.value,
          versionIndex: selectedLanguage.version,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.output) {
        setOutput(response.data.output);
      } else if (response.data.error) {
        setOutput(`❌ Error:\n${response.data.error}`);
      } else {
        setOutput("✅ Execution completed with no output");
      }
    } catch (error) {
      setOutput(
        `❌ Error: ${error.message}\n\nPlease try again or select a different language.`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const isExpanded = leftExpanded || rightExpanded;

  return (
    <div className="h-full flex flex-col bg-[#0a0e27] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between px-8 py-5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-800/60 px-5 py-3 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-lg opacity-50 animate-pulse"></div>
              <span className="relative text-3xl drop-shadow-lg">
                {selectedLanguage.icon}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Select Language
              </label>
              <select
                value={selectedLanguage.value}
                onChange={handleLanguageChange}
                className="bg-slate-700/50 text-slate-100 px-4 py-2.5 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-slate-700 cursor-pointer font-semibold text-sm shadow-inner"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value + lang.label} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-500/50"></div>
            <span className="text-xs text-slate-400 font-semibold">
              Ready to Execute
            </span>
          </div>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`group relative px-8 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 shadow-2xl ${
              isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400 text-white transform hover:scale-105 hover:-translate-y-0.5 active:scale-100"
            }`}
          >
            {!isRunning && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            )}
            <span className="relative z-10 flex items-center gap-3">
              {isRunning ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Executing...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run Code
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex overflow-hidden p-4 gap-4">
        <div
          className={`${
            rightExpanded ? "hidden" : leftExpanded ? "w-full" : "w-1/2"
          } flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                <svg
                  className="w-5 h-5 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <div>
                <span className="text-slate-100 font-bold text-lg">
                  Code Editor
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Write your code here
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setLeftExpanded(!leftExpanded);
                if (rightExpanded) setRightExpanded(false);
              }}
              className="group p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-all"
              title={leftExpanded ? "Restore" : "Maximize"}
            >
              {leftExpanded ? (
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={selectedLanguage.monacoLang}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 16,
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: true,
                padding: { top: 20, bottom: 20 },
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                lineHeight: 24,
                letterSpacing: 0.5,
              }}
            />
          </div>
        </div>

        <div
          className={`${
            leftExpanded ? "hidden" : rightExpanded ? "w-full" : "w-1/2"
          } flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg border border-emerald-500/30">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-slate-100 font-bold text-lg">
                  Output Console
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Execution results
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setRightExpanded(!rightExpanded);
                if (leftExpanded) setLeftExpanded(false);
              }}
              className="group p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 hover:border-emerald-500/50 transition-all"
              title={rightExpanded ? "Restore" : "Maximize"}
            >
              {rightExpanded ? (
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[#0a0e1a]/80 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
            <pre className="p-8 text-slate-300 font-mono text-[15px] leading-loose whitespace-pre-wrap selection:bg-cyan-500/30">
              {output || (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                    <svg
                      className="w-12 h-12 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold mb-1">
                      No Output Yet
                    </p>
                    <p className="text-slate-600 text-sm">
                      Click "Run Code" button to execute your program
                    </p>
                  </div>
                </div>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
