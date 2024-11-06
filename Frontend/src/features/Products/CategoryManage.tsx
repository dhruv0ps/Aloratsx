import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'flowbite-react';
import { toast } from 'react-toastify';
import { productApis } from '../../config/apiRoutes/productRoutes';
import showConfirmationModal from '../../util/confirmationUtil';
import { Category, subCategory } from '../../config/models/category';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';

const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showSubcategoryFormModal, setShowSubcategoryFormModal] = useState(false);
    const [currentCategoryForSubcategories, setCurrentCategoryForSubcategories] = useState<Category | null>(null);
    const [subcategories, setSubcategories] = useState<subCategory[]>([]);
    const [currentSubcategory, setCurrentSubcategory] = useState<subCategory | null>(null);

    // Pagination state for categories
    const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
    const categoriesPerPage = 5; // Number of categories per page

    // Pagination state for subcategories
    const [subcategoryCurrentPage, setSubcategoryCurrentPage] = useState(1);
    const subcategoriesPerPage = 5; // Number of subcategories per page

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null as File | null,
        imagePreview: null as string | null,
        status: 'ACTIVE'
    });

    const [subcategoryFormData, setSubcategoryFormData] = useState({
        name: '',
        image: null as File | null,
        imagePreview: null as string | null,
        status: 'ACTIVE'
    });

    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await productApis.GetCategories();
            if (res.status) {
                setCategories(res.data.filter((cat: Category) => cat.status === 'ACTIVE'));
                setDeletedCategories(res.data.filter((cat: Category) => cat.status === 'DELETED'));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Paginate categories
    const indexOfLastCategory = categoryCurrentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

    const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);

    // Paginate subcategories
    const indexOfLastSubcategory = subcategoryCurrentPage * subcategoriesPerPage;
    const indexOfFirstSubcategory = indexOfLastSubcategory - subcategoriesPerPage;
    const currentSubcategories = subcategories.slice(indexOfFirstSubcategory, indexOfLastSubcategory);

    const totalSubcategoryPages = Math.ceil(subcategories.length / subcategoriesPerPage);

    const handleSubmit = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            if (currentCategory) {
                const res = await productApis.UpdateCategories(currentCategory._id ?? '', formDataToSend);
                if (res.status) {
                    toast.success('Category successfully updated.');
                }
            } else {
                const res = await productApis.AddCategory(formDataToSend);
                if (res.status) {
                    toast.success('Category successfully added.');
                }
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error handling category:', error);
            toast.error('Failed to handle category');
        }
    };

    const handleSubcategorySubmit = async () => {
        if (!currentCategoryForSubcategories?._id) return;

        try {
            if (currentSubcategory) {
                const res = await productApis.UpdatesubCategories(currentSubcategory._id ?? '', subcategoryFormData);
                if (res.status) {
                    toast.success('Subcategory successfully updated.');
                    await fetchSubcategories(currentCategoryForSubcategories._id);
                }
            } else {
                const res = await productApis.AddsubCategory(currentCategoryForSubcategories._id, subcategoryFormData);
                if (res.status) {
                    toast.success('Subcategory successfully added.');
                    await fetchSubcategories(currentCategoryForSubcategories._id);
                }
            }
            setShowSubcategoryFormModal(false);
            resetSubcategoryForm();
        } catch (error) {
            console.error('Error handling subcategory:', error);
            toast.error('Failed to handle subcategory');
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const res = await productApis.GetsubCategories(categoryId);
            if (res.status) {
                setSubcategories(res.data);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error('Failed to fetch subcategories');
        }
    };

    const handleDelete = async (category: Category) => {
        const confirmed = await showConfirmationModal('Are you sure you want to delete this category?');
        if (!confirmed) return;

        try {
            const res = await productApis.UpdateCategories(category._id ?? '', { ...category, status: 'DELETED' });
            if (res.status) {
                toast.success('Category successfully deleted.');
                fetchCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const handleDeleteSubcategory = async (subcategory: subCategory) => {
        const confirmed = await showConfirmationModal('Are you sure you want to delete this subcategory?');
        if (!confirmed) return;

        try {
            const res = await productApis.UpdatesubCategories(subcategory._id ?? '', { ...subcategory, status: 'DELETED' });
            if (res.status) {
                toast.success('Subcategory successfully deleted.');
                if (currentCategoryForSubcategories?._id) {
                    await fetchSubcategories(currentCategoryForSubcategories._id);
                }
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            toast.error('Failed to delete subcategory');
        }
    };

    const handleRestore = async (category: Category) => {
        const confirmed = await showConfirmationModal('Are you sure you want to restore this category?');
        if (!confirmed) return;

        try {
            const res = await productApis.UpdateCategories(category._id ?? '', { ...category, status: 'ACTIVE' });
            if (res.status) {
                toast.success('Category successfully restored.');
                fetchCategories();
            }
        } catch (error) {
            console.error('Error restoring category:', error);
            toast.error('Failed to restore category');
        }
    };

    const openModalForEdit = (category: Category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            image: null,
            imagePreview: null,
            status: category.status,
        });
        setShowModal(true);
    };

    const openSubcategoryModalForEdit = (subcategory: subCategory) => {
        setCurrentSubcategory(subcategory);
        setSubcategoryFormData({
            name: subcategory.name,
            image: null,
            imagePreview: null,
            status: subcategory.status,
        });
        setShowSubcategoryFormModal(true);
    };

    const openModalForAdd = () => {
        setCurrentCategory(null);
        setFormData({
            name: '',
            description: '',
            image: null,
            imagePreview: null,
            status: 'ACTIVE'
        });
        setShowModal(true);
    };

    const openSubcategoryModalForAdd = () => {
        setCurrentSubcategory(null);
        resetSubcategoryForm();
        setShowSubcategoryFormModal(true);
    };

    const resetSubcategoryForm = () => {
        setSubcategoryFormData({
            name: '',
            image: null,
            imagePreview: null,
            status: 'ACTIVE'
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isSubcategory = false) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                if (isSubcategory) {
                    setSubcategoryFormData(prev => ({
                        ...prev,
                        image: file,
                        imagePreview: reader.result as string
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        image: file,
                        imagePreview: reader.result as string
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // const openSubcategoryModal = async (category: Category) => {
    //     setCurrentCategoryForSubcategories(category);
    //     await fetchSubcategories(category._id ?? '');
    //     setShowSubcategoryModal(true);
    // };

    const closeSubcategoryModal = () => {
        setShowSubcategoryModal(false);
        setSubcategories([]);
        setCurrentCategoryForSubcategories(null);
    };

    const toTitleCase = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const openImageModal = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setShowImageModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-5 rounded-lg bg-white">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold">Manage Categories</h2>
                <Button color="green" onClick={openModalForAdd}>Add New Category</Button>
            </div>

            {/* Active Categories Table */}
            <div className="mt-5">
                <h3 className="font-bold mb-2">Active Categories</h3>
                <div className="overflow-x-auto">
                    <Table>
                        <Table.Head>
                        <Table.HeadCell >Action</Table.HeadCell>
                            <Table.HeadCell>Name</Table.HeadCell>
                            <Table.HeadCell>Description</Table.HeadCell>
                            <Table.HeadCell>Image</Table.HeadCell>
                         
                        </Table.Head>
                        <Table.Body>
                            {currentCategories.map((category) => (
                                <Table.Row key={category._id}>
                                     <Table.Cell className='flex gap-x-3 '>
                                        {/* <Button size={'sm'} color="info" onClick={() => openSubcategoryModal(category)}>
                                            Manage Subcategories
                                        </Button> */}
                                        <Button size={'sm'} color="warning" onClick={() => openModalForEdit(category)}>
                                            Edit
                                        </Button>
                                        <Button size={'sm'} color="failure" onClick={() => handleDelete(category)}>
                                            Delete
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell>{toTitleCase(category.name)}</Table.Cell>
                                    <Table.Cell>
                                        {category.description.length > 50
                                            ? `${toTitleCase(category.description.slice(0, 50))}...`
                                            : toTitleCase(category.description)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <img
                                            src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${category.image}`}
                                            alt={category.name}
                                            className="w-12 h-12 object-cover cursor-pointer"
                                            onClick={() => openImageModal(`${import.meta.env.VITE_BASE_IMAGE_URL}/${category.image}`)}
                                        />
                                    </Table.Cell>
                                   
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

                    {/* Pagination Controls for Categories */}
                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={() => setCategoryCurrentPage(categoryCurrentPage - 1)} disabled={categoryCurrentPage === 1} color="gray">
                            Previous
                        </Button>
                        <span>
                            Page {categoryCurrentPage} of {totalCategoryPages}
                        </span>
                        <Button onClick={() => setCategoryCurrentPage(categoryCurrentPage + 1)} disabled={categoryCurrentPage === totalCategoryPages} color="gray">
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Deleted Categories Table */}
            <div className="mt-5">
                <h3 className="font-bold mb-2">Deleted Categories</h3>
                <div className="overflow-x-auto">
                    <Table>
                        <Table.Head>
                        <Table.HeadCell >Action</Table.HeadCell>
                            <Table.HeadCell>Name</Table.HeadCell>
                            <Table.HeadCell>Description</Table.HeadCell>
                            <Table.HeadCell>Image</Table.HeadCell>
                            
                        </Table.Head>
                        <Table.Body>
                            {deletedCategories.map((category) => (
                                <Table.Row key={category._id}>
                                                                        <Table.Cell>
                                        <Button size={'xs'} color="success" onClick={() => handleRestore(category)}>
                                            Restore
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell>{toTitleCase(category.name)}</Table.Cell>
                                    <Table.Cell>
                                        {category.description.length > 50
                                            ? `${toTitleCase(category.description.slice(0, 50))}...`
                                            : toTitleCase(category.description)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <img
                                            src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${category.image}`}
                                            alt={category.name}
                                            className="w-12 h-12 object-cover cursor-pointer"
                                            onClick={() => openImageModal(`${import.meta.env.VITE_BASE_IMAGE_URL}/${category.image}`)}
                                        />
                                    </Table.Cell>

                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            </div>

            {/* Category Form Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>{currentCategory ? 'Edit Category' : 'Add Category'}</Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">
                                Category Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full"
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
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="block text-gray-700 font-semibold mb-1">
                                Category Image:
                            </label>
                            {currentCategory && currentCategory.image && !formData.imagePreview && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                    <img
                                        src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${currentCategory.image}`}
                                        alt={currentCategory.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            {formData.imagePreview && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">New Image Preview:</p>
                                    <img
                                        src={formData.imagePreview}
                                        alt="New category image"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, false)}
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                        </div>
                        <Button type="submit" color="green">
                            {currentCategory ? 'Update' : 'Add'} Category
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Image Preview Modal */}
            <Modal show={showImageModal} onClose={() => setShowImageModal(false)} size="md">
                <Modal.Header>Category Image</Modal.Header>
                <Modal.Body>
                    {selectedImage && (
                        <div className="flex justify-center">
                            <img
                                src={selectedImage}
                                alt="Category"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Subcategories List Modal */}
            <Modal
                show={showSubcategoryModal}
                onClose={closeSubcategoryModal}
                size="xl"
            >
                <Modal.Header>
                    Manage Subcategories for {currentCategoryForSubcategories?.name}
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <Button
                            color="green"
                            onClick={openSubcategoryModalForAdd}
                        >
                            Add New Subcategory
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <Table.Head>
                                <Table.HeadCell>Name</Table.HeadCell>
                                {/* <Table.HeadCell>Image</Table.HeadCell> */}
                                <Table.HeadCell>Status</Table.HeadCell>
                                <Table.HeadCell className='justify-end flex'>Action</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {currentSubcategories.map((subcategory) => (
                                    <Table.Row key={subcategory._id}>
                                        <Table.Cell>{toTitleCase(subcategory.name)}</Table.Cell>
                                        {/* <Table.Cell>
                                            {subcategory.image && (
                                                <img
                                                    src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${subcategory.image}`}
                                                    alt={subcategory.name}
                                                    className="w-12 h-12 object-cover cursor-pointer"
                                                    onClick={() => openImageModal(`${import.meta.env.VITE_BASE_IMAGE_URL}/${subcategory.image}`)}
                                                />
                                            )}
                                        </Table.Cell> */}
                                        <Table.Cell>{subcategory.status}</Table.Cell>
                                        <Table.Cell className='flex gap-x-3 items-center justify-end'>
                                            <Button
                                                size={'sm'}
                                                color="warning"
                                                onClick={() => openSubcategoryModalForEdit(subcategory)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size={'sm'}
                                                color="failure"
                                                onClick={() => handleDeleteSubcategory(subcategory)}
                                            >
                                                Delete
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>

                        {/* Pagination Controls for Subcategories */}
                        <div className="flex justify-between items-center mt-4">
                            <Button onClick={() => setSubcategoryCurrentPage(subcategoryCurrentPage - 1)} disabled={subcategoryCurrentPage === 1} color="gray">
                                Previous
                            </Button>
                            <span>
                                Page {subcategoryCurrentPage} of {totalSubcategoryPages}
                            </span>
                            <Button onClick={() => setSubcategoryCurrentPage(subcategoryCurrentPage + 1)} disabled={subcategoryCurrentPage === totalSubcategoryPages} color="gray">
                                Next
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Subcategory Form Modal */}
            <Modal
                show={showSubcategoryFormModal}
                onClose={() => setShowSubcategoryFormModal(false)}
            >
                <Modal.Header>
                    {currentSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubcategorySubmit(); }}>
                        <div className="mb-4">
                            <label htmlFor="subcategoryName" className="block text-gray-700 font-semibold mb-1">
                                Subcategory Name:
                            </label>
                            <input
                                type="text"
                                id="subcategoryName"
                                value={subcategoryFormData.name}
                                onChange={(e) => setSubcategoryFormData({
                                    ...subcategoryFormData,
                                    name: e.target.value
                                })}
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                        </div>
                        <Button type="submit" color="green">
                            {currentSubcategory ? 'Update' : 'Add'} Subcategory
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CategoryManager;
