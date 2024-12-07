import React from 'react';
import { NavLink } from "react-router-dom";

import { ReactComponent as IoIosPerson } from '../../../icons/IoIosPerson.svg';
import { ReactComponent as FcBusinessman } from '../../../icons/FcBusinessman.svg';
import { ReactComponent as IoMdLaptop } from '../../../icons/IoMdLaptop.svg';
import { ReactComponent as GoOrganization } from '../../../icons/GoOrganization.svg';
import { ReactComponent as RiTeamFill } from '../../../icons/RiTeamFill.svg';
import { ReactComponent as SiGoogleanalytics } from '../../../icons/SiGoogleanalytics.svg';
import { ReactComponent as BsQuestionCircle } from '../../../icons/BsQuestionCircle.svg';
import { ReactComponent as ImProfile } from '../../../icons/ImProfile.svg';
import { ReactComponent as LuFileSearch } from '../../../icons/LuFileSearch.svg';
import { ReactComponent as LuUser2 } from '../../../icons/LuUser2.svg';
import { ReactComponent as TiContacts } from '../../../icons/TiContacts.svg';
import { ReactComponent as MdOutlineTask } from '../../../icons/MdOutlineTask.svg';
import { ReactComponent as AiOutlineUsergroupAdd } from '../../../icons/AiOutlineUsergroupAdd.svg';

const AppViewMore = ({ isModalOpen, closeModal }) => {

    const apps = [
        { to: "/internalinterview", icon: <FcBusinessman className="text-4xl" />, title: "Internal Interviews", description: "Internal interviews are conducted by internal team members" },
        { to: "/outsourceinterview", icon: <IoMdLaptop className="text-4xl" />, title: "Outsource Interviews", description: "Outsource interviews are conducted by external interviewers." },
        { to: "/mockinterview", icon: <LuFileSearch className="text-4xl" />, title: "Mock Interviews", description: "Practice interviews for skill improvement and confidence building." },
        { to: "/assessment", icon: <LuFileSearch className="text-4xl" />, title: "Assessments", description: "Simplify evaluations with our user-friendly assessment app." },
        { to: "/interview-question", icon: <BsQuestionCircle className="text-4xl" />, title: "Question Bank", description: "Explore questions easily with our Question Bank app." },
        { to: "/candidate", icon: <IoIosPerson className="text-4xl" />, title: "Candidates", description: "Manage candidates easily with our Candidates app." },
        { to: "/position", icon: <GoOrganization className="text-4xl" />, title: "Positions", description: "Organize positions efficiently with the Position app." },
        { to: "/team", icon: <RiTeamFill className="text-4xl" />, title: "Teams", description: "Easily add team members with our Teams app." },
        { to: "/analytics", icon: <SiGoogleanalytics className="text-4xl" />, title: "Analytics", description: "Explore data with our Analytics app." },
        { to: "/masterdata", icon: <AiOutlineUsergroupAdd className="text-4xl" />, title: "Master Data", description: "Centralized business data for accuracy and consistency" },
        { to: "/users", icon: <LuUser2  className="text-4xl" />, title: "Users", description: "view users data and manage users easily, add new users and manage user roles easily" },
        { to: "/contact", icon: <TiContacts  className="text-4xl" />, title: "Contact", description: "Manage contacts easily with our Contact app and add new contacts easily" },
        { to: "/inquirydesk", icon: <TiContacts  className="text-4xl" />, title: "Inquiry Desk", description: "Manage contacts easily with our Contact app and add new contacts easily" },
        { to: "/profilefromapps", icon: <ImProfile className="text-4xl" />, title: "Profile", description: "Manage profile easily with our profile app and add new profile easily" },
        { to: "/roles", icon: <ImProfile className="text-4xl" />, title: "Roles", description: "Manage profile easily with our profile app and add new profile easily" },
        { to: "/all_sharing_settings", icon: <ImProfile className="text-4xl" />, title: "All Sharing Settings", description: "Manage profile easily with our profile app and add new profile easily" },
          { to: "/task", icon: <MdOutlineTask className="text-4xl" />, title: "Task", description: "Manage profile easily with our profile app and add new profile easily" },
      ];

    return (
        <div>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white shadow-lg" style={{ width: "97%", height: "94%" }}>
                    <div className="flex items-center justify-between p-5 rounded-t border-b-2">
                        <h2 className="font-semibold text-xl text-black-500">Tabs</h2>
                        <button onClick={closeModal} className="focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Content */}
                    <div className="p-5 overflow-y-scroll mb-5" style={{ height: "calc(100% - 72px)" }}>
                        <div className="grid grid-cols-3 gap-4">
                            {apps.map((app, index) => (
                                <div key={index} className="p-1 rounded-md shadow-md hover:shadow-lg border flex flex-col">
                                    <NavLink to={app.to} className="flex-grow"> 
                                        <div className="grid grid-cols-5 cursor-pointer gap-1 h-full"> 
                                            <div className="col-span-1 flex items-center justify-center">
                                                {app.icon}
                                            </div>
                                            <div className="col-span-4 flex items-center">
                                                <div>
                                                    <p className="text-sm font-bold">{app.title}</p>
                                                    <p className="text-sm">{app.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default AppViewMore;
