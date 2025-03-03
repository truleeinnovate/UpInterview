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
    <div className="mx-10">
      <h2 className="font-semibold text-xl mb-5 mt-3 underline">
        Assessment Test Page Details:
      </h2>

      <div className="border rounded p-4 mb-8">
        <p className="mb-4">
          The selected candidate's details will be shown on the assessment test
          page.
        </p>

        <div className="mb-4">
          <div className="flex ">
            <label className="font-medium mb-2 w-36">
              Candidate Details: <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 mt-2 ml-8">
              <p className="flex items-center">
                <input type="checkbox" className="mr-2" checked disabled />
                First Name
              </p>
              <p className="flex items-center ml-6">
                <input type="checkbox" className="mr-2" checked disabled />
                Last Name
              </p>
              <p className="flex items-center ml-6">
                <input type="checkbox" className="mr-2" checked disabled />
                Email
              </p>
              <p className="flex items-center ml-6">
                <input type="checkbox" className="mr-2" checked disabled />
                Skills
              </p>
              <p className="flex items-center ml-6">
                <input type="checkbox" className="mr-2" checked disabled />
                Current Experience
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 ml-44">
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
          <p className="flex items-center ml-6">
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

        <div className="mb-4 flex gap-5">
          <label className="font-medium mb-2 w-36">
            Instructions <span className="text-red-500">*</span>
          </label>
          <div className="flex-grow relative">
            <textarea
              className="border focus:outline-none mb-5 p-2 w-full rounded-md text-sm pr-10"
              rows="20"
              value={instructions}
              onChange={handleInstructionsChange}
              onFocus={() => setIsEditing(true)}
              placeholder="Enter instructions here..."
              style={{ whiteSpace: "pre-wrap" }}
            ></textarea>
            {/* <ReactQuill
            className="border focus:outline-none mb-5 p-2 w-full rounded-md text-sm pr-10"
            value={instructions}
            onChange={handleInstructionsChange}
            onFocus={() => setIsEditing(true)}
            placeholder="Enter instructions here..."
              style={{ whiteSpace: "pre-wrap" }}
            /> */}
            <div className="absolute bottom-1 right-1 text-right text-sm">
              {instructions.length}/2000
            </div>
            {isEditing && instructionError && (
              <p className="text-red-500 text-sm">{instructionError}</p>
            )}
          </div>
        </div>

        <div className="flex gap-5 mb-5">
          <label className="font-medium mb-2 w-36">Additional Notes</label>
          <div className="flex-grow">
            <textarea
              className="border p-2 focus:outline-none mb-5 w-full rounded-md"
              rows="3"
              placeholder="Enter additional notes here..."
              value={additionalNotes}
              onChange={handleAdditionalNotesChange}
            ></textarea>
            <p className="text-right text-sm -mt-4">
              {additionalNotes.length}/300
            </p>
          </div>
        </div>
      </div>

      <div className="SaveAndScheduleButtons">
        <div>
          <p
            className="cursor-pointer border border-custom-blue px-4 rounded p-2 mx-7"
            onClick={handleBackToBasicDetails}
          >
            Back
          </p>
        </div>
        <div className="mr-7">
          <button
            type="submit"
            onClick={(e) => handleSave(e, "Details")}
            className="footer-button mr-[10px]"
          >
            Save
          </button>

          <button
            type="submit"
            onClick={(e) => handleSaveAndNext(e, "Details", "Questions")}
            className="footer-button"
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTestDetailsTab;
