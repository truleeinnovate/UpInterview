import React, { useState, useEffect } from 'react';
import { X, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const ResumeHistoryPopup = ({ candidateId, candidateName, onClose, onUpdate }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchResumes();
    }, [candidateId]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}/resumes`);
            setResumes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching resumes:", error);
            setLoading(false);
        }
    };

    const handleSetActive = async (resumeId) => {
        try {
            setUpdatingId(resumeId);
            await axios.put(`${process.env.REACT_APP_API_URL}/candidate/resume/active`, {
                candidateId,
                resumeId
            });
            await fetchResumes(); // Refresh list to show new active status
            if (onUpdate) onUpdate(); // Refresh parent view
            setUpdatingId(null);
        } catch (error) {
            console.error("Error setting active resume:", error);
            setUpdatingId(null);
        }
    };

    const handleDownload = (url, filename) => {
        // Create a temporary anchor tag for downloading the file
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || 'resume.pdf'); // Set the download attribute with a filename
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const k = 1024;
        const dm = 2; // decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                        All Resumes - {candidateName}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No resumes found for this candidate.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resumes.map((resume, index) => {
                                const isLatest = index === 0 && resumes.length > 1; // Assuming sorted by date desc
                                const versionLabel = resume.version ? `v${resume.version}` : `v${resumes.length - index}`;

                                return (
                                    <div
                                        key={resume._id}
                                        className={`bg-white rounded-lg border ${resume.isActive ? 'border-[rgb(33,121,137)] shadow-sm' : 'border-gray-200'} p-4 transition-all hover:shadow-md`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resume.isActive ? 'bg-[rgb(33,121,137)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">
                                                            Resume {versionLabel}
                                                        </span>
                                                        {resume.isActive && (
                                                            <span className="px-2 py-0.5 text-xs font-bold bg-[rgb(33,121,137)] text-white rounded uppercase tracking-wider">
                                                                Active
                                                            </span>
                                                        )}
                                                        {/* {isLatest && !resume.isActive && (
                                                            <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded uppercase tracking-wider">
                                                                Latest
                                                            </span>
                                                        )} */}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                        <span>Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{formatSize(resume.resume?.size)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleDownload(resume.fileUrl, `${candidateName.replace(/\s+/g, '_')}_Resume_${versionLabel}.pdf`)}
                                                    className="p-2 text-gray-500 hover:text-[rgb(33,121,137)] hover:bg-gray-50 rounded-full transition-colors"
                                                    title="Download Resume"
                                                >
                                                    <Download size={20} />
                                                </button>

                                                {!resume.isActive && (
                                                    <button
                                                        onClick={() => handleSetActive(resume._id)}
                                                        disabled={updatingId === resume._id}
                                                        className="text-sm font-medium text-[rgb(33,121,137)] hover:text-[rgb(28,102,116)] hover:underline disabled:opacity-50"
                                                    >
                                                        {updatingId === resume._id ? 'Updating...' : 'Set Active'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeHistoryPopup;
