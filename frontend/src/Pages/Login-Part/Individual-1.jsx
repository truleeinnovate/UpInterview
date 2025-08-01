import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const navigate = useNavigate();

	const handleLogin = () => {
		navigate("/select-user-type", { state: { from: "login" } });
	};

	return (
		<React.Fragment>
			<div className="min-h-screen bg-custom-bg">
				<div className="sm:pr-6 md:pr-7 lg:pr-7 xl:pr-7 2xl:pr-7">
					<div className="flex justify-end pt-7">
						<button
							onClick={handleLogin}
							className="py-2 text-center bg-custom-blue text-white rounded-md 
                                 hover:bg-opacity-90 active:bg-opacity-80 transition-colors duration-200
                                 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-opacity-50
                                 text-sm sm:text-base w-28"
							aria-label="Login"
						>
							Login
						</button>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default Login;