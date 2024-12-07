import React, { useState, useRef } from 'react'
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GiCancel } from "react-icons/gi";
import { IoIosCopy } from "react-icons/io";

const ComponentFour = ({ onBack, onClose }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };
    const [daysOfWeek, setDaysOfWeek] = useState([
        { name: "Sun", showTimeInputs: true },
        { name: "Mon", showTimeInputs: true },
        { name: "Tue", showTimeInputs: true },
        { name: "Wed", showTimeInputs: true },
        { name: "Thu", showTimeInputs: true },
        { name: "Fri", showTimeInputs: true },
        { name: "Sat", showTimeInputs: true },
    ]);
    const [counts, setCounts] = useState(Array(daysOfWeek.length).fill(0));
    const incrementCount = (dayIndex) => {
        setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[dayIndex] += 1;

            if (!daysOfWeek[dayIndex].showTimeInputs) {
                setDaysOfWeek(prevDays => {
                    const updatedDays = [...prevDays];
                    updatedDays[dayIndex].showTimeInputs = true;
                    return updatedDays;
                });
            }
            return newCounts;
        });
    };

    const renderTimeInputs = (dayIndex) => {
        const times = [];
        for (let i = 0; i < counts[dayIndex]; i++) {
            times.push(
                <div key={i} className="flex gap-10 mb-2">
                    <div className="max-w-sm w-20">
                        <div className=""></div>
                    </div>
                    <div className="max-w-sm w-32">
                        <div className="rounded-md border-2 border-gray-600 bg-white flex flex-col justify-between leading-none">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <TimePicker
                                        placeholder="Start Time"
                                        type="start"
                                        dayIndex={dayIndex}
                                        timeIndex={i}
                                        startTime={selectedDayTimes.start}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span>
                            <FaMinus className="text-2xl" />
                        </span>
                    </div>
                    <div className="max-w-sm w-32">
                        <div className="rounded-md border-2 border-gray-600 bg-white flex flex-col justify-between leading-none">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <TimePicker
                                        placeholder="End Time"
                                        type="end"
                                        dayIndex={dayIndex}
                                        timeIndex={i}
                                        endTime={selectedDayTimes.end}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className='flex text-2xl space-x-1'>
                            <GiCancel onClick={() => deleteTime(dayIndex, i)} />
                        </span>
                    </div>
                </div>
            );
        }
        return times;
    };

    const deleteTime = (dayIndex, timeIndex) => {
        setCounts(prevCounts => {
            const newCounts = [...prevCounts];
            newCounts[dayIndex]--;
            return newCounts;
        });
    };

    const [selectedDayTimes] = useState({ start: "", end: "" });

    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [interviewDropdown, setInterviewDropdown] = useState(Array(7).fill(false));
    const interviewRef = useRef(null);

    const toggleTimeInputs = (dayIndex) => {
        setDaysOfWeek(prevDays => prevDays.map((day, index) => {
            if (index === dayIndex) {
                return { ...day, showTimeInputs: !day.showTimeInputs };
            }
            return day;
        }));
    };

    const openInterviewDropdown = (dayIndex) => {
        setSelectedDayIndex(dayIndex);
        setInterviewDropdown(prevState => {
            const updatedState = [...prevState];
            updatedState[dayIndex] = true;
            return updatedState;
        });
    };

    const handleDuplicateClick = () => {
        const updatedDaysOfWeek = daysOfWeek.map((day, index) => {
            if (index === 0) {
                return { ...day, disabled: true };
            }
            return day;
        });
        setDaysOfWeek(updatedDaysOfWeek);
        setInterviewDropdown(Array(7).fill(false));
    };

    return (
        <>
            <div>
                <div className='mt-5'>
                    <div>
                        <div className='text-sm mt-6 flex justify-center'>
                            <div>
                                <div className="text-xl mb-7">
                                    <h2>
                                        Availability &nbsp; <span className="text-red-500 -ml-3">*</span>
                                    </h2>
                                </div>
                                {daysOfWeek.map((day, dayIndex, i) => (
                                    <div key={dayIndex} className="mb-6">
                                        <div className='flex gap-10 mb-4 text-xs' ref={interviewRef}>
                                            <div className="max-w-sm w-20">
                                                <div className="rounded-md border-2 border-gray-600 bg-white p-3 flex flex-col justify-between leading-none">
                                                    <div className="flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className="text-gray-900 leading-none">{day.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {day.showTimeInputs ? (
                                                <>
                                                    <div className="max-w-sm w-32">
                                                        <div className="rounded-md border-2 border-gray-600 bg-white flex flex-col justify-between leading-none">
                                                            <div className="flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <TimePicker
                                                                        placeholder="Start Time"
                                                                        type="start"
                                                                        dayIndex={dayIndex}
                                                                        timeIndex={i}
                                                                        startTime={selectedDayTimes.start}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='-mx-3'>
                                                        <span>
                                                            <FaMinus className='text-2xl' />
                                                        </span>
                                                    </div>
                                                    <div className="max-w-sm w-32">
                                                        <div className="rounded-md border-2 border-gray-600 bg-white flex flex-col justify-between leading-none">
                                                            <div className="flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <TimePicker
                                                                        placeholder="End Time"
                                                                        type="end"
                                                                        dayIndex={dayIndex}
                                                                        timeIndex={i}
                                                                        endTime={selectedDayTimes.end}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="max-w-sm" style={{ width: "361px" }}>
                                                    <div className="rounded-md bg-slate-50 flex flex-col justify-center leading-none">
                                                        <div className="flex items-center justify-center p-3">
                                                            <div className="text-center">
                                                                <p className="text-gray-500">Unavailable</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className='ml-3'>
                                                <span className='flex text-2xl space-x-3'>
                                                    <GiCancel onClick={() => toggleTimeInputs(dayIndex)} />
                                                    <FaPlus onClick={() => incrementCount(dayIndex)} />
                                                    <IoIosCopy onClick={() => openInterviewDropdown(dayIndex)} />
                                                </span>
                                                {interviewDropdown[dayIndex] && selectedDayIndex === dayIndex && (
                                                    <div className="absolute mt-2 z-10 w-60 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 -ml-52 border">
                                                        <div className="space-y-1">
                                                            <p className='text-slate-500 text-xl'>Duplicate Time Entries</p>
                                                            <ul className='p-1'>
                                                                {daysOfWeek.map((day, index) => (
                                                                    <li key={index} className="flex justify-between items-center">
                                                                        <span>{day.name}</span>
                                                                        {index === 0 ? (
                                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" disabled={day.disabled} checked={day.disabled} />
                                                                        ) : (
                                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" />
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <div className='flex justify-center'>
                                                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleDuplicateClick}>
                                                                    Duplicate
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {renderTimeInputs(dayIndex)}
                                    </div>
                                ))}

                            </div>
                        </div>
                        <div className='bg-gray-50 border border-gray-500 text-gray-900 text-sm p-4 rounded-lg mt-5'>
                            <p>Preferred Interview Duration</p>
                            <ul className="flex mt-3">
                                <li
                                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-5 border rounded-lg mr-10 ${selectedOption === '30' ? 'bg-gray-700 text-white' : 'bg-gray-300'
                                        }`}
                                    onClick={() => handleOptionClick('30')}
                                >
                                    30 mints
                                </li>
                                <li
                                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-5 border rounded-lg mr-10 ${selectedOption === '60' ? 'bg-gray-700 text-white' : 'bg-gray-300'
                                        }`}
                                    onClick={() => handleOptionClick('60')}
                                >
                                    1 Hour
                                </li>
                                <li
                                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-5 border rounded-lg mr-10 ${selectedOption === '90' ? 'bg-gray-700 text-white' : 'bg-gray-300'
                                        }`}
                                    onClick={() => handleOptionClick('90')}
                                >
                                    1:30 mints
                                </li>
                                <li
                                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-5 border rounded-lg mr-10 ${selectedOption === '120' ? 'bg-gray-700 text-white' : 'bg-gray-300'
                                        }`}
                                    onClick={() => handleOptionClick('120')}
                                >
                                    2 Hour
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer-buttons flex justify-end">
                    <button onClick={onBack}
                        className="footer-button" >
                        Back
                    </button>
                    <button
                        className="footer-button">
                        Save
                    </button>
                </div>
            </div>

        </>
    )
}

const TimePicker = ({ placeholder, type, dayIndex, timeIndex, startTime, endTime }) => {
    const [selectedTime, setSelectedTime] = useState(null);

    const handleTimeChange = (time) => {
        const formattedTime = time.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        let storageKey = '';
        switch (dayIndex) {
            case 0:
                storageKey = 'mondayTimes';
                break;
            case 1:
                storageKey = 'tuesdayTimes';
                break;
            default:
                storageKey = 'defaultTimes';
        }
        let storedTimes = JSON.parse(localStorage.getItem(storageKey)) || {};
        storedTimes[timeIndex] = storedTimes[timeIndex] || {};
        if (type === 'start') {
            storedTimes[timeIndex].start = formattedTime;
        } else {
            storedTimes[timeIndex].end = formattedTime;
        }
        localStorage.setItem(storageKey, JSON.stringify(storedTimes));
        setSelectedTime(time);
    };

    return (
        <div className="mx-auto">
            <div className="relative rounded-md shadow-sm w-full">
                <DatePicker
                    selected={selectedTime}
                    onChange={handleTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    placeholderText={placeholder}
                    dateFormat="h:mm aa"
                    className="flex justify-center w-full pl-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    style={{ width: 'calc(100% - 2.5rem)', color: '#000000' }}
                />
            </div>
        </div>
    );
};


export default ComponentFour