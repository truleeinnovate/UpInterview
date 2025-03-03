import React from "react";
import { IoIosStar } from "react-icons/io";
import { useCustomContext } from "../../../../../../Context/Contextfetch";

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

const OverallImpressions = ({ overallImpressionTabData,setOverallImpressionTabData,tab }) => {
  const { page} = useCustomContext();
  const { rating, note, recommendation, notesBool } =
    overallImpressionTabData;

  const getColorByRating = (rating) =>
    ratingLst.find((r) => r.stars === rating)?.color || "gray";

  const handleInputChange = (field, value) => {
    console.log(`Field: ${field}, Value: ${value}`);
    setOverallImpressionTabData((prev) => ({
      ...prev,
        [field]: value,
    
    }));
  };
  

  const handleNoteToggle = () => handleInputChange("notesBool", !overallImpressionTabData.notesBool);

  return (
    <div className="flex flex-col gap-8 ">
      {tab && (
        <ul className="flex gap-8">
          {ratingLst.map(({ id, name, stars, color }) => (
            <li
              key={id}
              className={`text-${color} flex flex-col items-center cursor-pointer gap-3`}
            >
              <div className="flex">
                {Array.from({ length: stars }, (_, idx) => (
                  <IoIosStar key={idx} style={{ color }} className="text-2xl" />
                ))}
              </div>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      )}

      <div className={`${page==="Home"?"w-[50%] justify-between":"w-[100%]"} flex justify-between items-center`}>
        <p className={` ${page === "Home" ? "w-[250px]" : "w-[25%]"}`}>
          Overall Rating{tab && <span className="text-red-500">*</span>}
        </p>
        <div className="flex gap-3">
            {Array.from({ length: 5 }, (_, index) => {
              const isSelected = index + 1 <= rating;
              return (
                <IoIosStar
                  key={index}
                  onClick={
                    tab ? () => handleInputChange("rating", index + 1) : null
                  }
                  className="cursor-pointer transform transition-transform hover:scale-110"
                  size={20}
                  style={{
                    color: isSelected ? getColorByRating(rating) : "gray",
                  }}
                />
              );
            })}
          </div>
          
            <button
              onClick={handleNoteToggle}
              className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[120px]"
              style={{visibility:tab?"visible":"hidden" }}
            >
              {notesBool ? "Delete Note" : "Add Note"}
            </button>
          

       
      </div>

      {notesBool && tab && (
        <div className="flex justify-between">
          <label
            htmlFor="overall-note"
            className={` ${page === "Home" ? "w-[360px]" : "w-[450px] "}`}
          >
            Note
          </label>
          {page === "Home" ? (
            <div
              className="flex flex-col  items-center"
              style={{ width: page === "Home" && "80%" }}
            >
              <input
                id="overall-note"
                type="text"
                value={note}
                readOnly={!tab}
                onChange={(e) =>
                  handleInputChange("note", e.target.value.slice(0, 250))
                }
                className="w-[100%]  rounded-md text-[gray]  p-2 outline-none border border-gray-500"
                placeholder="Add Note"
              />
              <span className="text-gray-500 self-end">
                {note?.length || 0}/250
              </span>
            </div>
          ) : (
            <div className="flex flex-col w-full justify-end  flex-grow-1">
              <textarea
                rows={5}
                value={note}
                readOnly={!tab}
                onChange={(e) =>
                  handleInputChange("note", e.target.value.slice(0, 250))
                }
                className="w-full text-gray rounded-md outline-none border-[1px] py-1 px-1 text-[gray] border-[gray]"
                placeholder="Add note here"
              ></textarea>
              <span className="text-gray-500 self-end mt-[5px] w-max">
                {note?.length || 0}/250
              </span>
            </div>
          )}
        </div>
      )}

      {(!tab && note) && (
        <div className="flex w-full ">
          <label
            htmlFor="skill-id"
            className={` ${page === "Home" ? "w-[345px]" : "w-[40%]"}`}
          >
            Note
          </label>
          <p className="text-[gray]">{note}</p>
        </div>
      )}

      <div className="flex">
        <label
          className={` ${
            page === "Home" ? "w-[340px]" : "w-[265px]"
          } `}
        >
          Recommendation{ tab && <span className="text-[red]">*</span>}
        </label>
        <ul className="flex w-1/2 gap-8">
          {options.map(({ value, label }) => (
            <li key={value} className="flex gap-x-2 items-center">
              <input
                id={`${value}-id`}
                name="recommendation"
                type="radio"
                value={value}
                disabled={!tab && recommendation !== value}
                checked={recommendation === value}
                onChange={(e) =>
                  handleInputChange("recommendation", e.target.value)
                }
                className={
                  !tab && recommendation !== value
                    ? "text-gray-400"
                    : "text-black"
                }
              />
              <label
                htmlFor={`${value}-id`}
                className={
                  !tab && recommendation !== value
                    ? "text-gray-400"
                    : "text-black"
                }
              >
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverallImpressions;
