import React, { useState, useEffect } from 'react';
import { User } from '../../config/models/User';
import { Table, Button, Modal } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../util/Loading';
import { FaChevronLeft } from 'react-icons/fa6';
import { userApi } from '../../config/apiRoutes/userApi';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await userApi.getAllUsers();
                if (response.status) setUsers(response.data);
            } catch (error) {
                console.log(error, loading);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // const handleViewClick = (user: User) => {
    //     setSelectedUser(user);

    // };

    return (
        loading ? <Loading /> : (
            <div className="container mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <Button className='' color={'gray'} onClick={() => navigate(-1)}>
                        <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                    </Button>
                    <h2 className="text-2xl font-semibold">User List</h2>
                    <p></p>
                </div>
                <div className='overflow-x-auto'>
                    <Table striped hoverable>
                        <Table.Head>
                            <Table.HeadCell>Username</Table.HeadCell>
                            <Table.HeadCell>Email</Table.HeadCell>
                            <Table.HeadCell>Role</Table.HeadCell>
                            <Table.HeadCell className='text-center'>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {users.map((user) => (
                                <Table.Row key={user._id}>
                                    <Table.Cell>{user.username}</Table.Cell>
                                    <Table.Cell>{user.email}</Table.Cell>
                                    <Table.Cell>{user.role}</Table.Cell>
                                    <Table.Cell className='flex justify-center'>
                                        {/* <Button className='mr-3' color="gray" onClick={() => handleViewClick(user)}>
                                            View
                                        </Button> */}
                                        <Button color="blue" onClick={() => navigate(`/yellowadmin/users/${user._id}/edit`)}>
                                            Edit
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>

                {selectedUser && (
                    <Modal show={true} onClose={() => setSelectedUser(null)}>
                        <Modal.Header>
                            {selectedUser.username}
                        </Modal.Header>
                        <Modal.Body>


                        </Modal.Body>
                    </Modal>
                )}
            </div>
        )
    );
};

export default UserList;
