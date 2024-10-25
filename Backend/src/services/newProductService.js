const NewProduct = require('../config/models/newProductgen');
const DeletedSKUs = require('../config/models/deletedSKU');
const generateSKU = require("../config/skuGenerator");


const getAllChildSKUs = async () => {
    const existingProducts = await NewProduct.find().select('children.SKU');

    // Collect all child SKUs from existing products
    const childSKUs = existingProducts.reduce((acc, product) => {
        if (product.children && product.children.length > 0) {
            acc.push(...product.children.map(child => child.SKU));
        }
        return acc;
    }, []);

    return childSKUs; // Return all child SKUs from the database
};

// Function to generate unique SKUs for child products in the format ALP0001, ALP0002, etc.
const generateUniqueChildSKUs = async (children) => {
    const allChildSKUs = await getAllChildSKUs(); // Fetch all child SKUs to check for uniqueness

    const childrenWithUniqueSKUs = children.map((child, index) => {
        // Start with a base SKU in the format "ALP0001", "ALP0002", etc.
        let skuIndex = index + 1;
        let childSKU = `ALP${skuIndex.toString().padStart(4, '0')}`; // Generate SKU with padding

        // Ensure the child SKU is unique across all child SKUs in the database
        while (allChildSKUs.includes(childSKU)) {
            skuIndex += 1; // Increment the SKU index if it's already used
            childSKU = `ALP${skuIndex.toString().padStart(4, '0')}`; // Regenerate the SKU
        }

        // Add the new child SKU to the list of all SKUs to avoid future duplicates
        allChildSKUs.push(childSKU);

        // Return the child object with the unique SKU
        return {
            ...child,
            SKU: childSKU, // Assign the generated unique SKU to each child
        };
    });

    return childrenWithUniqueSKUs;
};

// Function to create a new product with unique child SKUs in the ALP0001 format
const createProduct = async (productData) => {
    const childrenWithSKUs = await generateUniqueChildSKUs(productData.children); // Generate unique child SKUs

    const newProduct = new NewProduct({
        ...productData,
        children: childrenWithSKUs, // Assign children with unique SKUs
    });

    return newProduct.save(); // Save the new product to the NewProduct collection
};



// const generateChildSKUs = (parentSKU, children) => {
//     return children.map((child, index) => {
//         return {
//             ...child,
//             SKU: `${parentSKU}-CH${(index + 1).toString().padStart(2, '0')}` // Format: PARENTSKU-CH01, CH02, etc.
//         };
//     });
// };


const getAllProducts = async ({ search, page, limit, sortField, sortOrder, minPrice, maxPrice }) => {
  try {
    const query = {};

    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, 
        { SKU: { $regex: search, $options: 'i' } },  
        { "children.name": { $regex: search, $options: "i" } }  
      ];
    }

  
    const skip = (page - 1) * limit;

   
    const sortOptions = {};
    if (sortField) {
      const sortBy = sortField === "price" ? "children.selling_price" : "name";
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    
    let products = await NewProduct.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category');

   
    products = products.map(product => {
      product.children = product.children.filter(child => {
       
        const meetsMinPrice = minPrice ? child.selling_price >= minPrice : true;
        const meetsMaxPrice = maxPrice ? child.selling_price <= maxPrice : true;
        return meetsMinPrice && meetsMaxPrice;
      });
      return product;
    });

   
    products = products.filter(product => product.children.length > 0);

   
    const totalProducts = products.length;

    return {
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit)
    };
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
};

  
  // Create a new product

  

// Get a product by ID
const getProductById = async (id) => {
    try {
        const product = await NewProduct.findById(id).populate('category');
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
    }
};




// Update an existing product by ID
const updateProductById = async (id, updateData) => {
    try {
        const product = await NewProduct.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    } catch (error) {
        throw new Error('Error updating product: ' + error.message);
    }
};

// Delete a product by ID
const deleteProductById = async (id) => {
    try {
        const product = await NewProduct.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (product) {
            await DeletedSKUs.create({ SKU: product.SKU });  // Add the deleted SKU to the deletedSKU collection
        }
        return product;
    } catch (error) {
        throw new Error('Error deleting product: ' + error.message);
    }
};

// Generate child SKU
const generateChildSKU = (parentSKU, index) => {
    return `${parentSKU}-${index + 1}`;
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
  
    generateChildSKU
};
