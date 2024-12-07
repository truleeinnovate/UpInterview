import React from 'react'
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const { pathname } = useLocation();

    return (
        <aside id="default-sidebar" className="fixed top-20 left-0 w-64 h-screen" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto border border-gray-100">
                <ul className="space-y-2 font-medium">
                    <li>
                        <p>
                            <span className="ms-3 font-bold text-lg">App Settings</span>
                        </p>
                    </li>
                    <li>
                        <NavLink to="/connected_apps" className={`flex items-center p-2 rounded-lg group ${pathname === '/connected_apps' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Connected Apps</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/access_token" className={`flex items-center p-2 rounded-lg group ${pathname === '/access_token' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">Access Token</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/auth_token" className={`flex items-center p-2 rounded-lg group ${pathname === '/auth_token' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">OAuth Token</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/apis" className={`flex items-center p-2 rounded-lg group ${pathname === '/apis' ? ' bg-gray-200' : 'text-gray-900'}`} >
                            <span className="flex-1 ms-3 whitespace-nowrap">APIs</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;