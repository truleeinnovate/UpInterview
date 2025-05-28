import React from 'react'
import { useNavigate } from 'react-router-dom';

const Login_1 = () => {
	console.log('landing page')
	const navigate = useNavigate()

	const Login = () => {
		navigate("/select-user-type", { state: { from: "login" } });
	};
	
	return (
		<React.Fragment>
			<div className='container mx-auto mt-12'>
				<div className='flex float-end'>
					<div className='border rounded text-white bg-custom-blue mr-12 p-2 w-32 text-center cursor-pointer' onClick={Login}>
						Login
					</div>
				</div>
			</div>
		</React.Fragment>
	)
}

export default Login_1

