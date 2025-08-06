//<--v1.0.0------Venkatesh------add edit mode overall impressions tab

import React from "react";
import { IoIosStar } from "react-icons/io";
import { useCustomContext } from "../../../../../Context/Contextfetch";

const ratingLst = [
  { id: 1, name: "Poor", stars: 2, color: "red" },
  { id: 2, name: "Ok", stars: 3, color: "yellow" },
  { id: 3, name: "Good", stars: 4, color: "orange" },
  { id: 4, name: "Excellent", stars: 5, color: "green" },
];

const options = [
  { value: "hire", label: "Hire" },
  { value: "no-hire", label: "No-Hire" },
  { value: "Maybe", label: "Maybe" },
];

//<--v1.0.0------
const OverallImpressions = ({ tab, isEditMode }) => {
  const { overallImpressionTabData, setOverallImpressionTabData } = useCustomContext();
  const { page } = useCustomContext();

  // Add default values to prevent destructuring errors
  const { rating = 0, note = '', recommendation = '', notesBool = false } = overallImpressionTabData || {};

  const getColorByRating = (rating) => {
    const item = ratingLst.find((r) => r.stars === rating);
    if (!item) {
      if (rating === 1) return "red"; // Fallback for rating 1
      return "gray"; // Default fallback
    }
    return item.color;
  };

 //<--v1.0.0------
  const handleRatingChange = (newRating) => {
    if (isEditMode) {
      setOverallImpressionTabData((prevData) => ({
        ...prevData,
        rating: newRating,
      }));
    }
  };

  const handleNoteToggle = () => {
    if (isEditMode) {
      setOverallImpressionTabData((prevData) => ({
        ...prevData,
        notesBool: !prevData.notesBool,
      }));
    }
  };

  const handleNoteChange = (e) => {
    if (isEditMode) {
      const value = e.target.value;
      setOverallImpressionTabData((prevData) => ({
        ...prevData,
        note: value,
      }));
    }
  };

  const handleRecommendationChange = (recommendation) => {
    if (isEditMode) {
      setOverallImpressionTabData((prevData) => ({
        ...prevData,
        recommendation: recommendation,
      }));
    }
  };
  //--v1.0.0------>

  return (
    <div className="flex flex-col gap-8 px-2 pt-2">
      {tab && (
        <ul className="flex gap-8">
          {ratingLst.map(({ id, name, stars, color }) => (
            <li
              key={id}
              className="flex flex-col items-center cursor-pointer gap-3"
              style={{ color: color }}
            >
              <div className="flex">
                {Array.from({ length: stars }, (_, idx) => (
                  <IoIosStar key={idx} className="text-2xl" />
                ))}
              </div>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="w-[75%] flex justify-between items-center gap-4">
        {/*<----v1.0.0------*/}
        <p className="">Overall Rating{tab && <span className="text-red-500">*</span>}</p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const color = star <= rating ? getColorByRating(rating) : "gray";
            return (
              <button
                key={star}
                className={`text-2xl ${isEditMode ? "" : "cursor-not-allowed"}`}
                style={{ color: color }}
                onClick={() => handleRatingChange(star)}
                disabled={!isEditMode}
              >
                ★
              </button>
            );
          })}
        </div>
        {isEditMode ? (
          <button
            onClick={handleNoteToggle}
            className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[200px]"
            style={{ visibility: tab ? "visible" : "hidden" }}
          >
            {notesBool ? "Delete Note" : "Add Note"}
          </button>
        ) : <div></div>}
      </div>

      {notesBool && tab && (
        <div className="flex justify-between">
          <label
            htmlFor="overall-note"
            className="w-[30%]"
          >
            Note
          </label>
          <div
            className="flex flex-col  items-center"
            style={{ width: "70%" }}
          >
            <input
              id="overall-note"
              type="text"
              value={note}
              readOnly={!isEditMode}
              onChange={(e) =>
                handleNoteChange(e)
              }
              className={isEditMode ? "w-[100%]  rounded-md text-[gray]  p-2 outline-none border border-gray-500" : "outline-none"}
              placeholder="Add Note"
            />
            {isEditMode && <span className="text-gray-500 self-end">
              {note?.length || 0}/250
            </span>}
          </div>
        </div>
      )}

      {(!tab && note) && (
        <div className="flex w-full ">
          <label
            htmlFor="skill-id"
            className=""
          >
            Note
          </label>
          <p className="text-[gray]">{note}</p>
        </div>
      )}

      <div className="flex gap-7">
        <label className="">Recommendation{tab && <span className="text-[red]">*</span>}</label>
        {isEditMode ? (
          <div className="flex gap-4 w-full">
            {["hire", "hold", "reject"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`recommendation-${option}`}
                  name="recommendation"
                  checked={recommendation === option}
                  onChange={() => handleRecommendationChange(option)}
                />
                <label htmlFor={`recommendation-${option}`} className="cursor-pointer">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex pl-28 items-center">
            <span className="font-medium">{recommendation.charAt(0).toUpperCase() + recommendation.slice(1)}</span>
          </div>
        )}
        {/*----v1.0.0------>*/}
      </div>
    </div>
  );
};

export default OverallImpressions;
