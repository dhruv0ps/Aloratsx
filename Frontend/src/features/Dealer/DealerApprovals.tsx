import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner } from 'flowbite-react';
import { Dealer } from '../../config/models/dealer';
import { dealerApis } from '../../config/apiRoutes/dealerRoutes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChevronLeft } from 'react-icons/fa6';
import showConfirmationModal from '../../util/confirmationUtil';

const DealersApprovalList: React.FC = () => {
    const [dealersData, setDealersData] = useState<Dealer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate()

    const fetchDealersData = async () => {
        try {
            const response = await dealerApis.getAllPendingDealers()
            setDealersData(response.data);
        } catch (error) {
            console.error('Error fetching dealers data:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDealersData();
    }, []);

    const handleApprove = async (id: string) => {
        const confirm = await showConfirmationModal("Are you sure you would like to approve this account generation?")
        if (!confirm)
            return
        toast.info(`Setting up account for dealer.`);
        navigate(`/dealer/edit/${id}`)
    };

    const handleReject = async (id: string) => {
        const confirm = await showConfirmationModal("Are you sure you would like to reject this account generation?")
        if (!confirm)
            return
        try {
            toast.warn(`Rejected selected dealer. Removing application.`);
            await dealerApis.updateTempDealer(id, {})
            await fetchDealersData();
        } catch (error) {
            console.log(error)
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold ">Pending Approvals</h2>
                <p></p>
            </div>
            <div className="overflow-x-auto">
                <Table striped hoverable>
                    <Table.Head>
                        <Table.HeadCell>Username</Table.HeadCell>
                        <Table.HeadCell>Email</Table.HeadCell>
                        <Table.HeadCell>Mobile</Table.HeadCell>
                        <Table.HeadCell>Designation</Table.HeadCell>
                        <Table.HeadCell>Company</Table.HeadCell>
                        <Table.HeadCell>Address</Table.HeadCell>
                        <Table.HeadCell className="text-center">Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {dealersData.map((dealer) => (
                            <Table.Row key={dealer._id} className="hover:bg-gray-50">
                                <Table.Cell>{dealer.username}</Table.Cell>
                                <Table.Cell>{dealer.email}</Table.Cell>
                                <Table.Cell>{dealer.mobile}</Table.Cell>
                                <Table.Cell>{dealer.designation}</Table.Cell>
                                <Table.Cell>{dealer.company}</Table.Cell>
                                <Table.Cell>{`${dealer.address.buzz ?? ""} ${dealer.address.unit ?? ""}, ${dealer.address.address}`}</Table.Cell>
                                <Table.Cell className=" flex gap-x-3">
                                    <Button size={'xs'}
                                        onClick={() => handleApprove(dealer._id)}
                                        color="success"
                                        className="mr-2"
                                    >
                                        Approve
                                    </Button>
                                    <Button size={'xs'}
                                        onClick={() => handleReject(dealer._id)}
                                        color="failure"
                                    >
                                        Reject
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
};

export default DealersApprovalList;
