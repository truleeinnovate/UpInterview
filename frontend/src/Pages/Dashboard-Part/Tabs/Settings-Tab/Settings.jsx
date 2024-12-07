import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const Sidebar = () => {
    const organization = Cookies.get("organization") === 'true';
    const { pathname } = useLocation();


    return (
        <aside id="default-sidebar" className="fixed top-20 left-0 w-64 h-screen" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto border border-gray-100">
                <ul className="space-y-2 font-medium">
                    <li>
                        <p>
                            <span className="ms-3 font-bold text-lg">Account Setting</span>
                        </p>
                    </li>
                    <li>
                        <NavLink to={organization ? "/user_details" : "/profile"} className={`flex items-center p-2 rounded-lg group ${pathname === (organization ? '/user_details' : '/profile') ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">{organization ? "User Details" : "Profile"}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={organization ? "/company_info" : "/availability"} className={`flex items-center p-2 rounded-lg group ${pathname === (organization ? '/company_info' : '/availability') ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">{organization ? "Company Info" : "Availability"}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sharing_settings" className={`flex items-center p-2 rounded-lg group ${pathname === '/sharing_settings' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Sharing Settings</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sharing_rules" className={`flex items-center p-2 rounded-lg group ${pathname === '/sharing_rules' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Sharing Rules</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/billing_details" className={`flex items-center p-2 rounded-lg group ${pathname === '/billing_details' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Billing Details</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/invoice" className={`flex items-center p-2 rounded-lg group ${pathname === '/invoice' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Invoice</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/notifications" className={`flex items-center p-2 rounded-lg group ${pathname === '/notifications' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Notifications</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/privacysecurity" className={`flex items-center p-2 rounded-lg group ${pathname === '/privacysecurity' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Privacy & Security</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;