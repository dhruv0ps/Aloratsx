import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Location as InvLocation } from '../../config/models/supplier';
import { Button, Table } from 'flowbite-react';
import Loading from '../../util/Loading';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import { RiAddBoxFill } from 'react-icons/ri';

const ViewIncLocations: React.FC = () => {
    const [suppliers, setSuppliers] = useState<InvLocation[]>([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState<InvLocation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState<boolean>(false)

    const navigate = useNavigate()
    // const [category, setCategory] = useState("")

    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoading(true)
            try {
                const response = await inventoryApi.getAllInvLocations();
                let locations: InvLocation[] = response.data
                // console.log(locations)
                setSuppliers(locations);
                setFilteredSuppliers(locations)
            } catch (error) {
                console.error('Error:', error);
                // toast.error('Failed to fetch suppliers');
            } finally {
                setLoading(false)
            }
        };

        fetchSuppliers();
    }, []);

    const filterApply = (text: string) => {
        let temp = suppliers.filter((supplier) => {
            return (supplier.name.toLowerCase().includes(text.toLowerCase()) || supplier.emailID.includes(text.toUpperCase()))
        }
        );
        // console.log(suppliers, category)
        setFilteredSuppliers(temp)
    }

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        filterApply(e.target.value)
    };

    // const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    //     setCategory(e.target.value)
    //     filterApply(searchTerm, e.target.value)
    // }


    return (
        loading ? <Loading /> : <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="flex items-center mb-12 justify-between">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Inventory Locations</h2>
                <button className=" bg-green-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring focus:ring-indigo-200"
                    onClick={() => navigate("/inventory/location/add")}>
                    <span className='flex gap-2 items-center'><RiAddBoxFill />Add Location</span>
                </button>
            </div>
            <div className="mb-4 gap-4 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search by name, initials or mobile number"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded-md md:min-w-96"
                />
                {/* <select className='w-64 rounded-md text-gray-500 accent-gray-500' value={category} onChange={handleStatusChange}>
                    <option value="">All</option>
                    <option value="InvLocation">Warehouse</option>
                    <option value="Truck">Truck</option>
                </select> */}
            </div>
            <div className="overflow-x-auto">
                <Table className="min-w-full bg-white border">
                    <Table.Head>

                        <Table.HeadCell className="py-2 px-4 border-b">Name</Table.HeadCell>
                        <Table.HeadCell className="py-2 px-4 border-b">Email ID</Table.HeadCell>
                        <Table.HeadCell className="py-2 px-4 border-b">Pickup Location</Table.HeadCell>
                        <Table.HeadCell className="py-2 px-4 border-b">Actions</Table.HeadCell>

                    </Table.Head>
                    <Table.Body>
                        {filteredSuppliers.map((location) => (
                            <Table.Row key={location._id}>
                                <Table.Cell className="py-2 px-4 border-b">{location.name}</Table.Cell>
                                <Table.Cell className="py-2 px-4 border-b">{location.emailID}</Table.Cell>
                                <Table.Cell className="py-2 px-4 border-b">{`${location.address.unit ? location.address.unit + "," : ""}  ${location.address.address}`}</Table.Cell>
                                <Table.Cell className="py-2 px-4 border-b">
                                    <Button color={'purple'} onClick={() => navigate(`/inventory/location/${location._id}/edit`)}>Edit</Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
};

export default ViewIncLocations;
