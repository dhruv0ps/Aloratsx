import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'flowbite-react';
import { toast } from 'react-toastify';
import { productApis } from '../../config/apiRoutes/productRoutes'; 
import showConfirmationModal from '../../util/confirmationUtil';
import { Tag } from '../../config/models/tag'; 
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';

const TagManager: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>([]); 
    const [showModal, setShowModal] = useState(false);
    const [currentTag, setCurrentTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const itemsPerPage = 10; // Number of items per page

    const navigate = useNavigate();

    // Fetch all tags
    const fetchTags = async () => {
        try {
            const res = await productApis.getAllTags(); // Fetch all tags
            if (res.status) {
                setTags(res.data); // Store all tags
                console.log(res.data);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Failed to fetch tags');
        }
    };

    useEffect(() => {
        fetchTags(); // Fetch tags on component mount
    }, []);

    // Calculate the tags to display on the current page
    const indexOfLastTag = currentPage * itemsPerPage;
    const indexOfFirstTag = indexOfLastTag - itemsPerPage;
    const currentTags = tags.slice(indexOfFirstTag, indexOfLastTag);

    // Calculate total number of pages
    const totalPages = Math.ceil(tags.length / itemsPerPage);

    const handleSubmit = async () => {
        try {
            if (currentTag) {
                const res = await productApis.updateTag(currentTag._id ?? '', formData); // Adjust API call
                if (res.status) {
                    toast.success('Tag successfully updated.');
                }
            } else {
                const res = await productApis.createTag(formData); // Adjust API call
                if (res.status) {
                    toast.success('Tag successfully added.');
                }
            }
            setShowModal(false);
            fetchTags(); // Refresh the tags after adding/updating
        } catch (error) {
            console.error('Error handling tag:', error);
            toast.error('Failed to handle tag');
        }
    };

    const handleDelete = async (tag: Tag) => {
        const confirmed = await showConfirmationModal('Are you sure you want to delete this tag?');
        if (!confirmed) return;

        try {
            const res = await productApis.deleteTag(tag._id ?? ''); // Adjust API call for delete
            if (res.status) {
                toast.success('Tag successfully deleted.');
                fetchTags(); // Refresh the tags after deletion
            } else {
                toast.error('Failed to delete tag');
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Failed to delete tag');
        }
    };

    const openModalForEdit = (tag: Tag) => {
        setCurrentTag(tag);
        setFormData({
            name: tag.name,
        });
        setShowModal(true);
    };

    const openModalForAdd = () => {
        setCurrentTag(null);
        setFormData({
            name: '',
        });
        setShowModal(true);
    };

    // Handle page navigation
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
                <h2 className="text-2xl font-semibold">Manage Tags</h2>
                <Button color="green" onClick={openModalForAdd}>Add New Tag</Button>
            </div>

            <div className="mt-5">
                <h3 className="font-bold mb-2">Active Tags</h3>
                <div className="overflow-x-auto">
                    <Table>
                        <Table.Head>
                            <Table.HeadCell>Name</Table.HeadCell>
                            <Table.HeadCell className='justify-end flex'>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {currentTags.map((tag) => (
                                <Table.Row key={tag._id}>
                                    <Table.Cell>{tag.name}</Table.Cell>
                                    <Table.Cell className='flex gap-x-3 items-center justify-end'>
                                        <Button size={'sm'} color="info" onClick={() => openModalForEdit(tag)}>
                                            Edit
                                        </Button>
                                        <Button size={'sm'} color="failure" onClick={() => handleDelete(tag)}>
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
                <Modal.Header>{currentTag ? 'Edit Tag' : 'Add Tag'}</Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">
                                Tag Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <Button type="submit" color="green">
                            {currentTag ? 'Update' : 'Add'} Tag
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TagManager;

