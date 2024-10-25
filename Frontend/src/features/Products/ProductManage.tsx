import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table, TextInput, Select, FloatingLabel } from 'flowbite-react';
import { MdDelete, MdImageNotSupported } from 'react-icons/md';
import { FaChevronLeft, FaPencil } from 'react-icons/fa6';
import Loading from '../../util/Loading';
import BarcodeGenerator from './ProductBarcodeGenerator';
import { productApis } from '../../config/apiRoutes/productRoutes';

interface RawMaterial {
    _id: string;
    material: string;
    measuringUnit: string;
}

interface ChildRawMaterial {
    material: string;
    materialId: string;
    quantity: number;
    unit: string;
}

interface Child {
    SKU: string;
    name: string;
    selling_price: number;
    cost_price: number;
    weight: { value: number; unit: string };
    status: string;
    stock: number;
    isActive: boolean;
    firmness: string;
    description: string;
    tags: { _id: string; name: string }[];
    rawMaterials: ChildRawMaterial[];
    product_size: { L: number; W: number; H: number };
}

interface Tag {
    _id: string;
    name: string;
}

interface Category {
    _id: string;
    name: string;
}

interface ProductFormState {
    name: string;
    categories: Category[];
    ID: string;
    children: Child[];
    Description: string;
}

const ProductForm: React.FC = () => {
    const [formState, setFormState] = useState<ProductFormState>({
        name: '',
        categories: [],
        ID: '',
        children: [],
        Description: '',
    });

    const [childState, setChildState] = useState<Child>({
        SKU: '',
        name: '',
        selling_price: 0,
        cost_price: 0,
        weight: { value: 0, unit: 'lb' },
        status: 'IN STOCK',
        stock: 0,
        isActive: true,
        description: '',
        tags: [],
        firmness: '',
        rawMaterials: [{ material: '', materialId: '', quantity: 0, unit: '' }],
        product_size: { L: 0, W: 0, H: 0 },
    });
   

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(undefined);
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]); // Keep this local for child-specific tags
    const [rawMaterialsOptions, setRawMaterialsOptions] = useState<RawMaterial[]>([]);
    const [isAddingChild, setIsAddingChild] = useState<boolean>(false); // To toggle the child form visibility

    const params = useParams<{ id?: string }>();
    const { id } = params;
    const navigate = useNavigate();
    console.log(selectedCategory)
    console.log(tags)
    useEffect(() => {
        fetchAllTags();
        fetchRawMaterials();
        fetchCategories();
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const fetchRawMaterials = async () => {
        try {
            const response = await productApis.getRawmaterial();
            if (response.status) {
                setRawMaterialsOptions(response.data);
            }
        } catch (error) {
            console.error('Error fetching raw materials:', error);
        }
    };

    const handleRemoveRawMaterial = (index: number) => {
        setChildState((prevState) => ({
            ...prevState,
            rawMaterials: prevState.rawMaterials.filter((_, i) => i !== index),
        }));
    };

    const handleAddRawMaterial = () => {
        setChildState((prevState) => ({
            ...prevState,
            rawMaterials: [...prevState.rawMaterials, { material: '', materialId: '', quantity: 0, unit: '' }],
        }));
    };

    const handleRawMaterialChange = (index: number, field: string, value: string | number) => {
        setChildState((prevState) => {
            const updatedRawMaterials = [...prevState.rawMaterials];
            if (field === 'materialId') {
                const selectedRawMaterial = rawMaterialsOptions.find((material) => material._id === value);
                if (selectedRawMaterial) {
                    updatedRawMaterials[index] = {
                        ...updatedRawMaterials[index],
                        materialId: selectedRawMaterial._id,
                        material: selectedRawMaterial.material,
                        unit: selectedRawMaterial.measuringUnit,
                    };
                }
            } else {
                updatedRawMaterials[index] = {
                    ...updatedRawMaterials[index],
                    [field]: value,
                };
            }
            return { ...prevState, rawMaterials: updatedRawMaterials };
        });
    };

    const fetchCategories = async () => {
        try {
            const response = await productApis.GetCategories();
            if (response.status) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProductDetails = async (productId: string) => {
        try {
            const response = await productApis.getProductById(productId);
            if (response.status) {
                setFormState({
                    ...response.data,
                    category: response.data.category.name, // Set category name here
                });
                setSelectedCategory(response.data.category);
            }
        } catch (error: any) {
            console.error(error.response.err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    const handleChildInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setChildState((prevState) => {
            // Create a copy of the childState to modify
            const updatedChild = { ...prevState };
    
            // Handle fields that are directly on the childState (e.g., name, SKU, selling_price)
            if (name === 'name' || name === 'SKU' || name === 'selling_price' || name === 'cost_price' || name === 'stock' || name === 'firmness' || name === 'description') {
                (updatedChild as any)[name] = value;
            }
            
            // Handle weight value and unit separately (since they are nested under weight)
            else if (name === 'weight.value') {
                updatedChild.weight = {
                    ...updatedChild.weight,
                    value: parseFloat(value), // Ensure it's treated as a number
                };
            } else if (name === 'weight.unit') {
                updatedChild.weight = {
                    ...updatedChild.weight,
                    unit: value,
                };
            }
    
            // Handle product size (since it's nested under product_size)
            else if (name === 'product_size.L' || name === 'product_size.W' || name === 'product_size.H') {
                const sizeKey = name.split('.')[1]; // Extract 'L', 'W', or 'H'
                updatedChild.product_size = {
                    ...updatedChild.product_size,
                    [sizeKey]: parseFloat(value), // Ensure it's treated as a number
                };
            }
    
            return updatedChild; // Return the updated child state
        });
    };
    
    
    const fetchAllTags = async () => {
        try {
            const response = await productApis.getAllTags();
            if (response.status) {
                setTags(response.data);
                setAvailableTags(response.data);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTagId = e.target.value;
        const selectedTag = availableTags.find((tag) => tag._id === selectedTagId);
    
        if (selectedTag && !childState.tags.some((tag) => tag._id === selectedTagId)) {
            setChildState((prevState) => ({
                ...prevState,
                tags: [...prevState.tags, { _id: selectedTag._id, name: selectedTag.name }]
            }));
        }
    }

    const handleRemoveTag = (tagToRemove: Tag) => {
        setChildState((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag._id !== tagToRemove._id),
        }));
        setAvailableTags((prev) => [...prev, tagToRemove]);
    };

    const addChild = () => {
        if (!childState.SKU || !childState.name || !childState.selling_price) {
            toast.info('Please fill the required fields before adding');
            return;
        }
    
        const existingIndex = formState.children.findIndex((child) => child.SKU === childState.SKU);
        if (existingIndex > -1) {
          
            const updatedChildren = [...formState.children];
            updatedChildren[existingIndex] = childState;
            setFormState({ ...formState, children: updatedChildren });
        } else {
           
            setFormState({ ...formState, children: [...formState.children, childState] });
        }
    
        resetChildState(); 
        setIsAddingChild(false); 
    };
    
    
    const resetChildState = () => {
        setChildState({
            SKU: `${formState.ID}CH${formState.children.length + 1}`,
            name: '',
            selling_price: 0,
            cost_price: 0,
            weight: { value: 0, unit: 'lb' },
            status: 'IN STOCK',
            stock: 0,
            isActive: true,
            description: '',
            firmness: '',
            tags: [],
            rawMaterials: [{ material: '', materialId: '', quantity: 0, unit: '' }],
            product_size: { L: 0, W: 0, H: 0 },
        });
    };
   
const editChild = (child: Child) => {
    setChildState(child); // Load the selected child details into the childState
};


const removeChild = (SKU: string) => {
    setFormState((prevState) => ({
        ...prevState,
        children: prevState.children.map((child) =>
            child.SKU === SKU ? { ...child, isActive: false } : child
        ),
    }));
};
const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = categories.find((category) => category._id === selectedCategoryId);

    // If the category is not already selected, add it
    if (selectedCategory && !formState.categories.some((cat) => cat._id === selectedCategoryId)) {
        setFormState((prev) => ({
            ...prev,
            categories: [...prev.categories, selectedCategory]  // Add the selected category
        }));

        // Remove from available categories
        setCategories((prev) => prev.filter((cat) => cat._id !== selectedCategoryId));
    }
};


const handleRemoveCategory = (categoryToRemove: Category) => {
    setFormState((prev) => ({
        ...prev,
        categories: prev.categories.filter((category) => category._id !== categoryToRemove._id)  // Remove category
    }));

    // Return the removed category back to the available options
    setCategories((prev) => [...prev, categoryToRemove]);
};



const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const productData = {
            name: formState.name,
            category:  formState.categories.map((cat) => cat.name),
            ID: formState.ID,
            Description: formState.Description,
            children: formState.children.length > 0 
            ? formState.children.map((child) => ({
                SKU: child.SKU,
                name: child.name,
                selling_price: child.selling_price,
                cost_price: child.cost_price,
                weight: child.weight,
                status: child.status,
                stock: child.stock,
                description: child.description,
                firmness: child.firmness,
                 tags: child.tags.map(tag => ({
                    _id: tag._id, 
                    name: tag.name,
                })),
                rawMaterials: child.rawMaterials.map((rm) => ({
                    materialId: rm.materialId,
                    quantity: rm.quantity,
                    unit: rm.unit,
                    material :rm.material
                })),
                product_size: child.product_size,
            })) 
            : [], 
        };

        console.log('Product Data:', productData);

        const response = await productApis.createProduct(productData); 
        if (response.status) {
            toast.success(response.message);
            navigate('/products');
        } else {
            toast.error(response.message);
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    if (
        childState.SKU && 
        childState.name && 
        childState.selling_price > 0 && 
        formState.children.length === 0
    ) {
        setFormState((prevState) => ({
            ...prevState,
            children: [{ ...childState }],
        }));
    }
}, [childState]);


    if (loading) return <Loading />;

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-8 shadow-md rounded-lg">
            <div className='mb-6 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold">{id ? "Edit Product" : "Add Product"}</h2>
            </div>

            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Product Name:</label>
                <TextInput id="name" name="name" value={formState.name} onChange={handleInputChange} required />
            </div>
            <div className="mb-4">
                <label htmlFor="ID" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Product ID:</label>
                <TextInput id="ID" name="ID" value={formState.ID} onChange={handleInputChange} required />
            </div>
            <div className="mb-4">
                <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Description:</label>
                <TextInput id="Description" name="Description" value={formState.Description} onChange={handleInputChange} required />
            </div>

            <div className="mb-4">
    <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">Select Categories:</label>
    <Select
        id="categories"
        value=""  
        onChange={handleCategoryChange}
        className="block w-full"
    >
        <option value="">Select a category</option>
        {categories.map(category => (
            <option key={category._id} value={category._id}>
                {category.name}
            </option>
        ))}
    </Select>

   
    <div className="mt-2">
        {formState.categories.length > 0 ? (
            formState.categories.map((category, index) => (
                <span key={index} className="inline-block bg-gray-200 rounded-full px-[8px] py-[5px] text-sm mr-[5px] mt-[5px]">
                    {category.name}
                    <button 
                        type='button' 
                        onClick={() => handleRemoveCategory(category)} 
                        className='ml-[5px] text-red-500'
                    >
                        &times;
                    </button>
                </span>
            ))
        ) : (
            <p>No categories selected</p>
        )}
    </div>
</div>


            <hr className='my-6' />

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="SKU" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>SKU:</label>
                    <TextInput id="SKU" name="SKU" value={childState.SKU}  onChange={handleChildInputChange} required={formState.children.length < 1} />
                </div>
                <div>
                    <label htmlFor="child_name" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Child Name:</label>
                    <TextInput id="child_name" name="name" value={childState.name} onChange={handleChildInputChange} required={formState.children.length < 1} />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Description:</label>
                    <TextInput id="description" name="description" value={childState.description} onChange={handleChildInputChange} required={formState.children.length < 1} />
                </div>
                <div>
                    <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Selling Price:</label>
                    <TextInput id="selling_price" name="selling_price" type="number" min={0} value={childState.selling_price} onChange={handleChildInputChange} required={formState.children.length < 1} />
                </div>
                <div>
                    <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-2">Cost Price:</label>
                    <TextInput id="cost_price" name="cost_price" type="number" min={0} value={childState.cost_price} onChange={handleChildInputChange} required={formState.children.length < 1} />
                </div>
                <div>
                    <label htmlFor="weight.value" className="block text-sm font-medium text-gray-700 mb-2">Weight:</label>
                    <div className="flex">
                        <TextInput id="weight.value" name="weight.value" type="number" min={0} value={childState.weight.value} onChange={handleChildInputChange} className="flex-grow" />
                        <Select id="weight.unit" name="weight.unit" value={childState.weight.unit} onChange={handleChildInputChange} className="ml-2 w-24">
                            <option value="lb">lb</option>
                            <option value="kg">kg</option>
                        </Select>
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Firmness:</label>
                    <Select
                        name="firmness"
                        value={childState.firmness}
                        onChange={handleChildInputChange}
                        required
                        className="p-2 border border-gray-300 rounded w-full"
                    >
                        <option value="">Select firmness</option>
                        <option value="Ultra Plush">Ultra Plush</option>
                        <option value="Plush">Plush</option>
                        <option value="Medium">Medium</option>
                        <option value="Firm">Firm</option>
                        <option value="Extra Firm">Extra Firm</option>
                    </Select>
                </div>
                <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Select Tag:</label>
                    <Select
                        id="tags"
                        value=""  
                        onChange={handleTagChange}
                        className="block w-full"
                    >
                        <option value="">Select a tag</option>
                        {availableTags.map(tag => (
                            <option key={tag._id} value={tag._id}>
                                {tag.name}
                            </option>
                        ))}
                    </Select>

                 
                    <div className="mt-2">
                        {childState.tags.length > 0 ? (
                            childState.tags.map((tag, index) => (
                                <span key={index} className="inline-block bg-gray-200 rounded-full px-[8px] py-[5px] text-sm mr-[5px] mt-[5px]">
                                    {tag.name}
                                    <button 
                                        type='button' 
                                        onClick={() => handleRemoveTag(tag)} 
                                        className='ml-[5px] text-red-500'
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))
                        ) : (
                            <p>No tags selected</p>
                        )}
                    </div>
                </div>
                <div>
    <h4 className="mt-4 text-md font-semibold">Raw Materials:</h4>
    {childState.rawMaterials.map((material, index) => (
        <div key={index} className="mt-2 grid grid-cols-3 gap-4">
            
            <div>
                <label className="block text-gray-700 font-semibold">Material:</label>
                <Select
                    value={material.materialId}
                    onChange={(e) => handleRawMaterialChange(index, 'materialId', e.target.value)}
                    className="block w-full"
                >
                    <option value="">Select Material</option>
                    {rawMaterialsOptions.map((rm) => (
                        <option key={rm._id} value={rm._id}>{rm.material}</option>
                    ))}
                </Select>
            </div>
          
            <div>
                <label className="block text-gray-700 font-semibold">Quantity:</label>
                <TextInput
                    type="number"
                    value={material.quantity}
                    onChange={(e) => handleRawMaterialChange(index, 'quantity', parseFloat(e.target.value))}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                />
            </div>
          
            <div>
                <label className="block text-gray-700 font-semibold">Unit:</label>
                <TextInput
                    value={material.unit}
                    onChange={(e) => handleRawMaterialChange(index, 'unit', e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                />
            </div>
         
            <Button color="failure" size="xs" className="mt-4" onClick={() => handleRemoveRawMaterial(index)}>
                Remove
            </Button>
        </div>
    ))}
    <Button color="success" size="xs" className="mt-4" onClick={handleAddRawMaterial}>
        Add Raw Material
    </Button>
</div>


                <div className="col-span-2">
                    <label htmlFor="product_size" className="block text-sm font-medium text-gray-700 mb-2">Dimensions:</label>
                    <div className="flex items-center gap-x-4">
                        <FloatingLabel label='L (In)' variant='outlined' id="product_size.L" name="product_size.L" type="number" min={0} value={childState.product_size.L} onChange={handleChildInputChange} />
                        <FloatingLabel label='W (In)' variant='outlined' id="product_size.W" name="product_size.W" type="number" min={0} value={childState.product_size.W} onChange={handleChildInputChange} />
                        <FloatingLabel label='H (In)' variant='outlined' id="product_size.H" name="product_size.H" type="number" min={0} value={childState.product_size.H} onChange={handleChildInputChange} />
                    </div>
                </div>
                <div className="flex justify-end col-span-full">
    <Button color="success" onClick={() => setIsAddingChild(true)} disabled={isAddingChild}>
        Add Child
    </Button>
</div>

                <div className="flex justify-end col-span-full">
                    <Button color="success" onClick={addChild}>
                        {formState.children.length > 0 ? 'Update Child' : 'Add Child'}
                    </Button>
                </div>
            </div>

            {formState.children.filter(child => child.isActive).length > 0 && (
                <>
                    <div className="flex justify-between items-center my-3">
                        <p className='text-gray-700 ml-2'>Active child products</p>
                        <BarcodeGenerator children={formState.children.filter(child => child.isActive)} parentName={formState.name} />
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="mb-4">
                            <Table.Head>
                                <Table.HeadCell>SKU</Table.HeadCell>
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>Selling Price</Table.HeadCell>
                                <Table.HeadCell>Cost Price</Table.HeadCell>
                                <Table.HeadCell>Weight</Table.HeadCell>
                                <Table.HeadCell>Status</Table.HeadCell>
                                <Table.HeadCell>Stock</Table.HeadCell>
                                <Table.HeadCell>Image</Table.HeadCell>
                                <Table.HeadCell>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {formState.children.filter(child => child.isActive).map((child: any, index) => (
                                    <Table.Row key={index}>
                                        <Table.Cell>{child.SKU}</Table.Cell>
                                        <Table.Cell>{child.name}</Table.Cell>
                                        <Table.Cell>{child.selling_price}</Table.Cell>
                                        <Table.Cell>{child.cost_price}</Table.Cell>
                                        <Table.Cell>{`${child.weight.value} ${child.weight.unit}`}</Table.Cell>
                                        <Table.Cell>{child.status}</Table.Cell>
                                        <Table.Cell>{child.stock}</Table.Cell>
                                        <Table.Cell>
                                            {child.imageUrl ? (
                                                <img className='w-20 h-20 object-contain' src={child.imageUrl} alt="Child" />
                                            ) : (
                                                <MdImageNotSupported className='h-7 w-7' />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell className='flex items-center justify-between'>
                                            <Button color="success" size="xs" onClick={() => editChild(child)}>
                                                <FaPencil />
                                            </Button>
                                            <Button color="failure" size="xs" onClick={() => removeChild(child.SKU)}>
                                                <MdDelete />
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </>
            )}

            <div className="flex justify-end">
                <Button color="blue" type="submit">
                    {id ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
