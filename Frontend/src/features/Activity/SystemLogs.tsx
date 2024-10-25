import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Log } from '../../config/models/inventoryLogs';
import { Button, Select, Table, TextInput } from 'flowbite-react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import Loading from '../../util/Loading';
import { useNavigate } from 'react-router-dom';

const LogTable: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [operationFilter, setOperationFilter] = useState<string>('');
    const [detailFilter, setDetailFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogs();
    }, [currentPage, operationFilter, detailFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await inventoryApi.getAllLogs({
                page: currentPage,
                operation: operationFilter,
                detail: detailFilter,
                limit: 20,
            });
            setLogs(response.data.logs);
            // console.log(response.data)
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            toast.error(error.response?.err.toString() ?? error.message.toString());
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        setLogs([...logs].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }));
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center mb-12 justify-between">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Logs</h2>
                <p></p>
            </div>
            <div className='w-full gap-5 mb-8 flex-col lg:flex-row flex items-center justify-between'>
                <TextInput
                    type="text"
                    placeholder="Filter by SKU/Order ID/Route ID"
                    value={detailFilter}
                    onChange={(e) => setDetailFilter(e.target.value)}
                    className="inline-block w-96"
                />
                <div className='flex justify-between w-full lg:w-auto gap-x-2'>

                    <Select
                        value={operationFilter}
                        onChange={(e) => setOperationFilter(e.target.value)}
                    >
                        <option value="Order">Order</option>
                        <option value="Packing">Packing</option>
                        <option value="Inventory ">Inventory </option>

                    </Select>
                </div>

            </div>

            {loading ? <Loading /> : (
                <>
                    <div className="overflow-x-auto">
                        <Table striped>
                            <Table.Head>
                                <Table.HeadCell onClick={handleSort} className='cursor-pointer text-nowrap'>Date {sortOrder === "desc" ? <MdArrowDropDown className='inline text-xl' /> : <MdArrowDropUp className='inline text-xl' />}</Table.HeadCell>
                                <Table.HeadCell className='px-4 py-2.5'>Operation</Table.HeadCell>
                                <Table.HeadCell className='px-4 py-2.5'>Child</Table.HeadCell>
                                <Table.HeadCell className='px-4 py-2.5'>Order</Table.HeadCell>
                                <Table.HeadCell className='px-4 py-2.5'>Route</Table.HeadCell>
                                <Table.HeadCell className='px-4 py-2.5'>Message</Table.HeadCell>

                            </Table.Head>
                            <Table.Body className='text-xs'>
                                {logs.length > 0 ? logs.map(log => (
                                    <Table.Row key={log._id}>
                                        <Table.Cell className='px-4 py-2.5'>{new Date(log.createdAt).toISOString().split("T")[0]}</Table.Cell>

                                        <Table.Cell className='px-4 py-2.5'>{log.operation}</Table.Cell>
                                        <Table.Cell className='px-4 py-2.5 text-nowrap'>{log.details?.child ?? ''}</Table.Cell>
                                        <Table.Cell className='px-4 py-2.5 text-nowrap'>{log.details?.order_id ?? ''}</Table.Cell>
                                        <Table.Cell className='px-4 py-2.5'>{log.details?.route_id ?? ''}</Table.Cell>
                                        <Table.Cell className='px-4 py-2.5'>{log.message}</Table.Cell>

                                    </Table.Row>
                                )) : <Table.Row><Table.Cell className='text-center' colSpan={7}>No Logs Found</Table.Cell></Table.Row>}
                            </Table.Body>
                        </Table>
                    </div>
                    <div className="flex justify-center items-center mt-4">
                        <Button
                            color="gray"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="mx-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            color="gray"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LogTable;