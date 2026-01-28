import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApplicationView from './ApplicationView';
import { useApplicationById } from '../../../../apiHooks/useApplications';
import Loading from '../../../../Components/Loading';

const ApplicationViewWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { application, isLoading, isError } = useApplicationById(id);

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !application) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Application not found or error loading data.</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <ApplicationView
            application={application}
            onBack={handleBack}
        />
    );
};

export default ApplicationViewWrapper;
