
const { default: mongoose } = require('mongoose');
const DamagedProductModel = require('../config/models/damagedSupplyModel');
const Inventory = require('../config/models/inventoryModel');
const logService = require('./logService');
const NewProduct = require('../config/models/newProductgen');

module.exports = {
    addDamagedProduct: async (damageData,imagePaths) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
          const { product, child, quantity, location, comments } = damageData;
         console.log(product)
          // Check if the product exists
          const productDoc = await NewProduct.findById(product).session(session);
          if (!productDoc) {
            throw new Error(`Product with ID ${product} not found`);
          }
    
          // Check if the child SKU exists within the product
          const childDoc = productDoc.children.find(childItem => childItem.SKU === child);
          if (!childDoc) {
            throw new Error(`Child SKU ${child} not found in the product ${productDoc.name}`);
          }
    
          // Check if the inventory record exists
          const inv = await Inventory.findOne({ child, location }).session(session);
          if (!inv) {
            throw new Error(`Inventory not found for child SKU ${child} at location ${location}`);
          }
    
          // Check for sufficient inventory
          if (quantity > inv.quantity) {
            throw new Error(`Insufficient inventory for child SKU ${child}: Available ${inv.quantity}, Requested ${quantity}`);
          }
    
          // Create a damaged product entry
          const damagedProduct = new DamagedProductModel({
            product,
            child,
            quantity,
            comments,
            images: imagePaths,
          });
          await damagedProduct.save({ session });
    
          // Update the inventory record
          await Inventory.findOneAndUpdate(
            { product, child, location },
            { $inc: { damaged: quantity, quantity: -quantity } },
            { session }
          );
    
          // Update the product stock
          const prodDetails = await NewProduct.findOneAndUpdate(
            { _id: product, "children.SKU": child },
            { $inc: { "children.$.stock": -quantity } },
            { session, new: true }
          );
    
          // Log the operation
          await logService.addLog(
            {
              operation: 'Damaged',
              details: {
                product: prodDetails.name,
                child,
                quantity,
                comments,
              },
              message: `Quantity ${quantity} of ${prodDetails.name} (SKU: ${child}) were reported damaged.`,
            },
            session
          );
    
          // Commit the transaction
          await session.commitTransaction();
          return damagedProduct;
        } catch (error) {
          console.error("Error in addDamagedProduct:", error);
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      },
    updateDamagedProduct: async (id, updateData) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const damagedProduct = await DamagedProductModel.findById(id);
            if (!damagedProduct) {
                throw new Error('Damaged product not found');
            }

            const quantityDiff = updateData.quantity - damagedProduct.quantity;

            // Update damaged product
            Object.assign(damagedProduct, updateData);
            await damagedProduct.save({ session });

            // Update inventory
            await Inventory.findOneAndUpdate(
                { product: damagedProduct.product, child: damagedProduct.child },
                { $inc: { damaged: quantityDiff } },
                { session }
            );

            // Add log if quantity changed
            if (quantityDiff !== 0) {
                await logService.addLog({
                    operation: 'Damaged',
                    details: {
                        product: damagedProduct.product,
                        child: damagedProduct.child,
                        quantity: Math.abs(quantityDiff),
                        comments: comments,
                    },
                    // createdBy: user._id
                }, session);
            }

            await session.commitTransaction();
            return damagedProduct;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },
    getAllDamagedProducts: async () => {
        try {
            const inventories = await DamagedProductModel.find()
                .populate('product')
                .populate({
                    path: 'product',
                    populate: {
                        path: 'children',
                        model: 'Child'
                    }
                })
                // .populate('createdBy', 'username')
                .sort({ createdAt: -1 });

            if (inventories.length < 1)
                return []
            // Map the results to include the child information
            const inventoriesWithChild = inventories.map(inventory => {
                const childInfo = inventory.product.children.find(child => child.SKU === inventory.child);
                return {
                    ...inventory.toObject(),
                    child: childInfo || null
                };
            });

            return inventoriesWithChild;
        } catch (error) {
            throw error;
        }
    },
};