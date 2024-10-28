const productService = require("../services/newProductService");


const getAllProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, sortField, sortOrder, minPrice, maxPrice } = req.query;

        const result = await  productService.getAllProducts({
            search,
            page: parseInt(page),
            limit: parseInt(limit),
            sortField,
            sortOrder,
            minPrice: parseFloat(minPrice),
            maxPrice: parseFloat(maxPrice),
        });

        res.status(200).json({
            status: true,
            data: result.products,
            totalProducts: result.totalProducts,
            totalPages: result.totalPages,
        });
    }catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


// Get a product by ID
const getProductById = async (req, res) => {
    const { id } = req.params;
   
    try {
        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }
        
        res.status(200).json({ status: true, data: product });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Create a new product
const createProduct = async (req, res) => {
    try {
        const {children} =req.body
     
        const { name, category, ID, Description } = req.body; // For form fields
         console.log(name);
         
       
        const childrenData = JSON.parse(req.body.childrenData || '[]'); // Parse if needed
       
        const productData = {
            name,
            category,
            ID,
            Description,
            children: children,
           // Generate SKU here
        };

        const newProduct = await productService.createProduct(productData);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
};


// Update a product by ID
const updateProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedProduct = await productService.updateProductById(id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }
        res.status(200).json({ status: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        
        res.status(400).json({ status: false, message: error.message });
    }
};

// Delete a product by ID
const deleteProductById = async (req, res) => {
    const { parentId, childSKU } = req.params; // Extract parentId and childSKU from the URL parameters

    try {
        const updatedProduct = await productService.deleteProductById(parentId, childSKU);

        res.status(200).json({
            status: true,
            message: 'Child product deleted successfully',
            data: updatedProduct,
        });
    } catch (error) {
        console.log(error)

        res.status(500).json({ status: false, message: error.message });
    }
};
const updateProductStatus = async(req,res) => {
    const { parentProductId, childSKU } = req.params;
    const { isActive } = req.body;

    try{
         
            const product = await productService.updateProductStatus(parentProductId, childSKU, isActive);
            const statusMessage = isActive ? 'activated' : 'deactivated';
        res.status(200).json({  status: true, message: `Child product ${statusMessage} successfully`, product });
    }   
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update child product status' });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
    updateProductStatus
};
