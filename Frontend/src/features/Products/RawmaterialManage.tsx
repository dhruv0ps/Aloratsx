import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'flowbite-react';
import { toast } from 'react-toastify';
import { productApis } from '../../config/apiRoutes/productRoutes';
import showConfirmationModal from '../../util/confirmationUtil';
import { RawMaterial } from '../../config/models/rawmaterial'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';

const RawMaterialManager: React.FC = () => {
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRawMaterial, setCurrentRawMaterial] = useState<RawMaterial | null>(null);
    const [formData, setFormData] = useState({
        material: '',
        description: '',
        image: null as File | null,
        imagePreview: null as string | null,
        measuringUnit: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of raw materials per page

    const navigate = useNavigate();

    const fetchRawMaterials = async () => {
        try {
            const res = await productApis.getRawmaterial(); // Ensure you have a corresponding API endpoint
            if (res.status) {
                setRawMaterials(res.data);
                console.log(res.data);
            }
        } catch (error) {
            console.error('Error fetching raw materials:', error);
            toast.error('Failed to fetch raw materials');
        }
    };

    useEffect(() => {
        fetchRawMaterials();
    }, []);

    // Calculate current raw materials to display
    const indexOfLastMaterial = currentPage * itemsPerPage;
    const indexOfFirstMaterial = indexOfLastMaterial - itemsPerPage;
    const currentMaterials = rawMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);

    // Calculate total number of pages
    const totalPages = Math.ceil(rawMaterials.length / itemsPerPage);

    const handleSubmit = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('material', formData.material);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('measuringUnit', formData.measuringUnit);
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            if (currentRawMaterial) {
                const res = await productApis.updateRawmaterial(currentRawMaterial._id ?? '', formDataToSend); // Adjust API call
                if (res.status) {
                    toast.success('Raw material successfully updated.');
                }
            } else {
                const res = await productApis.addRawmaterial(formDataToSend); // Adjust API call
                if (res.status) {
                    toast.success('Raw material successfully added.');
                }
            }
            setShowModal(false);
            fetchRawMaterials();
        } catch (error) {
            console.error('Error handling raw material:', error);
            toast.error('Failed to handle raw material');
        }
    };

    const handleDelete = async (rawMaterial: RawMaterial) => {
        const confirmed = await showConfirmationModal('Are you sure you want to delete this raw material?');
        if (!confirmed) return;

        try {
            const res = await productApis.deleteRawMaterial(rawMaterial._id ?? ''); // Adjust API call for delete
            if (typeof res === 'object' && res !== null && 'status' in res) {
                if (res.status) {
                    toast.success('Raw material successfully deleted.');
                    fetchRawMaterials();
                } else {
                    toast.error('Failed to delete raw material');
                }
            } else {
                toast.error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error deleting raw material:', error);
            toast.error('Failed to delete raw material');
        }
    };

    const openModalForEdit = (rawMaterial: RawMaterial) => {
        setCurrentRawMaterial(rawMaterial);
        setFormData({
            material: rawMaterial.material,
            description: rawMaterial.description,
            image: null,
            imagePreview: null,
            measuringUnit: rawMaterial.measuringUnit,
        });
        setShowModal(true);
    };

    const openModalForAdd = () => {
        setCurrentRawMaterial(null);
        setFormData({
            material: '',
            description: '',
            image: null,
            imagePreview: null,
            measuringUnit: '',
        });
        setShowModal(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Pagination Controls
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
        <div className="max-w-7xl mx-auto p-5 rounded-lg bg-white">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold">Manage Raw Materials</h2>
                <Button color="green" onClick={openModalForAdd}>Add New Raw Material</Button>
            </div>

            <div className="mt-5">
                <h3 className="font-bold mb-2">Active Raw Materials</h3>
                <div className="overflow-x-auto">
                    <Table>
                        <Table.Head>
                            <Table.HeadCell>Image</Table.HeadCell>
                            <Table.HeadCell>Material</Table.HeadCell>
                            <Table.HeadCell>Description</Table.HeadCell>
                            <Table.HeadCell>Measuring Unit</Table.HeadCell>
                            <Table.HeadCell className='justify-end flex'>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {currentMaterials.map((rawMaterial) => (
                                <Table.Row key={rawMaterial._id}>
                                    <Table.Cell>
                                        {rawMaterial.image && (
                                            <img
                                                src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${rawMaterial.image}`}
                                                alt={rawMaterial.material}
                                                className="w-12 h-12 object-cover rounded border border-gray-300"
                                            />
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{rawMaterial.material}</Table.Cell>
                                    <Table.Cell>
                                        {rawMaterial.description.length > 50
                                            ? `${rawMaterial.description.slice(0, 50)}...`
                                            : rawMaterial.description}
                                    </Table.Cell>
                                    <Table.Cell>{rawMaterial.measuringUnit}</Table.Cell>
                                    <Table.Cell className='flex gap-x-3 items-center justify-end'>
                                        <Button size={'sm'} color="warning" onClick={() => openModalForEdit(rawMaterial)}>
                                            Edit
                                        </Button>
                                        <Button size={'sm'} color="failure" onClick={() => handleDelete(rawMaterial)}>
                                            Delete
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

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
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>{currentRawMaterial ? 'Edit Raw Material' : 'Add Raw Material'}</Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="mb-4">
                            <label htmlFor="material" className="block text-gray-700 font-semibold mb-1">
                                Material:
                            </label>
                            <input
                                type="text"
                                id="material"
                                value={formData.material}
                                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-gray-700 font-semibold mb-1">
                                Description:
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="measuringUnit" className="block text-gray-700 font-semibold mb-1">
                                Measuring Unit (optional):
                            </label>
                            <select
                                id="measuringUnit"
                                value={formData.measuringUnit}
                                onChange={(e) => setFormData({ ...formData, measuringUnit: e.target.value })}
                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select a unit</option>
                                <option value="pieces">Pieces</option>
                                <option value="inches">Inches</option>
                                <option value="kilograms">Kilograms</option>
                                <option value="lbs">Lbs</option>
                                <option value="meters">Meters</option>
                                <option value="grams">Grams</option>
                                {/* Add more options as necessary */}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="block text-gray-700 font-semibold mb-1">
                                Raw Material Image:
                            </label>
                            {currentRawMaterial && currentRawMaterial.image && !formData.imagePreview && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                    <img
                                        src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${currentRawMaterial.image}`}
                                        alt={currentRawMaterial.material}
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                                    />
                                </div>
                            )}
                            {formData.imagePreview && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">New Image Preview:</p>
                                    <img
                                        src={formData.imagePreview}
                                        alt="New raw material image"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <Button type="submit" color="green">
                            {currentRawMaterial ? 'Update' : 'Add'} Raw Material
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default RawMaterialManager;
