import React, { useState } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
// import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";

const Sidebar = () => {
    const organization = Cookies.get("organization") === 'true';
    const { pathname } = useLocation();
    const [showBillingDetails, setShowBillingDetails] = useState(false);

    return (
        <aside id="default-sidebar" className="fixed top-12 left-0 w-64 h-screen" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto border-r border-gray-100">
                <ul className="space-y-2 font-medium">
                    <li>
                        <p>
                            <span className="ms-3 font-bold text-lg">Account Setting</span>
                        </p>
                    </li>
                    <li>
                        <NavLink to={organization ? "/user_details" : "/profile"} className={`flex items-center p-2 rounded-lg group ${pathname === (organization ? '/user_details' : '/profile') ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">{organization ? "User Details" : "Profile"}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={organization ? "/company_info" : "/availability"} className={`flex items-center p-2 rounded-lg group ${pathname === (organization ? '/company_info' : '/availability') ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">{organization ? "Company Info" : "Availability"}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sharing_settings" className={`flex items-center p-2 rounded-lg group ${pathname === '/sharing_settings' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Sharing Settings</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sharing_rules" className={`flex items-center p-2 rounded-lg group ${pathname === '/sharing_rules' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Sharing Rules</span>
                        </NavLink>
                    </li>
                    {/* Billing Details with Dropdown */}
                    <li>
                        <div
                            className="flex items-center justify-between p-2 rounded-lg group cursor-pointer"
                            onClick={() => setShowBillingDetails((prev) => !prev)}
                        >
                            <span className="flex-1 ms-3 whitespace-nowrap">Billing Details</span>
                            <span>
                                {/* {showBillingDetails ? <MdKeyboardArrowUp className="text-2xl" /> : <MdKeyboardArrowDown className="text-2xl" />} */}
                            </span>
                        </div>
                        {showBillingDetails && (
                            <div className="pl-6 mt-2">
                                <NavLink
                                    to="/SubscriptionDetails"
                                    className={`flex items-center p-2 rounded-lg group ${pathname === '/SubscriptionDetails' ? 'bg-gray-300' : 'text-gray-900'}`}
                                >
                                    <span className="flex-1 ms-3 whitespace-nowrap">Subscription</span>
                                </NavLink>
                                <NavLink
                                    to="/paymentHistory"
                                    className={`flex items-center p-2 rounded-lg group ${pathname === '/paymentHistory' ? 'bg-gray-300' : 'text-gray-900'}`}
                                >
                                    <span className="flex-1 ms-3 whitespace-nowrap">Payment History</span>
                                </NavLink>
                                <NavLink
                                    to="/Paymentmethods"
                                    className={`flex items-center p-2 rounded-lg group ${pathname === '/Paymentmethods' ? 'bg-gray-300' : 'text-gray-900'}`}
                                >
                                    <span className="flex-1 ms-3 whitespace-nowrap">Payment Methods</span>
                                </NavLink>
                            </div>
                        )}
                    </li>
                    <li>
                        <NavLink to="/emailSettings" className={`flex items-center p-2 rounded-lg group ${pathname === '/emailSettings' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Email</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/invoice" className={`flex items-center p-2 rounded-lg group ${pathname === '/invoice' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Invoice</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/notifications" className={`flex items-center p-2 rounded-lg group ${pathname === '/notifications' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Notifications</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/privacysecurity" className={`flex items-center p-2 rounded-lg group ${pathname === '/privacysecurity' ? ' bg-gray-200' : 'text-gray-900'}`}>
                            <span className="flex-1 ms-3 whitespace-nowrap">Privacy & Security</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;

