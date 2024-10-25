const NewProduct = require('../config/models/newProductgen');
const DeletedSKUs = require('../config/models/deletedSKU');
const generateSKU = require("../config/skuGenerator");


const generateNextSKU = async () => {
  
    const existingProducts = await NewProduct.find({ isActive: true }).select('SKU children.SKU');
    const existingSKUs = [];

    
    existingProducts.forEach(product => {
       
        if (product.SKU) existingSKUs.push(product.SKU);

       
        if (product.children && product.children.length > 0) {
            product.children.forEach(child => {
                if (child.SKU) existingSKUs.push(child.SKU);
            });
        }
    });

   
    const deletedSKUs = await DeletedSKUs.find().select('SKU');

  
    const allSKUs = [...existingSKUs, ...deletedSKUs.map(deleted => deleted.SKU)];

    
    const lastProduct = await NewProduct.findOne({ isActive: true })
        .sort({ 'children.SKU': -1, SKU: -1 }) // Sort by both product and children SKUs
        .select('SKU children.SKU');

    let newSKU;
    let newSKUIndex;

    
    if (lastProduct) {
        const allProductSKUs = [lastProduct.SKU]; 

        if (lastProduct.children && lastProduct.children.length > 0) {
            lastProduct.children.forEach(child => {
                if (child.SKU) allProductSKUs.push(child.SKU);
            });
        }

        
        allProductSKUs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        const lastSKU = allProductSKUs[allProductSKUs.length - 1];
        const skuNumber = parseInt(lastSKU.replace(/[^\d]/g, ''), 10);

        if (isNaN(skuNumber)) {
            throw new Error('Invalid SKU format in database.');
        }

        newSKUIndex = skuNumber + 1;
        newSKU = `ALP${newSKUIndex.toString().padStart(4, '0')}`;
    } else {
        newSKU = 'ALP0001'; 
        newSKUIndex = 1;
    }

   
    while (allSKUs.includes(newSKU)) {
        newSKUIndex += 1;
        newSKU = `ALP${newSKUIndex.toString().padStart(4, '0')}`;
    }

    return newSKU;
};




const generateChildSKUs = (parentSKU, children) => {
    return children.map((child, index) => {
        return {
            ...child,
            SKU: `${parentSKU}-CH${(index + 1).toString().padStart(2, '0')}` // Format: PARENTSKU-CH01, CH02, etc.
        };
    });
};


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

// Create a new product
const createProduct = async (productData) => {
    try {
        productData.SKU = await generateNextSKU(); // Generate a unique SKU for the main product
        if (productData.children && productData.children.length > 0) {
            // Generate unique SKUs for each child
            productData.children = generateChildSKUs(productData.SKU, productData.children);
        }
        const product = new NewProduct(productData);
        return await product.save();
    } catch (error) {
        throw new Error('Error creating product: ' + error.message);
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
    generateNextSKU,
    generateChildSKU
};
