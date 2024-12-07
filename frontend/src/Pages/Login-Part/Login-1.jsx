import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login_1 = () => {
	const navigate = useNavigate()
	
	useEffect(() => {
		// Log environment variables and API URL
		console.log('Environment:', process.env.NODE_ENV);
		console.log('API URL:', process.env.REACT_APP_API_URL);
		console.log('All env variables:', process.env);
	}, []);

	const Signup = () => {
		navigate("/profile1", { state: { from: "signup" } });
	};

	const Login = () => {
		
		navigate("/profile1", { state: { from: "login" } });
	};
	
	const [dbStatus, setDbStatus] = useState('');

	useEffect(() => {
		const backendUrl = process.env.NODE_ENV === 'production'
			? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
			: 'http://localhost:4041';

		// Fetch MongoDB connection status
		axios.get(`${backendUrl}/api/db-status`)
			.then(response => {
				setDbStatus(response.data.status);
			})
			.catch(error => {
				console.error('Error fetching DB status', error);
			});
	}, []);

	return (
		<React.Fragment>
			<div className='container mx-auto'>
				<div className='flex float-end mt-6'>
					<div className='border rounded text-white bg-blue-300 mr-5 p-2 w-32 text-center' onClick={Login}>
						Login
					</div>
					<div className='border rounded text-white  bg-blue-300 mr-5 p-2 w-32 text-center cursor-pointer' onClick={Signup}>
						Sign Up
					</div>
				</div>
				<p>{dbStatus}</p>
			</div>
		</React.Fragment>
	)
}

export default Login_1

