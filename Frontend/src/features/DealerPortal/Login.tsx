import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { dealerportalApi } from '../../config/apiRoutes/dealerportalRoutes';

// interface LoginProps {
//     onLogin: () => void;
// }

const Login: React.FC = () => {
    const [emailId, setEmailId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        console.log('Login Submitted:', { emailId, password });

        if (emailId && password) {
            try {

                // let res1 = await dealerportalApi.logout()

                // Make API call to log in
                let res = await dealerportalApi.login({
                    emailId,
                    password
                })

                // const result = await res.json(); // Parse the JSON response

                if (res.status) { // Check if the status indicates success
                    localStorage.setItem('token', res.data.token); // Store the token in local storage
                    toast.success('Login successful'); // Show success notification
                 // Call the onLogin function
                    navigate('/'); // Navigate to the home page
                } else {
                    toast.error(res.err); // Show error notification with the error message
                }
            } catch (error: any) {
                console.error(error); // Log any errors to the console
                toast.error('An error occurred'); // Show a generic error notification
            } finally {
                setLoading(false); // Set loading state to false after the operation
            }
        } else {
            toast.error('Please fill in all fields'); // Show error if fields are empty
            setLoading(false); // Set loading state to false
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const isEdge = () => {
        return /Edge\/\d+/.test(navigator.userAgent);
    };

    return (
        loading ? <Loading /> : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-8 justify-between">
                  
                    <h2 className="text-2xl font-semibold text-center w-full">Login</h2>
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email ID:</label>
                    <input
                        type="email"
                        id="email"
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                        maxLength={24}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="mb-5 relative">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            maxLength={24}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 pr-10"
                            placeholder="Enter your password"
                            required
                        />
                        {!isEdge() && (
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                {showPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />} 
                            </button>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Login 
                </button>
            </form>
        )
    );
};

export default Login;