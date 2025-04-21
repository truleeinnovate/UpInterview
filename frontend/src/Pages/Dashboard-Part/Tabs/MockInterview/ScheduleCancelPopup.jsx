import { useState } from "react";

const ScheduleCancelPopup = ({ onClose }) => {
    const handlePopupConfirm = async (e, _id) => {
        e.preventDefault();
        try {

        } catch (error) {
            console.error(
                "Error updating interview status or posting notification:",
                error
            );
        }
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white p-5 rounded shadow-lg">
                <p>Are You sure u want to cancel this Schedule
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={handlePopupConfirm}

                        className="bg-custom-blue text-white px-4 py-1 rounded"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-custom-blue px-4 py-1 rounded"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ScheduleCancelPopup