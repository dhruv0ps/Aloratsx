// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Select, { MultiValue } from 'react-select';

// interface RawMaterial {
//   material: string;
//   quantity: string;
//   unit: string;
// }

// interface Tag {
//   _id: string;
//   name: string;
// }

// interface Variant {
//   height: string;
//   width: string;
//   length: string;
//   firmness: string;
//   price: string;
//   weight: string;
//   color: string;
//   childName: string;
//   rawMaterials: RawMaterial[];  // Correct typing
//   tags: string[];  // Correct typing as string[]
// }

// interface Category {
//   value: string;
//   label: string;
// }

// const NewProduct: React.FC = () => {
//   const [parentName, setParentName] = useState<string>('');
//   const [variants, setVariants] = useState<Variant[]>([
//     {
//       height: '',
//       width: '',
//       length: '',
//       firmness: '',
//       price: '',
//       weight: '',
//       color: '',
//       childName: '',
//       rawMaterials: [{ material: '', quantity: '', unit: '' }],
//       tags: [],
//     },
//   ]);
//   const [sku, setSku] = useState<string>('');
//   const [description, setDescription] = useState<string>('');
//   const [availableTags, setAvailableTags] = useState<Tag[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
//   const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const token = localStorage.getItem('token');

//   // Add a new variant
//   const handleAddVariant = () => {
//     setVariants([
//       ...variants,
//       {
//         height: '',
//         width: '',
//         length: '',
//         firmness: '',
//         price: '',
//         weight: '',
//         color: '',
//         childName: '',
//         rawMaterials: [{ material: '', quantity: '', unit: '' }],
//         tags: [],
//       },
//     ]);
//   };

//   // Remove a variant by index
//   const handleRemoveVariant = (index: number) => {
//     const updatedVariants = variants.filter((_, idx) => idx !== index);
//     setVariants(updatedVariants);
//   };

//   // Handle changes to variant fields (except rawMaterials and tags)
//   const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
//     const updatedVariants = [...variants];
//     // updatedVariants[index][field] = value;  // No array assignments here
//     setVariants(updatedVariants);
//   };

//   // Add a new raw material to a variant
//   const handleAddRawMaterial = (index: number) => {
//     const newVariants = [...variants];
//     newVariants[index].rawMaterials.push({ material: '', quantity: '', unit: '' });
//     setVariants(newVariants);
//   };

//   // Remove a raw material from a variant
//   const handleRemoveRawMaterial = (variantIndex: number, materialIndex: number) => {
//     setVariants((prevVariants) => {
//       const updatedVariants = [...prevVariants];
//       updatedVariants[variantIndex].rawMaterials.splice(materialIndex, 1);
//       return updatedVariants;
//     });
//   };

//   // Handle changes to raw material fields (rawMaterials is always an array)
//   const handleRawMaterialChange = (
//     index: number,
//     materialIndex: number,
//     field: keyof RawMaterial,
//     value: string
//   ) => {
//     setVariants((prevVariants) => {
//       const updatedVariants = [...prevVariants];
//       updatedVariants[index].rawMaterials[materialIndex][field] = value;  // Correctly update array
//       return updatedVariants;
//     });
//   };

//   // Handle tag changes (tags is always an array of strings)
//   const handleTagChange = (index: number, selectedTags: MultiValue<{ label: string; value: string }>) => {
//     const newVariants = [...variants];
//     newVariants[index].tags = selectedTags.map((tag) => tag.label);  // Ensure it's an array of strings
//     setVariants(newVariants);
//   };

//   // Remove a tag from a variant
//   const handleRemoveTag = (index: number, tagToRemove: string) => {
//     setVariants((prevVariants) => {
//       const newVariants = [...prevVariants];
//       const selectedVariant = newVariants[index];
//       if (selectedVariant && selectedVariant.tags) {
//         selectedVariant.tags = selectedVariant.tags.filter((tag) => tag !== tagToRemove);  // Filter string array
//       }
//       return newVariants;
//     });
//   };

//   // Validate form inputs
//   const validateInputs = () => {
//     for (const variant of variants) {
//       if (
//         !variant.firmness ||
//         !variant.price ||
//         !variant.weight ||
//         variant.rawMaterials.some((m) => !m.material || !m.quantity || !m.unit)
//       ) {
//         toast.error('Please fill in all required fields for each variant.');
//         return false;
//       }
//     }
//     return true;
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateInputs()) return;

