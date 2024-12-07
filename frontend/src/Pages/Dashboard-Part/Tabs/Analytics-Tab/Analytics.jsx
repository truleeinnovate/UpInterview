import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Monaco from '@monaco-editor/react';

function CodeEditor() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [prevLanguage, setPrevLanguage] = useState('python');

    const runCode = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: language,
                version: '*',
                files: [{ name: 'main', content: code }]
            });
            setOutput(response.data.run.output);
        } catch (error) {
            setOutput(error.message);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (language !== prevLanguage) {
            if (code.trim() !== '') {
                const confirmChange = window.confirm('You have changed the language. The code and output will be cleared. Do you want to proceed?');
                if (confirmChange) {
                    setCode('');
                    setOutput('');
                    setPrevLanguage(language);
                } else {
                    setLanguage(prevLanguage);
                }
            } else {
                setPrevLanguage(language);
            }
        }
    }, [language, code, prevLanguage]);

    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center p-2">
            <div className="w-full max-w-6xl flex">
                <div className="w-1/2 p-4">
                    <div className='flex justify-between'>
                        <h2 className="text-2xl mb-4">Code Editor :</h2>
                        <div className="flex justify-between items-center mb-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-gray-300 text-black p-2 rounded-lg"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="typescript">TypeScript</option>
                                <option value="java">Java</option>
                                <option value="csharp">C#</option>
                                <option value="cpp">C++</option>
                                <option value="php">PHP</option>
                                <option value="ruby">Ruby</option>
                                <option value="go">Go</option>
                                <option value="swift">Swift</option>
                                <option value="kotlin">Kotlin</option>
                                <option value="sql">SQL</option>
                                <option value="r">R</option>
                                <option value="shell">Shell</option>
                                <option value="objective-c">Objective-C</option>
                                <option value="perl">Perl</option>
                                <option value="rust">Rust</option>
                                <option value="dart">Dart</option>
                                <option value="scala">Scala</option>
                                <option value="lua">Lua</option>
                            </select>
                        </div>
                   </div>
                    <Monaco
                        className='rounded'
                        height="500px"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value)}
                    />
                </div>
                <div className="w-1/2 p-4">
                    <div className='flex justify-between'>
                        <h3 className="text-2xl mb-4">Output :</h3>
                        <div className="flex justify-between items-center mb-2">
                            <button
                                onClick={runCode}
                                className="bg-blue-500 text-white p-2 rounded-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Run'}
                            </button>
                        </div>
                   </div>
                    <pre className="bg-gray-900 text-white p-4 h-[500px] rounded mt-2">{output}</pre>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;