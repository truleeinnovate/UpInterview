import React, { useState } from "react";
import CreateTeams1 from './AddCreateTeamForm';
import AnotherPage from './AddTeamAvailability';

const CreateTeams = ({ onClose }) => {

    const [currentPage, setCurrentPage] = useState('createTeams1');

    return (

        <>
            <div className="fixed top-0 w-full bg-white border-b z-50">
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-bold">New Team Member</h2>
                    <button onClick={onClose} className="focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="fixed top-16 bottom-16 overflow-auto p-4 mx-2">
                {currentPage === 'createTeams1' && <CreateTeams1 onNext={() => setCurrentPage('anotherPage')} />}
                {currentPage === 'anotherPage' && <AnotherPage onBack={() => setCurrentPage('createTeams1')} />}
            </div>
        </>
    );
};

export default CreateTeams;