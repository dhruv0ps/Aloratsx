
const { default: mongoose } = require('mongoose');
const DamagedProductModel = require('../config/models/damagedSupplyModel');
const Inventory = require('../config/models/inventoryModel');
const logService = require('./logService');
const Product = require('../config/models/ProductModel');

module.exports = {
    addDamagedProduct: async (damageData) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { product, child, quantity, location, comments } = damageData;

            // Check if the product exists
            const productDoc = await Product.findById(product).session(session);
            if (!productDoc) {
                throw new Error("Product not found");
            }

            const childDoc = productDoc.children.find(childItem => childItem.SKU === child);
            if (!childDoc) {
                throw new Error("Child SKU not found in the product");
            }

            const inv = await Inventory.findOne({ product, child, location }).session(session);
            const damagedProduct = new DamagedProductModel({
                product,
                child,
                quantity,
                comments,
                location,
                // createdBy: user._id
            });
            await damagedProduct.save({ session });

            if (inv) {
                if (quantity > inv.quantity) {
                    throw new Error("Insufficient inventory to mark as damaged");
                }

                await Inventory.findOneAndUpdate(
                    { product, child, location: location },
                    { $inc: { damaged: quantity, quantity: -quantity } },
                    { session }
                );
            } else {
                throw new Error("Inventory not found for the given product and child at specified location.");
            }

            // Update product stock
            let prodDetails = await Product.findOneAndUpdate(
                { _id: product, "children.SKU": child },
                { $inc: { "children.$.stock": -quantity } },
                { session }
            );

            // add log
            await logService.addLog({
                operation: 'Damaged',
                details: {
                    product: prodDetails.name,
                    child,
                    quantity,
                    comments,
                },
                message: `Quantity ${quantity} of ${prodDetails.name} ${child} were reported damaged.`,
                // createdBy: user._id
            }, session);

            await session.commitTransaction();
            return damagedProduct;
        } catch (error) {
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