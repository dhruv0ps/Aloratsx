const { default: mongoose } = require("mongoose");
const { Product } = require("../config/models/ProductModel");
const Category = require("../config/models/categoryModel");
const SubCategory = require("../config/models/subcategoryModel");
const Color = require("../config/models/colorModel");
const { ApprovedDealer } = require("../config/models/dealerApproved");
const jwtService = require("../services/jwt-service");
const jwtServices = new jwtService();

const productServices = {
  addProduct: async (productData) => {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      return await Product.findById(id)
        .populate("category")
        .populate("children.color");
    } catch (error) {
      throw error;
    }
  },

  getAllProducts: async (token) => {
    try {
      const dealerToken = token;

      if (dealerToken) {
        const decodedToken = await jwtServices.verifyToken(dealerToken);
        const dealerId = decodedToken.id;
        const dealer = await ApprovedDealer.findById(dealerId).select('priceDiscount');

        if (!dealer) {
          throw new Error('Dealer not found');
        }

        const priceDiscount = dealer.priceDiscount ? parseFloat(dealer.priceDiscount) : 0;

        // Fetch products and ensure children details are included
        const products = await Product.aggregate([
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $lookup: {
              from: 'colors',
              localField: 'children.color',
              foreignField: '_id',
              as: 'children.color'
            }
          },
          {
            $addFields: {
              children: {
                $map: {
                  input: "$children",
                  as: "child",
                  in: {
                    _id: "$$child._id",
                    SKU: "$$child.SKU",
                    name: "$$child.name",
                    color: "$$child.color",
                    selling_price: {
                      $cond: {
                        if: { $gt: ["$$child.selling_price", 0] },
                        then: {
                          $subtract: [
                            "$$child.selling_price",
                            {
                              $multiply: ["$$child.selling_price", priceDiscount / 100]
                            }
                          ]
                        },
                        else: "$$child.selling_price"
                      }
                    },
                    cost_price: "$$child.cost_price",
                    weight: "$$child.weight",
                    status: "$$child.status",
                    isActive: "$$child.isActive",
                    image: "$$child.image",
                    stock: "$$child.stock",
                    description: "$$child.description"
                  }
                }
              }
            }
          }
        ]);

        return products;

      } else {
        // If no dealer is logged in, return normal products without any discount
        return await Product.find()
          .populate("category")
          .populate("children.color");
      }
    } catch (error) {
      throw error;
    }
  },

  getAllPagedProducts: async (page = 1, limit = 20, filters = {}, sort = {}) => {
    console.log(filters)
    try {
      const skip = (page - 1) * limit;
      let matchStage = {};

      // Separate search for name and SKU
      if (filters.nameSearch) {
        const nameRegex = new RegExp(filters.nameSearch, "i");
        matchStage.$or = [
          { name: nameRegex },
          { "children.name": nameRegex },
        ];
      }

      if (filters.skuSearch) {
        matchStage["children.SKU"] = new RegExp(filters.skuSearch, "i");
      }

      // Filter by category
      if (filters.category) {
        const matchingCategories = await Category.find({
          name: filters.category,
        });
        const categoryIds = matchingCategories.map((ctgry) => ctgry._id);
        matchStage.category = { $in: categoryIds };
      }

      // Filter by subcategory
      if (filters.subCategory) {
        const matchingSubCategories = await SubCategory.find({
          name: filters.subCategory,
        });
        const subCategoryIds = matchingSubCategories.map((subCtgry) => subCtgry._id);
        matchStage.subCategory = { $in: subCategoryIds };
      }

      // Filter by child status
      if (filters.status) {
        matchStage["children.status"] = filters.status;
      }

      // Determine sort order
      let sortStage = {};
      if (sort.field) {
        if (sort.field === 'name') {
          sortStage.name = sort.order === 'desc' ? -1 : 1;
        } else if (sort.field === 'SKU') {
          sortStage["children.SKU"] = sort.order === 'desc' ? -1 : 1;
        }
      } else {
        sortStage = { "children.SKU": 1 };
      }

      const productlist = await Product.aggregate([
        { $match: matchStage },
        { $unwind: "$children" },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          }
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategory",
          }
        },
        {
          $lookup: {
            from: "colors",
            localField: "children.color",
            foreignField: "_id",
            as: "children.color",
          }
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$category", 0] },
            subCategory: { $arrayElemAt: ["$subCategory", 0] },
            "children.color": { $arrayElemAt: ["$children.color", 0] },
          }
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: "$_id",
            ID: { $first: "$ID" },
            name: { $first: "$name" },
            category: { $first: "$category" },
            subCategory: { $first: "$subCategory" },
            children: { $push: "$children" },
          }
        },
      ]);

      const totalChildren = await Product.aggregate([
        { $match: matchStage },
        { $unwind: "$children" },
        { $count: "total" },
      ]);

      const total = totalChildren.length > 0 ? totalChildren[0].total : 0;

      return {
        products: productlist,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      const category = await Category.findById(productData.category);
      if (!category) {
        throw new Error("Product category not found.");
      }

      Object.keys(productData).forEach((key) => {
        if (key !== "children") {
          product[key] = productData[key];
        }
      });

      // Update children
      product.children = await Promise.all(
        productData.children.map(async (updatedChild) => {
          const color = await Color.findById(updatedChild.color);
          if (!color) {
            throw new Error(`Color not found for SKU: ${updatedChild.SKU}`);
          }
          return {
            ...updatedChild,
            color: color._id,
          };
        })
      );

      return await product.save();
    } catch (error) {
      throw error;
    }
  },

  getPreSaveID: async () => {
    try {
      const highestProduct = await Product.find().sort("-ID").limit(1).exec();

      let nextProductId = "MAP001";
      if (highestProduct.length > 0) {
        const currentNum = parseInt(highestProduct[0].ID.slice(3));
        nextProductId = `MAP${String(currentNum + 1).padStart(3, "0")}`;
      }
      return nextProductId;
    } catch (error) {
      throw error;
    }
  },

  searchByName: async (input) => {
    try {
      const searchRegex = new RegExp(input, "i");

      const products = await Product.aggregate([
        {
          $match: {
            $or: [{ name: searchRegex }, { "children.name": searchRegex }],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ]);

      return products;
    } catch (error) {
      throw error;
    }
  },

  bulkAddProducts: async (productsData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let errors = [];

    try {
      let addedProducts = 0;
      let skippedProducts = 0;
      let productsMap = {};

      for (let [index, item] of productsData.entries()) {
        try {
          const parentID = item['Product ID'];
          const childSKU = item['SKU'];

          // we boutta skip duplicate skus
          const doesExist = await Product.findOne({ "children.SKU": childSKU });
          if (doesExist) {
            skippedProducts++;
            errors.push({
              row: index + 2, // Adding 2 to account for header row and 0-based index
              sku: childSKU,
              error: 'Duplicate SKU'
            });
            continue;
          }
          // check for catgory
          const category = await Category.findOne({
            name: item['Category']?.toUpperCase()?.trim()
          });
          if (!category) {
            errors.push({
              row: index + 2,
              sku: childSKU,
              error: `Category '${item['Category']}' does not exist`
            });
            continue;
          }
          //check for subcateogry
          const subcat = await SubCategory.findOne({
            name: item['SubCategory']?.toUpperCase()?.trim(),
            category: category._id
          });
          if (!subcat) {
            errors.push({
              row: index + 2,
              sku: childSKU,
              error: `SubCategory '${item['SubCategory']}' does not exist in specified category.`
            });
            continue;
          }
          // color check
          const color = await Color.findOne({
            name: item['Color']?.toUpperCase()?.trim()
          });
          if (!color) {
            errors.push({
              row: index + 2,
              sku: childSKU,
              error: `Color '${item['Color']}' does not exist`
            });
            continue;
          }

          // Initialize if new or update parent product if in db olredi
          if (!productsMap[parentID]) {
            productsMap[parentID] = {
              name: item['Product Name'],
              ID: parentID,
              category: category._id,
              subCategory: subcat._id,
              Description: item['Description'],
              // heroImage: item['Hero Image'],
              children: []
            };
          }
          const childProduct = {
            SKU: childSKU,
            name: item['Child Name'],
            color: color._id,
            description: item['Child Description'],
            selling_price: parseFloat(item['Selling Price']),
            cost_price: item['Cost Price'] ? parseFloat(item['Cost Price']) : undefined,
            weight: item['Weight'] && item['Weight Unit'] ? {
              value: parseFloat(item['Weight']),
              unit: item['Weight Unit']
            } : undefined,
            product_size: {
              ...(item['Length(In)'] ? { L: parseFloat(item['Length(In)']) } : {}),
              ...(item['Width(In)'] ? { W: parseFloat(item['Width(In)']) } : {}),
              ...(item['Height(In)'] ? { H: parseFloat(item['Height(In)']) } : {})
            }
          };

          if (Object.keys(childProduct.product_size).length === 0) {
            delete childProduct.product_size;
          }


          productsMap[parentID].children.push(childProduct);
        } catch (error) {
          errors.push({
            row: index + 2,
            sku: item['SKU'] || 'Unknown SKU',
            error: error.message
          });
        }
      }

      const products = Object.values(productsMap);
      addedProducts = products.length;
      if (products.length < 1) {
        return {
          addedProducts,
          skippedProducts,
          errors: errors.length > 0 ? errors : undefined
        };
      }

      // Insert all products (batch me krte h try)
      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        try {
          await Product.insertMany(batch);
        } catch (error) {
          console.error("Error inserting batch: ", error);
        }
      }

      await session.commitTransaction();

      return {
        addedProducts,
        skippedProducts,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      // console.log(error, errors)
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};

module.exports = productServices;
