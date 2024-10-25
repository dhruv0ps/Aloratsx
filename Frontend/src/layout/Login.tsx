import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiOutlineLoading } from 'react-icons/ai';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useStore } from '../store/useStore';
import logo from "../assets/alora.png"

const Login: React.FC = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { authStore } = useStore();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const onChangeField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {

      await authStore.login(email, password);
      toast.success('User login successful');
      navigate('/');

    } catch (error) {
      // toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-20 mt-10"
          src={logo}
          alt="Your Company"
        />
        {/* <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2> */}
      </div>

      <div className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              onChange={onChangeField}
              autoComplete="email"
              required
              className="block w-full px-2 rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>


        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="relative mt-1">
            <input
              onKeyDown={handleKeyDown}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              onChange={onChangeField}
              className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onMouseDown={togglePasswordVisibility}
              onMouseUp={() => setShowPassword(false)}
              className="absolute inset-y-0 right-0 flex items-center px-3"
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>


        <div>
          <button
            onClick={handleSubmit}
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={loading}
          >
            {loading && <AiOutlineLoading className="animate-spin h-5 w-5 mr-4" />} Sign in
          </button>
        </div>
      </div>
    </div>
  );
});

export default Login;