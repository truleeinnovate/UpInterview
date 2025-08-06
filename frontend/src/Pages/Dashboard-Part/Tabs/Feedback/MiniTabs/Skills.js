//<--v1.0.0------Venkatesh------add edit mode skills tab

import React, { useState } from "react";
import { IoIosStar } from "react-icons/io";
import { useLocation } from 'react-router-dom';

//<--v1.0.0------
const SkillsTabComponent = ({ skillsTabData, setSkillsTabData, page, tab, isEditMode }) => {
  const location = useLocation();
  const feedback = location.state?.feedback || {};
  const skillsData = feedback.skills || [];

  const ratingLst = [
    { id: 1, name: "Poor", stars: 2, color: "red" },
    { id: 2, name: "Ok", stars: 3, color: "yellow" },
    { id: 3, name: "Good", stars: 4, color: "orange" },
    { id: 4, name: "Excellent", stars: 5, color: "green" },
  ];
  //----v1.0.0------>
  // const getColorByRating = (rating) => {
  //   const ratingItem = ratingLst.find((r) => r.stars === rating);
  //   return ratingItem ? ratingItem.color : "gray";
  // };
  const getColorByRating = (rating) => {
    const item = ratingLst.find((r) => r.stars === rating);
    if (!item) {
      if (rating === 1) return "red"; // Fallback for rating 1
      return "gray"; // Default fallback
    }
    return item.color;
  };
  const onClickRating = (catId, skillIndex, rating) => {
    if(isEditMode){//<-----v1.0.0
    setSkillsTabData((prev) => {
      const updatedData = prev.map(category=>
        category.id===catId ? {
                ...category,
          skillsList:category.skillsList.map((skill,index)=>
          index===skillIndex?{...skill,rating,error: (skill.required && rating<=1)?true:false}:skill
        )
        }:category
        )

    
      return updatedData;
    });
    }
  };
  

  const onChangeNoteText = (catId, skillIndex, value) => {
    if(isEditMode){//<-----v1.0.0
    setSkillsTabData((prev) => (
      prev.map(category=>
        category.id===catId ? {
                ...category,
                  skillsList: category.skillsList.map((skill, index) =>
                    index === skillIndex ? { ...skill, note: value } : skill
                ),
        }:category
        )
    ));
    }
  };

  const onClickAddNote = (catId, skillIndex) => {
    if(isEditMode){//<-----v1.0.0
      setSkillsTabData(prev=>
        prev.map(category=>
          category.id===catId?{
                  ...category,
                skillsList: category.skillsList.map((skill, index) =>
                  index === skillIndex ? { ...skill, notesBool: true } : skill
                  ),
          }:category
          )
      )
    }

    
  };

  const onClickDeleteNote = (catId, skillIndex) => {
    if(isEditMode){//<-----v1.0.0
    console.log("delte note is clicked");
    setSkillsTabData(prev=>
      prev.map(category=>
        category.id===catId? {
                ...category,
              skillsList: category.skillsList.map((skill, index) =>
                index === skillIndex
                  ? { ...skill, notesBool: false, note: "" }
                  : skill
              ),
        }:category
      )
    )
    }
    
  };

  

  return (
    <div className="px-2 pt-2">
      {tab && (
        <ul className="stars-container flex gap-8 flex-wrap md:justify-start">
          {ratingLst.map((rating) => (
            <li
              key={rating.id}
              className={`text-${rating.color} flex flex-col items-center cursor-pointer gap-3`}
            >
              <div className="flex">
                {Array.from({ length: rating.stars }, (_, index) => (
                  <IoIosStar
                    key={index}
                    style={{ color: rating.color }}
                    className="text-2xl"
                  />
                ))}
              </div>
              <p>{rating.name}</p>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-8 flex flex-col gap-4 w-[full]">
        {(skillsData || []).map((skill) => (
          <li key={skill._id} className="flex flex-col gap-4 ">
            <h2 className="font-bold">{skill.skillType}:</h2>
            <div className="flex items-center">
              <p className='w-[25%]' >{skill.skillName}</p>
              <div className="flex gap-3">
             {[1, 2, 3, 4, 5].map((star) => {
            const color = star <= skill.rating ? getColorByRating(skill.rating) : "gray";
            return (
              <button
                key={star}
                className={`text-2xl ${isEditMode ? "" : "cursor-not-allowed"}`}
                style={{ color: color }}
                onClick={() => onClickRating(skill._id,star,skill.rating)}
                disabled={!isEditMode}
              >
                ★
              </button>
            );
          })}
        </div>
              {isEditMode ? (
                <div className={tab ? "visibility-visible" : "visibility-hidden"} style={{visibility: tab ? "visible" : "hidden"}}>
                  {skill.notesBool ? (
                    <button
                      className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[120px]"
                      onClick={() => onClickDeleteNote(skill._id)}
                    >
                      Delete Note
                    </button>
                  ) : (
                    <button
                      className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[150px]"
                      onClick={() => onClickAddNote(skill._id)}
                    >
                      Add a Note
                    </button>
                  )}
                </div>
              ) : <div></div>}
            </div>
            <div className="flex justify-between w-full">
              <label htmlFor="skill-id" className='w-[25%]' >Note</label>
              {isEditMode ? (
                        <div className=" flex flex-col w-full">
                          <input
                            value={skill.note}
                            onChange={(e) =>
                              onChangeNoteText(
                                skill._id,
                                // skillIndex,
                                e.target.value.slice(0, 250)
                              )
                            }
                            readOnly={!tab} 
                            id="skill-id"
                            type="text"
                            placeholder="Enter Note"
                            className={`${isEditMode ? "w-full  text-gray-500 p-1 rounded-md border border-gray-500" : "outline-none"}`}
                          />
                          {isEditMode && <span
                            className="text-gray-500 mt-[5px] self-end "
                          >
                            {skill.note?.length || 0}/250
                          </span>
                          }
                </div>
              ) : (
                <div className=" flex flex-col w-full text-gray-500 break-words">
                <p>{skill.note}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsTabComponent;
