import React from 'react'

const ProfileMasterAdd = ({ closeAddPage, selectedTab }) => {
    return (
        <div>
            <div
                className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
            >
                <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
                    <div className="fixed top-0 w-full bg-white border-b">
                        <div className="flex justify-between items-center p-4">
                            <h2 className="text-lg font-bold">{selectedTab}</h2>
                            <button onClick={closeAddPage} className="focus:outline-none">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        <button onClick={closeAddPage} className="text-red-500">Close</button>
                        <h2 className="text-2xl font-bold mb-4"></h2>
                        {/* Add your form or content here */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileMasterAdd