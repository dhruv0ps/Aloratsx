const { default: mongoose } = require('mongoose');
const Inventory = require('../config/models/inventoryModel');
const logService = require("./logService")
const  NewProduct  = require("../config/models/newProductgen");
const generateInboundNumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const baseIdentifier = `INB-${year}${month}${day}-`;

   
    const todayStart = new Date(year, date.getMonth(), date.getDate());
    const todayEnd = new Date(year, date.getMonth(), date.getDate() + 1);

    const count = await Inventory.countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd }
    });

 
    const letter = String.fromCharCode(65 + count); 
    return baseIdentifier + letter;
};
const inventoryService = {


    addStartingStock: async (data) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const inboundNumber = await generateInboundNumber();
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
                    { $inc: { quantity: data.quantity } ,
                    $set: { referenceNumber: data.referenceNumber, receipt: data.receipt } 
                },
                    { new: true, session }
                );
            } else {
                // If inventory doesn't exist, create a new one
                data.inboundNumber = inboundNumber; 
                inventory = await Inventory.create([data], { session });
            }
            await NewProduct.updateOne(
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
                    referenceNumber: data.referenceNumber, // Log referenceNumber
                    receipt: data.receipt
                },
                message: `${data.quantity} of ${data.child} added as starting stock.`,
            }, session);

            await session.commitTransaction();
            session.endSession();

            return inventory;
        } catch (error) {
            console.log(error)
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
            const { product, selectedChildren, category, page = 1, limit = 20 } = filters;
            
            // Initial query to fetch inventories with non-zero quantities, booked, or damaged counts
            const query = {
                $or: [
                    { quantity: { $ne: 0 } },
                    { booked: { $ne: 0 } },
                    { damaged: { $ne: 0 } },
                ],
            };
    
            // Pagination settings
            const skip = (page - 1) * limit;
    
            // Step 1: Fetch inventories and populate the `NewProduct` model
            const inventories = await Inventory.find(query)
                .populate({
                    path: 'parent_id', // Field in Inventory that references the NewProduct model
                    model: 'NewProduct', // Name of the referenced model
                    select: 'children name category', // Fields to select from NewProduct
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
    
            // Step 2: Enrich inventories with child name and apply filters
            const enrichedInventories = inventories.map(inventory => {
                // Check if `parent_id` and `parent_id.children` are defined
                if (inventory.parent_id && inventory.parent_id.children) {
                    // Find the child with the matching SKU
                    const matchingChild = inventory.parent_id.children.find(child => child.SKU === inventory.child);
    
                    // Add childName to the inventory object
                    const childName = matchingChild ? matchingChild.name : 'Child not found';
    
                    // Enrich the inventory object with the child name and other details
                    return {
                        ...inventory._doc, // `_doc` to extract the plain object
                        childName,
                        productName: inventory.parent_id.name,
                        category: inventory.parent_id.category,
                    };
                } else {
                    // Handle the case where `parent_id` or `children` is not defined
                    return {
                        ...inventory._doc,
                        childName: 'Parent not found',
                        productName: null,
                        category: null,
                    };
                }
            });
    
            // Step 3: Apply filters in memory
            const filteredInventories = enrichedInventories.filter(inventory => {
                let match = true;
    
                // Filter by product name
                if (product) {
                    match = match && inventory.productName === product;
                }
    
                // Filter by selected children (SKUs)
                if (selectedChildren && selectedChildren.length > 0) {
                    match = match && selectedChildren.includes(inventory.child);
                }
    
                // Filter by category
                if (category) {
                    match = match && inventory.category === category;
                }
    
                return match;
            });
    
            // Calculate total pages based on the filtered inventory length
            const totalPages = Math.ceil(filteredInventories.length / limit);
    
            // Return paginated and filtered results
            return {
                totalPages,
                inventories: filteredInventories.slice(0, limit),
            };
        } catch (error) {
            console.error('Error fetching inventories:', error);
            throw error;
        }
    },
    markAsCompleted: async (id,data) => {
        try {
            // Find the inventory item and update its status to COMPLETED
            console.log(data)
            
            
            const inventory = await Inventory.findById(id);
            if (!inventory) {
                throw new Error('Inventory item not found');
            }

            inventory.enteryStatus = 'COMPLETED';
            await inventory.save();

            return inventory;
        } catch (error) {
            console.log(error)
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
