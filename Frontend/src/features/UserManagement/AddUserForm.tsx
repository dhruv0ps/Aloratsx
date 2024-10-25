import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa6';
import { userApi } from '../../config/apiRoutes/userApi';
import { User } from '../../config/models/User';

const AddUserForm = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('Associate1');
    const [loading, setLoading] = useState<boolean>(false);
    const [resetPassword, setResetPassword] = useState<{ reset: boolean, password: string }>({ reset: false, password: "" });
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async (userId: string) => {
            setLoading(true)
            try {
                const response = await userApi.getUserById(userId);
                const user: User = response.data;
                setUsername(user.username ?? "");
                setEmail(user.email);
            } catch (error) {
                toast.error("Error fetching user details");
            } finally {
                setLoading(false)
            }
        };

        if (id) {
            fetchUser(id);
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case 'username':
                setUsername(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'role':
                setRole(value);
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(resetPassword, id, !resetPassword.password.trim())
        if (id && resetPassword.reset && !resetPassword.password.trim()) {
            toast.warn("Please enter the updated password.")
            return
        } else if (!id && !resetPassword.password.trim()) {
            toast.warn("Please enter the password to proceed.")
            return
        }
        setLoading(true);
        try {
            if (id) {
                let body = resetPassword ? {
                    username,
                    role,
                    password: resetPassword.password,
                } : {
                    username,
                    role,
                }
                await userApi.updateUser(id, body);
                toast.success("User updated successfully");
            } else {
                await userApi.createUser({ username, email, password: resetPassword.password, role });
                toast.success("New user added successfully");
            }
            navigate("/yellowadmin/users");
        } catch (error: any) {
            toast.error(error.response.data.err);
        } finally {
            setLoading(false);
        }
    };

    return (
        loading ? <Loading /> :
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-12 justify-between">
                    <Button color="gray" onClick={() => navigate(-1)}>
                        <span className="flex gap-2 items-center">
                            <FaChevronLeft /> Back
                        </span>
                    </Button>
                    <h2 className="text-2xl font-semibold">{id ? "Edit User" : "Add User"}</h2>
                    <p></p>
                </div>

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">* Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                </div>

                {!id && (
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">* Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleInputChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">* Role:</label>
                    <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                    >
                        <option value="">Select a role</option>
                        <option value={'Associate1'}>{'Associate 1'}</option>
                        <option value={'Associate2'}>{'Associate 2'}</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700"> Password</label>
                    <TextInput placeholder={`Enter ${id ? "new" : ""} Password`} value={resetPassword.password} onChange={(e) => setResetPassword(prev => ({ ...prev, password: e.target.value }))} />
                </div>
                {id && (
                    <div className="mb-4">
                        <label htmlFor="resetPassword" className="text-sm font-medium text-gray-700">Update Password</label>
                        <label className="flex items-center cursor-pointer">
                            <input onChange={() => setResetPassword({ ...resetPassword, reset: !resetPassword.reset })} type="checkbox" value={Number(resetPassword.reset)} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {id ? "Update User" : "Add User"}
                </button>
            </form>
    );
};

export default AddUserForm;