//     setLoading(true);
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, {
//         parentName,
//         variants,
//         description,
//         category: selectedCategories.map((category) => category.value),
//       });

//       setSku(response.data.sku);
//       toast.success('Product added successfully!');
//       resetForm();
//     } catch (error: any) {
//       toast.error('Error adding product: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset the form
//   const resetForm = () => {
//     setParentName('');
//     setVariants([
//       {
//         height: '',
//         width: '',
//         length: '',
//         firmness: '',
//         price: '',
//         weight: '',
//         color: '',
//         childName: '',
//         rawMaterials: [{ material: '', quantity: '', unit: '' }],
//         tags: [],
//       },
//     ]);
//     setDescription('');
//     setSelectedCategories([]);
//   };

//   // Fetch available tags
//   useEffect(() => {
//     axios
//       .get(`${process.env.REACT_APP_API_URL}/api/tags`)
//       .then((response) => {
//         setAvailableTags(response.data);
//       })
//       .catch((error) => {
//         console.error('There was an error fetching tags!', error);
//       });
//   }, []);

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const categoryOptions = response.data.map((category: any) => ({
//           value: category._id,
//           label: category.name,
//         }));
//         setCategories(categoryOptions);
//       } catch (error) {
//         console.error('There was an error fetching categories!', error);
//         // toast.error('Error fetching categories: ' + error.message);
//       }
//     };

//     fetchCategories();
//   }, [token]);

//   // Fetch raw materials
//   useEffect(() => {
//     const fetchRawMaterials = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/raw-materials`);
//         setRawMaterials(response.data);
//       } catch (error) {
//         console.error('Error fetching raw materials:', error);
//       }
//     };

//     fetchRawMaterials();
//   }, []);

//   // Handle category change
//   const handleCategoryChange = (selectedOptions: MultiValue<Category>) => {
//     // setSelectedCategories(selectedOptions);
//   };
//   return (
//     <div className="container w-full bg-navbar ml-10 mr-10 mx-auto mt-5 px-4 max-h-[80vh] overflow-y-auto">
//       <ToastContainer />
//       <h2 className="text-2xl font-bold text-center mb-6">Add new Product</h2>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-gray-700 font-semibold">Parent Name:</label>
//             <input
//               type="text"
//               value={parentName}
//               onChange={(e) => setParentName(e.target.value)}
//               required
//               className="mt-1 p-2 border border-gray-300 rounded w-full"
//             />
//           </div>
//           <div>
//             <label className="block text-gray-700 font-semibold">SKU:</label>
//             <input
//               type="text"
//               value={sku}
//               readOnly
//               placeholder="Auto-generated SKU"
//               className="mt-1 p-2 border border-gray-300 rounded w-full bg-gray-100"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-gray-700 font-semibold">Product Description:</label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//               className="mt-1 p-2 border border-gray-300 rounded w-full"
//             />
//           </div>
//           <div className="md:col-span-1">
//             <label htmlFor="category-select" className="block text-gray-700 font-semibold">
//               Select a Category
//             </label>
//             {categories.length > 0 ? (
//               <Select
//                 id="category-select"
//                 options={categories}
//                 isMulti
//                 value={selectedCategories}
//                 onChange={handleCategoryChange}
//                 placeholder="Choose categories"
//                 className="mt-1 block w-full"
//               />
//             ) : (
//               <p>Loading categories...</p>
//             )}
//           </div>
//         </div>

//         <div className="mt-5">
//           <h3 className="text-lg font-bold">Variants:</h3>
//           {variants.map((variant, index) => (
//             <div key={index} className="border border-gray-300 p-4 rounded-md mt-2">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-gray-700 font-semibold">Child Name:</label>
//                   <input
//                     type="text"
//                     value={variant.childName}
//                     onChange={(e) => handleVariantChange(index, 'childName', e.target.value)}
//                     required
//                     className="mt-1 p-2 border border-gray-300 rounded w-full"
//                   />
//                 </div>

//                 {/* Additional fields for height, width, length, etc. */}

//                 <h4 className="mt-4 text-md font-semibold">Tags:</h4>
//                 <Select
//                   isMulti
//                   options={availableTags.map((tag) => ({
//                     label: tag.name,
//                     value: tag._id,
//                   }))}
//                   value={variant.tags.map((tagName) => ({
//                     label: tagName,
//                     value: tagName,
//                   }))}
//                   onChange={(selected) => handleTagChange(index, selected)}
//                   placeholder="Select tags"
//                   className="mt-1 block w-full"
//                 />
//                 <div className="mt-2">
//                   {variant.tags.length > 0 ? (
//                     variant.tags.map((tag, tagIndex) => (
//                       <span
//                         key={tagIndex}
//                         className="inline-block bg-gray-200 rounded-full px-2 py-1 text-sm mr-2"
//                       >
//                         {tag}
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveTag(index, tag)}
//                           className="ml-2 text-red-500"
//                         >
//                           &times;
//                         </button>
//                       </span>
//                     ))
//                   ) : (
//                     <p>No tags selected</p>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => handleRemoveVariant(index)}
//                 className="mt-4 bg-red-500 text-white p-2 rounded"
//               >
//                 Remove Variant
//               </button>
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={handleAddVariant}
//             className="mt-4 bg-blue-500 text-white p-2 rounded"
//           >
//             Add Variant
//           </button>
//         </div>

//         <div className="flex justify-end w-full">
//           <button
//             type="submit"
//             className="mt-6 bg-green-500 text-white p-3 rounded w-48"
//             disabled={loading}
//           >
//             {loading ? 'Updating Product...' : 'Update Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default NewProduct;

