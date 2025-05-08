import React from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AssessmentTestDetailsTab = ({
  includePhone,
  includePosition,
  selectedPosition,
  instructions,
  isEditing,
  instructionError,
  additionalNotes,
  handleCheckboxChange,
  handleInstructionsChange,
  handleAdditionalNotesChange,
  handleBackToBasicDetails,
  handleSave,
  handleSaveAndNext,
  setIsEditing,
}) => {
  return (
    <div className="px-12">
      <h2 className="font-semibold text-xl mb-2">
        Assessment Test Page Details:
      </h2>
      <p className="mb-4">
        The selected candidate's details will be shown on the assessment test
        page.
      </p>

      <div className="mb-8">

        <div className="mb-4">
          <div className="flex items-start">
            <label className="font-medium mb-2 w-36">
              Candidate Details: <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 mt-1 ml-8">
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                First Name
              </p>
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                Last Name
              </p>
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                Email
              </p>
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                Skills
              </p>
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                Current Experience
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <label className="font-medium mb-2 w-36"></label>
          <div className="flex gap-4 mt-1 ml-8">
            <p className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                name="includePhone"
                checked={includePhone}
                onChange={handleCheckboxChange}
              />
              Phone
            </p>
            <p className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                name="includePosition"
                checked={includePosition}
                onChange={handleCheckboxChange}
                disabled={!selectedPosition}
              />
              Position
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-start">
          <label className="font-medium mb-2 w-36">
            Instructions <span className="text-red-500">*</span>
          </label>
          <div className="flex-grow relative ml-8">
            <textarea
              className="border focus:outline-none mb-5 p-2 w-full rounded-md text-sm pr-10"
              rows="20"
              value={instructions}
              onChange={handleInstructionsChange}
              placeholder="Enter instructions here..."
              style={{ whiteSpace: "pre-wrap" }}
            ></textarea>
            <div className="absolute bottom-1 right-1 text-right text-sm">
              {instructions.length}/2000
            </div>
            {instructionError && (
              <p className="text-red-500 text-sm">{instructionError}</p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <label className="font-medium mb-2 w-36">Additional Notes</label>
          <div className="flex-grow relative ml-8">
            <textarea
              className="border p-2 focus:outline-none mb-5 w-full rounded-md"
              rows="3"
              placeholder="Enter additional notes here..."
              value={additionalNotes}
              onChange={handleAdditionalNotesChange}
            ></textarea>
            <p className="text-right text-sm -mt-4">
              {additionalNotes?.length}/300
            </p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      {/* <div className="flex justify-between pt-6">
        <button
          onClick={handleBackToBasicDetails}
          className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSave(e, "Details", true)}
            className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={(e) => handleSaveAndNext(e, "Details", "Questions")}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isEditing ? "Update & Next" : "Save & Next"}
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default AssessmentTestDetailsTab;
