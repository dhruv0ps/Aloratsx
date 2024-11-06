import { useEffect, useState } from 'react';
import { Button, Select } from 'flowbite-react';
import Loading from '../../util/Loading';
// import { Inbound } from '../../config/models/inventory';
// import AutocompleteLocation from '../../util/AutoCompleteInvLocation';
import { Location } from '../../config/models/supplier';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import { useNavigate } from 'react-router-dom';

interface InboundListProps {
    status: string;
    location?: Location;
    createdBy: string;
    dateRange: {
        start: string;
        end: string;
    };
}

export default function InboundList() {
    const [inbounds, setInbounds] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<InboundListProps>({
        status: '',
        location: {} as Location,
        createdBy: '',
        dateRange: {
            start: new Date().toISOString().split("T")[0],
            end: new Date().toISOString().split("T")[0]
        }
    });
    const navigate = useNavigate()
    useEffect(() => {
        fetchInbounds();
    }, [currentPage, filters]);

    const fetchInbounds = async () => {
        try {
            setLoading(true);
            const response = await inventoryApi.getAllInbound({
                page: currentPage.toString(),
                limit: '20',
                filters: { ...filters || "" }
            });
            console.log(response.data)
            setInbounds(response.data.inbounds);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching inbounds:", error);
        } finally {
            setLoading(false);
        }
    };

    // const handleSourceLocationSelection = (location: Location) => {
    //     setFilters(prev => ({ ...prev, location: location }));
    // };

    const handleFilterChange = (key: keyof InboundListProps, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mt-5 border border-gray-100 border-l-2">
            <div className="max-w-6xl mx-auto">
            <Button color="gray" onClick={() => navigate(-1)}>
          Back
        </Button>
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Inbound List
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage all inbound orders
                    </p>
                </div>

                {/* Filters Section */}
                <div className="flex items-center flex-wrap gap-4 mb-6 justify-end">
                    <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </Select>

                    {/* <div className="flex-1 min-w-48">
                        <AutocompleteLocation onSelect={handleSourceLocationSelection}
                            value={filters.location} />
                    </div> */}

                    {/* <div className="flex gap-2">
                        <Datepicker
                            value={filters.dateRange.start}
                            onChange={(date) => handleFilterChange('dateRange', {
                                ...filters.dateRange,
                                start: date
                            })}
                        />
                        <Datepicker
                            value={filters.dateRange.end}
                            onChange={(date) => handleFilterChange('dateRange', {
                                ...filters.dateRange,
                                end: date
                            })}
                        />
                    </div> */}
                </div>


                <div className='shadow-md rounded-lg p-5 bg-white'>
                    {inbounds.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full rounded">
                                <thead className="bg-gray-200">
                                    <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                                       
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inbounds.map((inbound) => (
                                        <tr key={inbound._id} className="hover:bg-gray-50">
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    className="bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                                                    onClick={() => { navigate(`/inventory/inbound/edit/${inbound._id}`) }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {inbound.name}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {inbound.location.name}
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${inbound.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : inbound.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {inbound.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {inbound.createdBy?.username || ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(inbound.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {inbound.items.length}
                                            </td>
                                          
                                        </tr>
                                    ))}
                                </tbody>
                            </table>


                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative cursor-pointer inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    Prev
                                </button>
                                <div className="flex gap-2 mx-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            color={currentPage === page ? "dark" : "light"}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative cursor-pointer inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className='text-gray-500 text-center py-8'>No inbound lists found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}