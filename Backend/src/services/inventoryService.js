const { default: mongoose } = require('mongoose');
const Inventory = require('../config/models/inventoryModel');
const logService = require("./logService")
const { Product } = require("../config/models/ProductModel");

const inventoryService = {
    addStartingStock: async (data) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let inventory = await Inventory.findOne({
                product: data.product,
                child: data.child,
                location: data.location
            }).session(session);

            if (inventory) {
                // If inventory exists, update it
                inventory = await Inventory.findOneAndUpdate(
                    {
                        product: data.product,
                        child: data.child,
                        location: data.location
                    },
                    { $inc: { quantity: data.quantity } },
                    { new: true, session }
                );
            } else {
                // If inventory doesn't exist, create a new one
                inventory = await Inventory.create([data], { session });
            }
            await Product.updateOne(
                { _id: data.product, "children.SKU": data.child },
                { $inc: { "children.$.stock": data.quantity } },
                { session }
            );

            await logService.addLog({
                operation: 'Starting Stock',
                details: {
                    product: data.product,
                    child: data.child,
                    quantityChange: data.quantity,
                },
                message: `${data.quantity} of ${data.child} added as starting stock.`,
            }, session);

            await session.commitTransaction();
            session.endSession();

            return inventory;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },
    getInventoryById: async (id) => {
        try {
            const inventory = await Inventory.findById(id)
                .populate('product')
                .populate('location');
            return inventory;
        } catch (error) {
            throw error;
        }
    },
    getAllInventories: async (filters) => {
        try {
            const { product, selectedChildren, supplier, category, location, page = 1, limit = 20 } = filters;

            // Initial query to fetch all relevant inventories
            const query = {
                $or: [
                    { quantity: { $ne: 0 } },
                    { booked: { $ne: 0 } },
                    { damaged: { $ne: 0 } },
                ],
            };

            // Pagination
            const skip = (page - 1) * limit;

            // Fetch inventories with pagination
            const inventories = await Inventory.find(query)
                .populate('product')
                .populate('location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Apply filters in memory
            const filteredInventories = inventories.filter((inventory) => {
                let match = true;

                // Filter by product name
                if (product) {
                    match = match && inventory.product.name === product;
                }

                // Filter by selected children (SKUs)
                if (selectedChildren && selectedChildren.length > 0) {
                    match = match && selectedChildren.includes(inventory.child);
                }

                // Filter by category
                if (category) {
                    match = match && inventory.product.category.toString() === category;
                }

                // Filter by location name
                if (location) {
                    match = match && inventory.location.name.match(new RegExp(location, 'i'));
                }

                // Filter by supplier name
                if (supplier) {
                    match = match && inventory.product.supplier.name === supplier;
                }

                return match;
            });

            // Map the results to include the child information
            const inventoriesWithChild = filteredInventories.map((inventory) => {
                const childInfo = inventory.product.children.find(
                    (child) => child.SKU === inventory.child
                );
                return {
                    ...inventory.toObject(),
                    childInfo: childInfo || null,
                };
            });

            // Calculate the total number of inventories matching the query without pagination
            const total = await Inventory.countDocuments(query);

            return {
                inventories: inventoriesWithChild,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    },
    updateInventory: async (data, isAdding, session) => {
        try {
            const { product, childSKU, location, quantity } = data
            // console.log(data)
            let existingInventory = await Inventory.findOne({
                product,
                child: childSKU,
                location
            }).session(session);

            if (!existingInventory && !isAdding) {
                throw new Error("Cannot remove inventory that doesn't exist");
            }

            if (existingInventory) {
                const newQuantity = isAdding ? existingInventory.quantity + quantity : existingInventory.quantity - quantity;
                if (newQuantity < 0) {
                    throw new Error("Insufficient quantity in inventory");
                } else if (newQuantity === 0) {
                    existingInventory.status = "OUT OF STOCK"
                } else if (newQuantity < 5) {
                    existingInventory.status = "VERY LOW IN STOCK"
                } else if (newQuantity < 10) {
                    existingInventory.status = 'LOW STOCK'
                } else {
                    existingInventory.status = "IN STOCK"
                }

                existingInventory.quantity = newQuantity;
                await existingInventory.save({ session });
            } else {
                if (!isAdding)
                    throw new Error("Insufficient quantity in inventory")
                if (quantity < 0) {
                    throw new Error("Insufficient quantity in inventory");
                } else if (quantity === 0) {
                    existingInventory.status = "OUT OF STOCK"
                } else if (quantity < 5) {
                    existingInventory.status = "VERY LOW IN STOCK"
                } else if (quantity < 10) {
                    existingInventory.status = 'LOW STOCK'
                } else {
                    existingInventory.status = "IN STOCK"
                }
                existingInventory = new Inventory({
                    product,
                    child: childSKU,
                    location,
                    quantity
                });
                await existingInventory.save({ session });
            }

            return existingInventory;
        } catch (error) {
            throw error;
        }
    },
    getInventoryByLocation: async (id) => {
        try {
            const inventory = await Inventory.find({
                location: id, $or: [
                    { quantity: { $ne: 0 } },
                    { booked: { $ne: 0 } },
                    { damaged: { $ne: 0 } }
                ]
            }).populate('product')
                .populate('location');

            if (!inventory)
                throw new Error("No active products in inventory were found")
            return inventory
        } catch (error) {
            throw error
        }
    },
    moveInventory: async (sourceLocation, destinationLocation, items) => {
        const session = await Inventory.startSession();
        session.startTransaction();

        try {
            for (const itemId of items) {
                const item = await Inventory.findOne({
                    _id: itemId.id,
                    location: sourceLocation._id
                });

                if (!item) {
                    throw new Error(`Item with id ${itemId} not found at the source location`);
                }
                if (item.quantity < itemId.quantity)
                    throw new Error(`Not enough stock for ${item.child}`)
                if (item.quantity < 0 || itemId.quantity < 0)
                    throw new Error("Cannot accept negative values.")
                // Decrease quantity at source location
                await Inventory.findByIdAndUpdate(itemId.id, {
                    $inc: { quantity: -itemId.quantity }
                });

                // Increase or create at destination location
                const existingItem = await Inventory.findOne({
                    product: item.product,
                    child: item.child,
                    location: destinationLocation._id
                });

                if (existingItem) {
                    await Inventory.findByIdAndUpdate(existingItem._id, {
                        $inc: { quantity: itemId.quantity }
                    });
                } else {
                    await Inventory.create({
                        product: item.product,
                        child: item.child,
                        location: destinationLocation._id,
                        quantity: itemId.quantity,
                        booked: 0,
                        damaged: 0
                    });
                }


                if (!item.quantity)
                    throw new Error("Product Quantity not found. Please refresh and try again.")

                await logService.addLog({
                    operation: 'Inventory Moved',
                    details: {
                        product: item.product,
                        child: item.child,
                        quantity: itemId.quantity,
                        start: sourceLocation._id,
                        end: destinationLocation._id,
                    },
                    message: `${itemId.quantity} ${item.child} moved from ${sourceLocation.name} to ${destinationLocation.name}.`,
                    // createdBy: user._id
                }, session);
            }

            await session.commitTransaction();
            session.endSession();

            return { success: true };
        } catch (error) {
            console.log(error)
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },
    moveSingleInventory: async (sourceLocation, destinationLocation, sku, quantity, session) => {
        try {
            // console.log(sourceLocation?._id, destinationLocation?._id, sku, quantity, user, session)
            const inventory = await Inventory.findOne({
                child: sku,
                location: sourceLocation._id
            }).session(session);

            if (!inventory) {
                throw new Error(`Item with id ${sku} not found at the source location`);
            }
            if (!inventory.quantity || inventory.quantity < quantity)
                throw new Error("Not Enough Stock at source location.")

            // Decrease quantity at source location
            await Inventory.findByIdAndUpdate(inventory._id, {
                $inc: { quantity: -quantity }
            }).session(session);

            // Increase or create at destination location
            const existingItem = await Inventory.findOne({
                product: inventory.product,
                child: inventory.child,
                location: destinationLocation._id
            }).session(session);

            if (existingItem) {
                await Inventory.findByIdAndUpdate(existingItem._id, {
                    $inc: { quantity: quantity }
                }).session(session);
            } else {
                await Inventory.create({
                    product: inventory.product,
                    child: inventory.child,
                    location: destinationLocation._id,
                    quantity: quantity,
                    booked: 0,
                    damaged: 0
                }, session)
            }



            await logService.addLog({
                operation: 'Inventory Moved',
                details: {
                    product: inventory.product,
                    child: inventory.child,
                    quantity: inventory.quantity,
                    start: sourceLocation._id,
                    end: destinationLocation._id,
                },
                message: `${inventory.quantity} ${inventory.child} moved from ${sourceLocation.name} to ${destinationLocation.name}.`,
                // createdBy: user._id
            }, session);
        } catch (error) {
            throw error;
        }
    },

};

module.exports = inventoryService;