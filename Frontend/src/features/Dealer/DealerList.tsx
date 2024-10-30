import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Table } from 'flowbite-react';
import { ApprovedDealer as Dealer } from '../../config/models/dealer';
import { dealerApis } from '../../config/apiRoutes/dealerRoutes';
import Loading from '../../util/Loading';
import { toast } from 'react-toastify';
import showConfirmationModal from '../../util/confirmationUtil';
import { FaEdit } from 'react-icons/fa';
import { FaChevronLeft, FaEye, FaTrash } from 'react-icons/fa6';
import { HiDocument } from 'react-icons/hi';

const DealersList: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [dealersData, setDealersData] = useState<Dealer[]>([]);
    const [deletedDealers, setDeletedDealers] = useState<Dealer[]>([]);
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // Change this to the number of items you want per page

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDealersData = async () => {
            try {
                const response = await dealerApis.getAllApprovedDealers();
                setDealersData(response.data.filter((dlr: Dealer) => dlr.status === "ACTIVE"));
                setDeletedDealers(response.data.filter((dlr: Dealer) => dlr.status === "DELETED"));
            } catch (error) {
                console.error('Error fetching dealers data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDealersData();
    }, []);

    const handleEdit = (id: string) => {
        navigate(`/appdealer/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirm = await showConfirmationModal("Are you sure you would like to deactivate the selected account? Dealer will not be able to login once deactivated.");
        if (!confirm) return;

        const dealerToDelete = dealersData.find(dealer => dealer._id === id);
        let res = await dealerApis.updateApprovedDealer(id, { ...dealerToDelete, status: "DELETED" });
        setDealersData(dealersData.filter(dealer => dealer._id !== id));

        if (dealerToDelete) {
            setDeletedDealers([...deletedDealers, res.data]);
        }
        toast.success("Dealer's account deactivated successfully");
    };

    const handleRestore = async (id: string) => {
        const confirm = await showConfirmationModal("Are you sure you would like to reactivate selected account? Dealer will be able to access their account again after this action.");
        if (!confirm) return;

        try {
            const dealerToRestore = deletedDealers.find(dealer => dealer._id === id);
            let res = await dealerApis.updateApprovedDealer(id, { ...dealerToRestore, status: "ACTIVE" });
            if (res.status) {
                toast.success("Dealer's account reactivated successfully");
                setDeletedDealers(deletedDealers.filter(dealer => dealer._id !== id));
                setDealersData([...dealersData, res.data]);
            }
        } catch (error) {
            toast.error("Account could not be reactivated.");
        }
    };

    const handleView = (dealer: Dealer) => {
        setSelectedDealer(dealer);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDealer(null);
    };

    // Pagination Logic
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentDealers = dealersData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(dealersData.length / itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    

    return (
        <div className="container mx-auto p-4">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold">Dealers List</h2>
                <p></p>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table className="" striped>
                            <Table.Head>
                                <Table.HeadCell>Contact Person Name</Table.HeadCell>
                                <Table.HeadCell>Contact Person Cell</Table.HeadCell>
                                <Table.HeadCell>Contact Person Email ID</Table.HeadCell>
                                <Table.HeadCell>Company Name</Table.HeadCell>
                                <Table.HeadCell>Total balance</Table.HeadCell>
                                <Table.HeadCell>Total Open Balance</Table.HeadCell>
                                <Table.HeadCell className='text-center'>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {currentDealers.map(dealer => (
                                    <Table.Row key={dealer._id} className="hover:bg-gray-50">
                                        <Table.Cell>{dealer.contactPersonName}</Table.Cell>
                                        <Table.Cell>{dealer.contactPersonCell}</Table.Cell>
                                        <Table.Cell>{dealer.contactPersonEmail}</Table.Cell>
                                        <Table.Cell>{dealer.companyName}</Table.Cell>
                                        <Table.Cell>{dealer.totalBalance}</Table.Cell>
                                        <Table.Cell>{dealer.totalOpenBalance}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex space-x-2 justify-center">
                                                <Button color="info" onClick={() => handleEdit(dealer._id)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button color="warning" onClick={() => handleView(dealer)}>
                                                    <HiDocument />
                                                </Button>
                                                <Button color="failure" onClick={() => handleDelete(dealer._id)}>
                                                    <FaTrash />
                                                </Button>
                                                <Button color="success" onClick={() => handleView(dealer)}>
                                                    <FaEye />
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
    <Button onClick={goToPreviousPage} disabled={currentPage === 1} color="gray">
        Previous
    </Button>
    <span>
        Page {currentPage} of {totalPages}
    </span>
    <Button onClick={goToNextPage} disabled={currentPage === totalPages} color="gray">
        Next
    </Button>
</div>


                    {deletedDealers.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mt-8 mb-4 text-gray-500">Deactivated Dealers</h2>
                            <div className="overflow-x-auto">
                                <Table className="">
                                    <Table.Head>
                                        <Table.HeadCell>Contact Person Name</Table.HeadCell>
                                        <Table.HeadCell>Contact Person Cell</Table.HeadCell>
                                        <Table.HeadCell>Contact Person Email ID</Table.HeadCell>
                                        <Table.HeadCell>Company Name</Table.HeadCell>
                                        <Table.HeadCell>Actions</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                        {deletedDealers.map(dealer => (
                                            <Table.Row key={dealer._id} className="hover:bg-gray-50">
                                                <Table.Cell>{dealer.contactPersonName}</Table.Cell>
                                                <Table.Cell>{dealer.contactPersonCell}</Table.Cell>
                                                <Table.Cell>{dealer.contactPersonEmail}</Table.Cell>
                                                <Table.Cell>{dealer.companyName}</Table.Cell>
                                                <Table.Cell>
                                                    <Button color="success" onClick={() => handleRestore(dealer._id)}>
                                                        Restore
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedDealer && (
                <Modal show={showModal} onClose={closeModal}>
                    <Modal.Header className="text-xl font-semibold text-gray-800">
                        Dealer Details
                    </Modal.Header>
                    <Modal.Body className="bg-gray-100 p-6 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Contact Name</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.contactPersonName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact Cell</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.contactPersonCell}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.contactPersonEmail}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Company Name</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.companyName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Buzz Code</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.address.buzz ?? "NA"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Unit</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.address.unit ?? "NA"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.address.address}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Province</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.province.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Price Discount</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.priceDiscount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Credit Due Days</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.creditDueDays}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Credit Due Amount</p>
                                <p className="text-lg font-medium text-gray-900">{selectedDealer.creditDueAmount}</p>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="flex justify-end">
                        <Button color="gray" onClick={closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default DealersList;
