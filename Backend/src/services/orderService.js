const Order = require('../config/models/orderModel');
const Agent = require('../config/models/agentModel');
const PackingSlip = require('../config/models/packingslipModel');
const { default: mongoose } = require('mongoose');

const orderService = {

    async createOrder(orderData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let oid = await orderService.generateOrderId();
            orderData.purchaseOrderNumber = oid;
            // orderData.product = orderData.parent_id;
            // console.log(orderData)
            const order = new Order(orderData);
            await order.save({ session });
            // console.log(oid)
            const packingSlipData = {
                packingID: oid,
                order: order._id,
                orderDetails: {
                    dealerName: orderData.dealerName,
                    purchaseOrderNumber: oid,
                    products: orderData.products,
                },
                items: orderData.items,
                billTo: orderData.billTo,
                shipTo: orderData.shipTo,
                date: new Date(),
            };
            const packingSlip = new PackingSlip(packingSlipData);
            await packingSlip.save({ session });


            await session.commitTransaction();
            session.endSession();

            return order;
        } catch (error) {
            console.log(error)
            await session.abortTransaction();
            session.endSession();
            throw new Error('Failed to create order and packing slip: ' + error.message);
        }
    },
    generateOrderId: async () => {
        const highestOrder = await Order.findOne({}).sort({ purchaseOrderNumber: -1 });
        let orderNumber = 1;
        if (highestOrder) {
            orderNumber = parseInt(highestOrder.purchaseOrderNumber.slice(1)) + 1;
        }

        return `#${orderNumber.toString().padStart(2, '0')}`;
    },
    async updateOrder(orderId, updateData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await Order.findById(orderId).session(session);
            if (!order) {
                throw new Error('Order not found');
            }

            if (updateData.phase === "rejected") {
                await order.deleteOne({ session });
                await PackingSlip.findOneAndDelete({ order: orderId }, { session });
                await session.commitTransaction();
                session.endSession();

                return { message: 'Order and corresponding packing slip deleted successfully' };
            } else if (updateData.phase === "approved") {
                if (order.agent) {
                    await Agent.findByIdAndUpdate(
                        order.agent,
                        { $addToSet: { linkedOrders: orderId } },
                        { new: true, session }
                    );
                }

                order.phase = updateData.phase;
                order.status = updateData.status || order.status;
                await order.save({ session });
                await session.commitTransaction();
                session.endSession();

                return { order };
            }
            order.phase = updateData.phase || order.phase;
            order.status = updateData.status || order.status;

            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            return order;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new Error('Failed to update order: ' + error.message);
        }
    },

    async getPendingOrders() {
        try {
            return await Order.find({ phase: 'pending' }).populate("dealer").populate('products.product');
        } catch (error) {
            console.log(error)
            throw new Error('Failed to fetch pending orders: ' + error.message);
        }
    },

    async getApprovedOrders() {
        try {
            return await Order.find({ phase: 'approved' }).populate("dealer").populate('products.product');;
        } catch (error) {
            throw new Error('Failed to fetch approved orders: ' + error.message);
        }
    },

    async getOrderById(orderId) {
        try {
            const order = await Order.findById(orderId).populate('products.product');
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        } catch (error) {
            throw new Error('Failed to fetch order: ' + error.message);
        }
    },

    async getAllOrderbyDealer(id) {
        try {
            return await Order.find({
                dealer: id,
                // phase: "approved"
            })
            // .populate('products.Product');
        } catch (error) {
            throw new Error('Failed to fetch orders: ' + error.message);
        }
    },

    async getOrderbyPOnumber(OrderNumber) {
        try {
            const order = await Order.findOne({ purchaseOrderNumber: OrderNumber })

            if (!order) {
                throw new Error("order not found");
            }

            return order
        } catch (error) {
            throw error;
        }
    }
,
    async getAllOrder () {
        try {
            const result = await Order.aggregate([
              { $count: "totalOrders" } // Correct usage of $count
            ]);
        
            // Extract the count from the aggregation result
            const totalOrders = result[0]?.totalOrders || 0;
           return totalOrders;
          } 
            catch (error) {
            console.error('Error fetching counts:', error);
            throw new Error("Failed to fetch order counts: " + error.message);
          }
    },

    async getOrdersToday () {
try{
const startOfday = new Date();
startOfday.setHours(0,0,0,0)
const endOfday = new Date();
endOfday.setHours(23,59,59,999)

const ordersToday = await Order.countDocuments({
    createdAt : {$gte:startOfday ,$lte:endOfday}
})
return ordersToday
}

catch (error) {
    console.log("Failed to fetch orders today:", error.message);
    throw new Error("Failed to fetch orders today: " + error.message);
}
    }
};

module.exports = orderService;
