import React from 'react'
import { useNavigate } from 'react-router-dom';

const Login_1 = () => {
	const navigate = useNavigate()
	
	const Signup = () => {
		navigate("/profile1", { state: { from: "signup" } });
	};

	const Login = () => {
		navigate("/profile1", { state: { from: "login" } });
	};
	
	return (
		<React.Fragment>
			<div className='container mx-auto'>
				<div className='flex float-end mt-6'>
					<div className='border rounded text-white bg-blue-300 mr-5 p-2 w-32 text-center' onClick={Login}>
						Login
					</div>
					{/* <div className='border rounded text-white  bg-blue-300 mr-5 p-2 w-32 text-center cursor-pointer' onClick={Signup}>
						Sign Up
					</div> */}
				</div>
			</div>
		</React.Fragment>
	)
}

export default Login_1

