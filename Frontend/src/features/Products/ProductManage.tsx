import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextInput, Select } from 'flowbite-react';
import { MdDelete } from 'react-icons/md';
import { FaChevronLeft } from 'react-icons/fa6';
import Loading from '../../util/Loading';
import { productApis } from '../../config/apiRoutes/productRoutes';
import { toast } from 'react-toastify';




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

    const [childState, setChildState] = useState<Child[]>([
        {
            SKU: '',
            name: '',
            selling_price: 0,
            cost_price: 0,
            weight: { value: 0, unit: 'lb' },
            status: 'IN STOCK',
            stock: 0,
            isActive: true,
            firmness: '',
            description: '',
            tags: [],
            rawMaterials: [{ material: '', materialId: '', quantity: 0, unit: '' }],
            product_size: { L: 0, W: 0, H: 0 },
        },
    ]);

    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [rawMaterialsOptions, setRawMaterialsOptions] = useState<RawMaterial[]>([]);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
console.log(tags)

// useEffect(() => {
//     fetchAllTags();
//     fetchRawMaterials();
//     fetchCategories();
//     toast.success("Test toast notification!");

//     if (id) {
//         console.log("ID is present:", id); // Debug log
//         fetchProductDetails(id);
//         toast.success("ID-based toast notification!");
//     } else {
//         console.log("ID is not present or invalid:", id); // Debug log for when ID is not valid
//     }
// }, [id]);

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
            setLoading(true);
            const response = await productApis.getProductById(productId);
            if (response.status) {
                const productData = response.data;
                
                setFormState({
                    name: productData.name,
                    categories: productData.category ||[],
                    ID: productData.ID,
                    Description: productData.Description,
                    children: productData.children,
                });
                setChildState(productData.children);
            }
        } catch (error: any) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch initial data
                fetchAllTags();
                fetchRawMaterials();
                fetchCategories();
    
                if (id) {
                    console.log("ID is present:", id); // Debug log
                    await fetchProductDetails(id);
                    // Use a delay to ensure everything is ready
                    setTimeout(() => {
                        toast.success("ID-based toast notification!");
                    }, 1000);
                } else {
                    console.log("ID is not present or invalid:", id); // Debug log
                    toast.info("No ID provided.");
                }
            } catch (error) {
                console.error("Error during data loading:", error);
                toast.error("Failed to load initial data.");
            }
        };
    
        loadData();
    }, [id]);
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };
    const handleChildInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedChildren = [...childState];
        const child = updatedChildren[index];
    
        // Explicitly handle the weight fields
        if (name === 'weight.value') {
            child.weight.value = parseFloat(value); // Ensure it's parsed as a number
        } else if (name === 'weight.unit') {
            child.weight.unit = value;
        } 
        // Explicitly handle the product size fields
        else if (name === 'product_size.L') {
            child.product_size.L = parseFloat(value);
        } else if (name === 'product_size.W') {
            child.product_size.W = parseFloat(value);
        } else if (name === 'product_size.H') {
            child.product_size.H = parseFloat(value);
        } 
        // Handle other fields dynamically
        else {
            (child as any)[name] = value; // Handle other string-based fields safely
        }
    
        setChildState(updatedChildren);
    };
    

    const handleAddChild = () => {
        setChildState([
            ...childState,
            {
                SKU: '',
                name: '',
                selling_price: 0,
                cost_price: 0,
                weight: { value: 0, unit: 'lb' },
                status: 'IN STOCK',
                stock: 0,
                isActive: true,
                firmness: '',
                description: '',
                tags: [],
                rawMaterials: [{ material: '', materialId: '', quantity: 0, unit: '' }],
                product_size: { L: 0, W: 0, H: 0 },
            },
        ]);
    };

    const handleRemoveChild = (index: number) => {
        const updatedChildren = [...childState];
        updatedChildren.splice(index, 1);
        setChildState(updatedChildren);
    };

    const handleTagChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTagId = e.target.value;
        const selectedTag = availableTags.find((tag) => tag._id === selectedTagId);

        if (selectedTag && !childState[index].tags.some((tag) => tag._id === selectedTagId)) {
            const updatedChildren = [...childState];
            updatedChildren[index].tags.push({ _id: selectedTag._id, name: selectedTag.name });
            setChildState(updatedChildren);
        }
    };

    const handleRemoveTag = (childIndex: number, tagIndex: number) => {
        const updatedChildren = [...childState];
        updatedChildren[childIndex].tags.splice(tagIndex, 1);
        setChildState(updatedChildren);
    };

    const handleAddRawMaterial = (childIndex: number) => {
        const updatedChildren = [...childState];
        updatedChildren[childIndex].rawMaterials.push({ material: '', materialId: '', quantity: 0, unit: '' });
        setChildState(updatedChildren);
    };

    const handleRawMaterialChange = (childIndex: number, materialIndex: number, field: string, value: string | number) => {
        const updatedChildren = [...childState];
        const rawMaterial = updatedChildren[childIndex].rawMaterials[materialIndex];

        if (field === 'materialId') {
            const selectedRawMaterial = rawMaterialsOptions.find((material) => material._id === value);
            if (selectedRawMaterial) {
                rawMaterial.materialId = selectedRawMaterial._id;
                rawMaterial.material = selectedRawMaterial.material;
                rawMaterial.unit = selectedRawMaterial.measuringUnit;
            }
        } else if (field === 'quantity') {
            rawMaterial.quantity = value as number;
        } else if (field === 'unit') {
            rawMaterial.unit = value as string;
        }

        setChildState(updatedChildren);
    };

    const handleRemoveRawMaterial = (childIndex: number, materialIndex: number) => {
        const updatedChildren = [...childState];
        updatedChildren[childIndex].rawMaterials.splice(materialIndex, 1);
        setChildState(updatedChildren);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategoryId = e.target.value;
        const selectedCategory = categories.find((category) => category._id === selectedCategoryId);

        if (selectedCategory && !formState.categories.some((cat) => cat._id === selectedCategoryId)) {
            setFormState((prev) => ({
                ...prev,
                categories: [...prev.categories, selectedCategory],
            }));

            setCategories((prev) => prev.filter((cat) => cat._id !== selectedCategoryId));
        }
    };

    const handleRemoveCategory = (categoryToRemove: Category) => {
        setFormState((prev) => ({
            ...prev,
            categories: prev.categories.filter((category) => category._id !== categoryToRemove._id),
        }));

        setCategories((prev) => [...prev, categoryToRemove]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        const productData = {
            name: formState.name,
            category: formState.categories.map((cat) => ({ _id: cat._id, name: cat.name })),  // Extract only _id and name
            ID: formState.ID,
            Description: formState.Description,
            children: childState,
        };
    
        try {
            let response;
            if (id) {
              
                response = await productApis.updateProduct(id, productData);
                console.log('Update Response:', response);  
               
            } else {
              
                response = await productApis.createProduct(productData);
                console.log('Create Response:', response); 
            }
    
                  console.log('Response status:', response?.status);
            
           if(response.status) {
            toast.success("Product saved Sucessfully")
           }
            // if (response?.status === 201) {
            //     console.log('Triggering success toast for product creation');
            //     toast.success('Product created successfully!');
            // } else if (response?.status === 200) {
            //     console.log('Triggering success toast for product update');
            //     toast.success('Product updated successfully!');
            // } else {
            //     console.log('Triggering error toast');
            //     toast.error(response.message || 'Failed to submit product');
            // }
    
            
            setTimeout(() => {
                navigate('/yellowadmin/products/view');
            }, 1000);  
    
        } catch (error) {
            console.error('Error submitting product:', error);
            toast.error('An error occurred while submitting the product.');
        } finally {
            setLoading(false);
        }
    };
    
    
    
    if (loading) return <Loading />;
  
    return (
        <div>
  <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-8 shadow-md rounded-lg">
    <div className="mb-6 flex items-center justify-between">
      <Button color="gray" onClick={() => navigate(-1)}>
        <span className="flex gap-2 items-center">
          <FaChevronLeft /> Back
        </span>
      </Button>
      <h2 className="text-2xl font-semibold">{id ? 'Edit Product' : 'Add Product'}</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 bg-white  p-8 shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Product Name:
        </label>
        <TextInput id="name" name="name" value={formState.name} onChange={handleInputChange} required />
      </div>

      <div>
        <label htmlFor="ID" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Product ID:
        </label>
        <TextInput id="ID" name="ID" value={formState.ID} onChange={handleInputChange} required />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Description:
        </label>
        <TextInput id="Description" name="Description" value={formState.Description} onChange={handleInputChange} required />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">
          Select Categories:
        </label>
        <Select id="categories" value="" onChange={handleCategoryChange} className="block w-full">
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
        <div className="mt-2">
          {formState.categories.length > 0 ? (
            formState.categories.map((category, index) => (
              <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-sm mr-2 mt-2">
                {category.name}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 text-red-500"
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
    </div>

    <hr className="my-6" />

    {childState.map((child, index) => (
      <div key={index} className="border border-gray-300 p-4 my-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor={`child_name_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Child Name:
            </label>
            <TextInput
              id={`child_name_${index}`}
              name="name"
              value={child.name}
              onChange={(e) => handleChildInputChange(index, e)}
              required
            />
          </div>

          <div>
            <label htmlFor={`selling_price_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price:
            </label>
            <TextInput
              id={`selling_price_${index}`}
              name="selling_price"
              type="number"
              min={0}
              value={child.selling_price}
              onChange={(e) => handleChildInputChange(index, e)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor={`weight_value_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Weight:
            </label>
            <div className="flex gap-4">
              <TextInput
                id={`weight_value_${index}`}
                name="weight.value"
                type="number"
                min={0}
                value={child.weight.value}
                onChange={(e) => handleChildInputChange(index, e)}
              />
              <Select
                name="weight.unit"
                value={child.weight.unit}
                onChange={(e) => handleChildInputChange(index, e)}
                className="w-24"
              >
                <option value="lb">lb</option>
                <option value="kg">kg</option>
              </Select>
            </div>
          </div>

          {id && (
            <div>
              <label htmlFor={`child_sku_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                Child SKU:
              </label>
              <TextInput
                id={`child_sku_${index}`}
                name="SKU"
                value={child.SKU}
                onChange={(e) => handleChildInputChange(index, e)}
                required
                disabled
                placeholder="SKU (Read-Only in Edit Mode)"
              />
            </div>
          )}

          <div>
            <label htmlFor={`firmness_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Firmness:
            </label>
            <Select
              id={`firmness_${index}`}
              name="firmness"
              value={child.firmness}
              onChange={(e) => handleChildInputChange(index, e)}
              className="block w-full"
            >
              <option value="">Select firmness</option>
              <option value="Ultra Plush">Ultra Plush</option>
              <option value="Plush">Plush</option>
              <option value="Medium">Medium</option>
              <option value="Firm">Firm</option>
              <option value="Extra Firm">Extra Firm</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor={`dimensions_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions (L x W x H):
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor={`product_size_L_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                  Length:
                </label>
                <TextInput
                  id={`product_size_L_${index}`}
                  name="product_size.L"
                  type="number"
                  placeholder="Length"
                  min={0}
                  value={child.product_size.L}
                  onChange={(e) => handleChildInputChange(index, e)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`product_size_W_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                  Width:
                </label>
                <TextInput
                  id={`product_size_W_${index}`}
                  name="product_size.W"
                  type="number"
                  placeholder="Width"
                  min={0}
                  value={child.product_size.W}
                  onChange={(e) => handleChildInputChange(index, e)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`product_size_H_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                  Height:
                </label>
                <TextInput
                  id={`product_size_H_${index}`}
                  name="product_size.H"
                  type="number"
                  placeholder="Height"
                  min={0}
                  value={child.product_size.H}
                  onChange={(e) => handleChildInputChange(index, e)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Select Tags:
          </label>
          <Select id="tags" value="" onChange={(e) => handleTagChange(index, e)} className="block w-full">
            <option value="">Select a tag</option>
            {availableTags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </Select>
          <div className="mt-2">
            {child.tags.length > 0 ? (
              child.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-block bg-gray-200 rounded-full px-2 py-1 text-sm mr-2 mt-2"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index, tagIndex)}
                    className="ml-1 text-red-500"
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

        {/* Raw Materials Section */}
        <div className="mb-4">
          <h4 className="text-md font-semibold">Raw Materials:</h4>
          {child.rawMaterials.map((material, materialIndex) => (
            <div key={materialIndex} className="grid grid-cols-3 gap-4 mb-4">
              <Select
                value={material.materialId}
                onChange={(e) => handleRawMaterialChange(index, materialIndex, 'materialId', e.target.value)}
                className="block w-full"
              >
                <option value="">Select Material</option>
                {rawMaterialsOptions.map((rm) => (
                  <option key={rm._id} value={rm._id}>
                    {rm.material}
                  </option>
                ))}
              </Select>
              <TextInput
                type="number"
                value={material.quantity}
                placeholder="Quantity"
                onChange={(e) =>
                  handleRawMaterialChange(index, materialIndex, 'quantity', parseFloat(e.target.value))
                }
              />
              <TextInput
                value={material.unit}
                placeholder="Unit"
                onChange={(e) => handleRawMaterialChange(index, materialIndex, 'unit', e.target.value)}
              />
              <Button color="failure" size="xs" onClick={() => handleRemoveRawMaterial(index, materialIndex)}>
                Remove
              </Button>
            </div>
          ))}
          <Button color="success" size="xs" onClick={() => handleAddRawMaterial(index)}>
            Add Raw Material
          </Button>
        </div>

        
      </div>
      <div className="flex justify-end mt-4 ">
          <Button color="failure" onClick={() => handleRemoveChild(index)}>
            <MdDelete className="h-5 w-5 " /> Remove Child
          </Button>
        </div>
      </div>
    ))}

    <div className="flex justify-end mb-4">
      <Button color="success" onClick={handleAddChild}>Add Another Child</Button>
    </div>

    <div className="flex justify-end">
      <Button color="blue" type="submit">
        {id ? 'Update Product' : 'Create Product'}
      </Button>
    </div>
  </form>
</div>

    );
};

export default ProductForm;

