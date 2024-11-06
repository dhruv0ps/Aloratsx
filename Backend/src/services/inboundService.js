const { default: mongoose } = require('mongoose');
const Inbound = require('../config/models/InboundModel');
const Inventory = require('../config/models/inventoryModel');
const NewProduct = require("../config/models/newProductgen")
const logService = require("./logService")

class InboundService {
    async createDraft(data, userId) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateString = `${year}${month}${day}`;
        // console.log(name, data, userId)


        const latestInboundToday = await Inbound.findOne({
            createdAt: {
                $gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00Z`),
                $lt: new Date(`${today.toISOString().split("T")[0]}T23:59:59Z`)
            }
        }).sort({ createdAt: -1 });


        let identifier = 'A';
        if (latestInboundToday) {
            const lastIdentifier = latestInboundToday.name.split('-').pop();
            identifier = String.fromCharCode(lastIdentifier.charCodeAt(0) + 1);
        }


        const name = `INB-${dateString}-${identifier}`;
        const inbound = new Inbound({
            // location: data.location._id,
            referenceNumber:data.referenceNumber,
            items: data.items,
            createdBy: userId,
            updatedBy: userId,
            name
        });

        return await inbound.save();
    }

    async addStartingStock(data) {
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
    }

    async getAllInbound(page = 1, limit = 20, filters = {}) {
        const skip = (page - 1) * limit;
        let query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        // if (filters.location) {
        //     query.location = filters.location;
        // }

        // if (filters.dateRange) {
        //     query.createdAt = {
        //         $gte: new Date(filters.dateRange.start),
        //         $lte: new Date(filters.dateRange.end)
        //     };
        // }

        if (filters.search) {
            query['$or'] = [
                { 'items.child.sku': { $regex: filters.search, $options: 'i' } },
                { 'items.child.name': { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Get inbound records
        const inbounds = await Inbound.find(query)
            // .populate('location')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Inbound.countDocuments(query);

        return {
            inbounds,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalRecords: total
        };
    }

    async getDraftById(id) {
        return await Inbound.findById(id)
            // .populate('location')
            .populate('items.product', 'name')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email');
    }

    async updateDraft(id, data, userId) {
        return await Inbound.findByIdAndUpdate(
            id,
            {
                ...data,
                updatedBy: userId
            },
            { new: true }
        );
    }


    async completeDraft(id, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const inbound = await Inbound.findById(id);
            if (!inbound || inbound.status !== 'DRAFT') {
                throw new Error('Invalid inbound or already processed');
            }

            for (const item of inbound.items) {
                const { product: productId, child: { sku }, quantity } = item;

                const product = await NewProduct.findById(productId).session(session);
                const child = product.children.find(c => c.SKU === sku);

                if (child) {
                    child.stock += quantity;

                    if (child.stock < 5) {
                        child.status = 'VERY LOW IN STOCK';
                    } else if (child.stock < 10) {
                        child.status = 'LOW STOCK';
                    } else {
                        child.status = 'IN STOCK';
                    }

                    await product.save({ session });
                }

                const inventory = await Inventory.findOne({
                    product: item.product,
                    child: item.child.sku,
                    // location: inbound.location
                });

                if (inventory) {

                    await Inventory.findByIdAndUpdate(
                        inventory._id,
                        {
                            $inc: { quantity: item.quantity }
                        }
                    );
                } else {

                    const newInventory = new Inventory({
                        product: item.product,
                        child: item.child.sku,
                        // location: inbound.location,
                        quantity: item.quantity
                    });
                    await newInventory.save();
                }
            }
            await session.commitTransaction();

            return await Inbound.findByIdAndUpdate(
                id,
                {
                    status: 'COMPLETED',
                    updatedBy: userId
                },
                { new: true }
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    }

    async cancelDraft(id, userId) {
        return await Inbound.findByIdAndUpdate(
            id,
            {
                status: 'CANCELLED',
                updatedBy: userId
            },
            { new: true }
        );
    }
}

module.exports = new InboundService();