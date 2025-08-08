import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleIndividualLogin = () => {
        navigate("/individual-login", { state: { from: "login" } });
    };

    const handleOrganizationLogin = () => {
        navigate("/organization-login", { state: { from: "login" } });
    };

    return (
        <React.Fragment>
            <div className="min-h-screen bg-custom-bg">
                <div className="sm:pr-6 md:pr-7 lg:pr-7 xl:pr-7 2xl:pr-7">
                    <div className="flex justify-end pt-7 space-x-4">
                        <button
                            onClick={handleIndividualLogin}
                            className="py-2 px-4 text-center bg-custom-blue text-white rounded-md 
                                hover:bg-opacity-90 active:bg-opacity-80 transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-opacity-50
                                text-sm sm:text-base w-32"
                            aria-label="Individual Login"
                        >
                            Individual
                        </button>
                        <button
                            onClick={handleOrganizationLogin}
                            className="py-2 px-4 text-center bg-custom-blue text-white rounded-md 
                                hover:bg-opacity-90 active:bg-opacity-80 transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-opacity-50
                                text-sm sm:text-base w-32"
                            aria-label="Organization Login"
                        >
                            Organization
                        </button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Login;
