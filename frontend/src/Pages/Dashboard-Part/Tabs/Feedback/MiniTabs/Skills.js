//<--v1.0.0------Venkatesh------add edit mode skills tab

import React, { useState } from "react";
import { IoIosStar } from "react-icons/io";
import { useCustomContext } from "../../../../../Context/Contextfetch";

const ratingLst = [
  { id: 1, name: "Poor", stars: 2, color: "red" },
  { id: 2, name: "Ok", stars: 3, color: "yellow" },
  { id: 3, name: "Good", stars: 4, color: "orange" },
  { id: 4, name: "Excellent", stars: 5, color: "green" },
];

//<--v1.0.0------
const SkillsTabComponent = ({ skillsTabData, setSkillsTabData, page, tab, isEditMode }) => {
  const { page: currentPage } = useCustomContext();
  //----v1.0.0------>
  const getColorByRating = (rating) => {
    const ratingItem = ratingLst.find((r) => r.stars === rating);
    return ratingItem ? ratingItem.color : "gray";
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
        {skillsTabData.map((skillCat) => (
          <li key={skillCat.id} className="flex flex-col gap-4 ">
            <h2 className="font-bold">{skillCat.category}:</h2>
            <ul className="flex flex-col gap-4" >
              {skillCat.skillsList.map((skill, skillIndex) => (
                <li key={skill.name} className="flex flex-col gap-4" >
                  <div className="flex  items-center " >
                    <p  className='w-[25%]' >  {skill.name}  {(skill.required && tab) && <span className="text-[red]">*</span>}</p>
                    <div className="flex gap-4 justify-between px-3">
                        {Array.from({ length: 5 }, (_, index) => {
                          const isSelected = index + 1 <= skill.rating;
                          return (
                            <IoIosStar
                              onClick={
                                tab
                                  ? () =>
                                      onClickRating(
                                        skillCat.id,
                                        skillIndex,
                                        index + 1
                                      )
                                  : null
                              }
                              className={`cursor-pointer transform transition-transform hover:scale-110 ${isEditMode ? "" : "cursor-not-allowed"}`}
                              size={20}
                              style={{
                                color: isSelected
                                  ? getColorByRating(skill.rating)
                                  : "gray",
                              }}
                              key={index}
                            />
                          );
                        })}
                      </div>
                      {/*<----v1.0.0------*/}
                      {isEditMode ? (
                        <div className={tab ?"visibility-visible" : "visibility-hidden"} style={{visibility:tab? "visible":"hidden"}}>
                          {skill.notesBool ? (
                            <button
                              className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[120px]"
                              onClick={() =>
                                onClickDeleteNote(skillCat.id, skillIndex)
                              }
                            >
                              Delete Note
                            </button>
                          ) : (
                            <button
                              className="p-1 text-[#227a8a] border border-[#227a8a] rounded-md w-[150px]"
                              onClick={() =>
                                onClickAddNote(skillCat.id, skillIndex)
                              }
                            >
                              Add a Note
                            </button>
                          )}
                        </div>
                      ) : <div></div>}
                  </div>
                  {/*----v1.0.0------>*/}
                  {(skill.notesBool && tab ) && (
                    <div className="flex justify-between w-full">
                      <label
                        htmlFor="skill-id"
                        className='w-[25%]'  > Note</label>
                      {currentPage === "Home" ? (
                        <div className=" flex flex-col w-full">
                          <input
                            value={skill.note}
                            onChange={(e) =>
                              onChangeNoteText(
                                skillCat.id,
                                skillIndex,
                                e.target.value.slice(0, 250)
                              )
                            }
                            readOnly={!tab} 
                            id="skill-id"
                            type="text"
                            placeholder="Enter Note"
                            className="w-full  text-gray-500 p-1 rounded-md border border-gray-500"
                          />
                          <span
                            className="text-gray-500 mt-[5px] self-end "
                          >
                            {skill.note?.length || 0}/250
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col w-full">
                          <textarea
                            rows={5}
                            readOnly={!tab} 
                            onChange={(e) =>
                              onChangeNoteText(
                                skillCat.id,
                                skillIndex,
                                e.target.value.slice(0, 250)
                              )
                            }
                            value={skill.note}
                            placeholder="Add note here"
                            className="w-full text-[gray] rounded-md outline-none border-[1px] py-1 px-1 border-[gray]"
                          ></textarea>
                          <span
                            className="text-gray-500 self-end mt-[5px] w-max"
                          >
                            {skill.note?.length || 0}/250
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {(!tab && 
                    skill.note )&& <div className="flex w-full " >
                  <label
                    htmlFor="skill-id"
                    className='w-[25%]'
                  >
                    Note
                  </label>
                  <p className="text-[gray]"  >{skill.note}</p>
                  </div>
                  }
                  {(skill.error && tab) && <p className="text-[red] text-sm">{skill.name} is required</p>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsTabComponent;
