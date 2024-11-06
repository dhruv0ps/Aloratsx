const NewProduct = require('../config/models/newProductgen');
const DeletedSKUs = require('../config/models/deletedSKU');
const generateSKU = require("../config/skuGenerator");

const getAllChildSKUs = async () => {
    const existingProducts = await NewProduct.find().select('children.SKU');

    const childSKUs = existingProducts.reduce((acc, product) => {
        if (Array.isArray(product.children)) {
            acc.push(...product.children.map(child => child.SKU));
        }
        return acc;
    }, []);

    return childSKUs || [];
};

const getDeletedSKUs = async () => {
    const deletedSKUs = await DeletedSKUs.find().select('SKU');
    return deletedSKUs.map(sku => sku.SKU) || [];
};

const generateUniqueChildSKUs = async (children) => {
    const allChildSKUs = await getAllChildSKUs();  // Fetch all existing SKUs
    const deletedSKUs = await getDeletedSKUs();   // Fetch deleted SKUs

    const allUsedSKUs = [...allChildSKUs, ...deletedSKUs];  
    const childrenWithUniqueSKUs = children.map((child) => {

        if (child.SKU && !child.SKU.startsWith('TEMP')) {
            return child;  // Existing children with valid SKUs are not modified
        }

        // Generate a new SKU in the format ALP0001
        let skuIndex = allUsedSKUs.length + 1;
        let childSKU = `ALP${skuIndex.toString().padStart(4, '0')}`;

        // Ensure the generated SKU is not already used (check both active and deleted SKUs)
        while (allUsedSKUs.includes(childSKU)) {
            skuIndex += 1;
            childSKU = `ALP${skuIndex.toString().padStart(4, '0')}`;
        }

        // Add the new SKU to the list of used SKUs to prevent duplication
        allUsedSKUs.push(childSKU);
        return {
            ...child,
            SKU: childSKU,
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





const getAllProducts = async ({ search, page, limit, sortField, sortOrder, minPrice, maxPrice }) => {
    try {
      const query = {};
  
      // Search logic
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { SKU: { $regex: search, $options: 'i' } },
          { "children.SKU": { $regex: search, $options: 'i' } },
          { "children.name": { $regex: search, $options: 'i' } },
        ];
      }
  
      // Sorting logic
      const sortOptions = {};
      if (sortField) {
        const sortBy = sortField === "price" ? "children.selling_price" : "name";
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      }
  
      // Fetch products without limiting results
      let products = await NewProduct.find(query)
        .sort(sortOptions)
        .populate('category');
  
      // Filter products based on price range
      products = products.map(product => {
        product.children = product.children.filter(child => {
          const meetsMinPrice = minPrice ? child.selling_price >= minPrice : true;
          const meetsMaxPrice = maxPrice ? child.selling_price <= maxPrice : true;
          return meetsMinPrice && meetsMaxPrice;
        });
        return product;
      });
  
      // Filter out products with no matching children
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
    console.log(id)
    try {
        const product = await NewProduct.findById(id)
      
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching product: ' + error.message);
    }
};




// Update an existing product by ID
const updateProductById = async (id, updateData) => {
    try {
        const product = await NewProduct.findById(id);

        if (!product) {
            throw new Error('Product not found');
        }

        // Process children only if it's an array
        if (updateData.children && Array.isArray(updateData.children)) {
            // Merge existing children with new ones
            updateData.children.forEach((newChild) => {
                const existingChild = product.children.find((child) => child.SKU === newChild.SKU);

                if (existingChild) {
                    // Update existing child properties except for SKU
                    Object.assign(existingChild, newChild, { SKU: existingChild.SKU });
                } else {
                    // Add new child (will have SKU generated later)
                    product.children.push(newChild);
                }
            });

           
            product.children = await generateUniqueChildSKUs(product.children);
        }

        
        Object.assign(product, {
            name: updateData.name,
            category: updateData.category,
            ID: updateData.ID,
            Description: updateData.Description,
        });

        const updatedProduct = await product.save();
        return updatedProduct;
    } catch (error) {
        throw new Error('Error updating product: ' + error.message);
    }
};



const deleteProductById = async (parentId, childSKU) => {
    try {
      
        const product = await NewProduct.findById(parentId);

        if (!product) {
            throw new Error('Parent product not found');
        }

       
        const updatedChildren = product.children.filter(child => child.SKU !== childSKU);

       
        if (updatedChildren.length === product.children.length) {
            throw new Error('Child product not found');
        }

        
        product.children = updatedChildren;

       
        const updatedProduct = await product.save();
        await DeletedSKUs.create({ SKU: childSKU });
        return updatedProduct; 
    } catch (error) {
        throw new Error('Error deleting child product: ' + error.message);
    }
};


const generateChildSKU = (parentSKU, index) => {
    return `${parentSKU}-${index + 1}`;
};

const updateProductStatus = async (parentProductId, childSKU, status) => {
    try {
        
        const product = await NewProduct.findOneAndUpdate(
            { _id: parentProductId, 'children.SKU': childSKU }, 
            { $set: { 'children.$.isActive': status } },         
            { new: true }                                       
        );

        if (!product) {
            throw new Error('Product or child product not found');
        }

        return product; 
    } catch (error) {
        // Catch and throw the error with a proper message
        throw new Error(error.message || 'Failed to update child product status');
    }
};
const getProductByChildIdOrSKU = async (childIdentifier) => {
    try {
        console.log(childIdentifier)
      const isSKU = typeof childIdentifier === 'string';
  
      const product = await NewProduct.findOne({
        'children._id': childIdentifier ,
        
      })
      console.log(product)
  
      if (!product) {
        throw new Error('Product not found');
      }
  
       const child = product.children.find(child => child._id.toString() === childIdentifier);

        if (!child) {
            return ({ message: 'Child not found in product' });
        }

        // Return the child SKU
        return child;
  
      return {
        product,
        child,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching product by child identifier: ' + error.message);
    }
  };
  


module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
  updateProductStatus,
    generateChildSKU,getProductByChildIdOrSKU
};
