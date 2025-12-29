import React, { useEffect, useState } from 'react';
// import axios from 'axios';

const Testingvideosdkforenv = () => {
    // const [backendStatus, setBackendStatus] = useState('Loading...');
    // const [error, setError] = useState(null);

    const frontendVars = {
        'REACT_APP_REDIRECT_URI': process.env.REACT_APP_REDIRECT_URI || 'Not set',
        'REACT_APP_VIDEOSDK_TOKEN': process.env.REACT_APP_VIDEOSDK_TOKEN || 'Not set',
        'REACT_APP_VIDEOSDK_TOKEN1': process.env.REACT_APP_VIDEOSDK_TOKEN1 || 'Not set',
        'REACT_APP_API_URL': process.env.REACT_APP_API_URL || 'Not set',
        'NODE_ENV': process.env.NODE_ENV || 'Not set'
    };

    // useEffect(() => {
    //     // Log frontend environment variables to browser console
    //     console.log('\n===== Frontend Environment Variables =====');
    //     console.log('Current Time:', new Date().toISOString());
    //     console.log('----------------------------------------');
    //     Object.entries(frontendVars).forEach(([key, value]) => {
    //         console.log(`${key}: ${value}`);
    //     });
    //     console.log('======================================\n');

    //     // Call backend to log its environment variables
    //     // Update the axios call in your useEffect
    //     // In Testingvideosdkforenv.js, update the axios call to:
    //     const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    //     axios.get(`${apiUrl}/api/log-env`)
    //         .then(response => {
    //             console.log('Backend response:', response.data);
    //             setBackendStatus(`Backend variables logged at ${new Date().toLocaleTimeString()}`);
    //         })
    //         .catch(err => {
    //             console.error('Error calling backend:', {
    //                 message: err.message,
    //                 response: err.response?.data,
    //                 status: err.response?.status
    //             });
    //             setError(`Failed to connect to backend: ${err.response?.data?.message || err.message}`);
    //             setBackendStatus('Error connecting to backend');
    //         });
    // }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>

            {/* <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                <h2 className="font-semibold mb-2">Backend Status:</h2>
                <p className={error ? 'text-red-600' : 'text-green-600'}>
                    {error || backendStatus}
                </p>
            </div> */}

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Frontend Environment Variables</h2>
                    <p className="text-sm text-gray-500">These values are from the frontend environment</p>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(frontendVars).map(([key, value]) => (
                            <tr key={key} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{key}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono break-all">
                                    {value}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value && value !== 'Not set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {value && value !== 'Not set' ? 'Loaded' : 'Not Loaded'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Note:</strong> All values are now visible. Make sure to never commit sensitive information to version control.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testingvideosdkforenv;