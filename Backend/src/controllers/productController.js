const productServices = require("../services/productService");
const fs = require('fs').promises;
const ExcelService = require('../services/excelService');

class ProductController {
  addProduct = async (req, res, next) => {
    try {
      const productData = JSON.parse(req.body.productData);
      const childrenData = JSON.parse(req.body.childrenData);
      // const heroImage = req.files["heroImage"]
      //   ? req.files["heroImage"][0]
      //   : null;
      // const childrenImages = req.files["childrenImages"] || [];

      const fullProductData = {
        ...productData,
        // heroImage: heroImage ? heroImage.path : null,
        children: childrenData.map((child, index) => ({
          ...child,
          // image: childrenImages[index]
          //   ? {
          //     filename: childrenImages[index].filename,
          //     path: childrenImages[index].path,
          //   }
          //   : null,
        })),
      };

      const product = await productServices.addProduct(fullProductData);
      return res.json({ status: true, data: product, err: {} });
    } catch (error) {
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const product = await productServices.getProductById(req.params.id);
      if (product) {
        return res.json({ status: true, data: product, err: {} });
      } else {
        return res.json({ status: false, data: {}, err: "Product not found" });
      }
    } catch (error) {
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  getAllProducts = async (req, res, next) => {
    try {
      const { page, limit, filters, sort } = req.body;
      const products = await productServices.getAllPagedProducts(
        parseInt(page),
        parseInt(limit),
        filters,
        sort
      );
      return res.json({ status: true, data: products, err: {} });
    } catch (error) {
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  getAllProduct = async (req, res, next) => {
    try {
      const { token } = req.body;
      const products = await productServices.getAllProducts(token);
      return res.json({ status: true, data: products, err: {} });
    } catch (error) {
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      // console.log(req.body.productData)
      const productData = JSON.parse(req.body.productData);
      const childrenData = JSON.parse(req.body.childrenData);

      // const heroImage =
      //   req.files.length > 0
      //     ? req.files.find((file) => file.fieldname === "heroImage")
      //     : undefined;
      // const childrenImages =
      //   req.files.length > 0
      //     ? req.files.filter((file) => file.fieldname === "childrenImages")
      //     : [];

      const existingProduct = await productServices.getProductById(
        req.params.id
      );

      const fullProductData = {
        ...productData,
        // heroImage: heroImage ? heroImage.path : existingProduct.heroImage,
        children: childrenData.map((child, index) => {
          const existingChild = existingProduct.children.find(
            (c) => c.SKU === child.SKU
          );
          return {
            ...child,
            // image: childrenImages[index]
            //   ? {
            //     filename: childrenImages[index].filename,
            //     path: childrenImages[index].path,
            //   }
            //   : existingChild
            //     ? existingChild.image
            //     : null,
          };
        }),
      };

      const product = await productServices.updateProduct(
        req.params.id,
        fullProductData
      );
      return res.json({ status: true, data: product, err: {} });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  getNextProductId = async (req, res, next) => {
    try {
      const nextId = await productServices.getPreSaveID();
      return res.json({
        status: true,
        data: { nextProductId: nextId },
        err: {},
      });
    } catch (error) {
      return res.json({ status: false, data: {}, err: error.message });
    }
  };

  searchProductByName = async (req, res) => {
    try {
      const { name } = req.params;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Please provide a name to search" });
      }

      const products = await productServices.searchByName(name);

      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({ message: "No products found matching the search criteria" });
      }

      return res.status(200).json({ products });
    } catch (error) {
      console.error("Error in searchProductByName:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getDiscountedProducts = async (req, res) => {
    try {
      const dealerId = req.params.dealerId;
      const discountedProducts = await productServices.getDiscountedProducts(
        dealerId
      );

      if (!discountedProducts || discountedProducts.length === 0) {
        return res
          .status(404)
          .json({ message: "No products found for this dealer." });
      }

      return res.status(200).json(discountedProducts);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  bulkUpload = async (req, res) => {
    try {
      // console.log(req.file);
      const uploadedFile = req.files?.[0] || req.file;
      if (!uploadedFile) {
        return res.status(400).json({
          status: false,
          data: {},
          err: "No file uploaded"
        });
      }

      let productData;
      try {
        if (req.file.mimetype === 'text/csv') {
          productData = await ExcelService.parseCSV(req.file.path);
        } else {
          productData = ExcelService.parseExcel(req.file.path);
        }
      } catch (error) {
        return res.status(400).json({
          status: false,
          data: {},
          err: `Error parsing file: ${error.message}`
        });
      }

      const result = await productServices.bulkAddProducts(productData);

      return res.json({
        status: true,
        data: result,
        err: null
      });
    } catch (error) {
      // console.log(error)
      return res.status(500).json({
        status: false,
        data: {},
        err: error.message
      });
    } finally {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }
  };

}

module.exports = new ProductController();
