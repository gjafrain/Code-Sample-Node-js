const { Op } = require("sequelize");
const db = require('../../config/database');
const moment = require('moment');
// 
const { sendErrorMessage, sendListSuccess, sendUpdatedSuccess, success, listSuccess, sendSuccessMessage, sendCreatedSuccess, sendFetchSuccess } = require('../../helper/queryMessage');
const { OrderStatusEnum, StorePaymentStatusEnum, DriverOrderStatusEnum } = require('../../utils/enum');
const { startDate, endDate } = require("../../utils/common");
const { SUCCESS_MESSAGE } = require("../../utils/constants/replies");
const sense = 'Store';

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

// "GET" REQUEST 
exports.list = async (req, res) => {
    try {
        const orders = await db.store.findAll()
        sendListSuccess(sense, res, orders)
    }
    catch (err) {
        sendErrorMessage(err, res, [])
    }
}

// "GET" REQUEST 
exports.getById = async (req, res) => {
    const { id } = req.query;
    try {
        const store = await db.store.findOne({ where: { id } })
        sendFetchSuccess(sense, res, store)
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// "POST" REQUEST 
exports.createStore = async (req, res) => {
    const { address, latitude, longitude, city, state, phone, name, ownerName, type } = req.body;
    try {
        await db.store.create(
            { address, latitude, longitude, city, state, phone, name, ownerName, type }
        )
        sendCreatedSuccess(sense, res)
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// "POST" REQUEST 
exports.createOrder = async (req, res) => {
    const { orderId, cartItems, storeId, driverId } = req.body;

    await db.sequelize.transaction(async (transaction) => {
        try {
            // COUNT Price
            const storeOrderPrice = getPrice(cartItems);
            //
            const storeOrderPayload = { status: OrderStatusEnum.Assigned, orderId, storeId, orderTotal: storeOrderPrice }
            // CREATE Store Order
            const storeOrder = await db.storeOrder.create(storeOrderPayload, transaction);
            await db.storeOrder.create({ status: OrderStatusEnum.Assigned, storeOrderId: storeOrder.id }, transaction);
            // 
            const payload = cartItems.map(item => ({ cartItemId: item.cartItemId, storeOrderId: storeOrder.id }));
            // CREATE Store Item
            await db.storeOrderItem.bulkCreate(payload, { transaction })
            await db.storeOrderPayment.create({ storeOrderId: storeOrder.id, totalAmount: storeOrderPrice, pendingAmount: storeOrderPrice, orderId, paymentStatus: StorePaymentStatusEnum.Unpaid }, { transaction })

            const driverOrderModel = {
                storeOrderId: storeOrder.id,
                driverId: driverId || 1,
                orderId,
                status: DriverOrderStatusEnum.Assigned
            }
            // CREATE driver Order
            await db.driverOrder.create(driverOrderModel, transaction)
            sendCreatedSuccess(sense, res);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}

// "PUT" REQUEST 
exports.updateOrderStatus = async (req, res) => {
    const { orderId, status, storeOrderId } = req.body;
    await db.sequelize.transaction(async (transaction) => {
        try {
            // UPDATE order status if status id is 2 ("In Prepration")
            status === 2 && await db.order.update({ currentStatus: status }, { where: { id: orderId }, transaction })
            await db.storeOrder.update({ status }, { where: { id: storeOrderId }, transaction })
            status === 2 && await db.orderStatus.create({ orderId, status }, { transaction })
            await db.storeOrderHistory.create({ storeOrderId, status }, { transaction })
            sendUpdatedSuccess(sense, res);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}

// "PUT" REQUEST 
exports.updateStore = async (req, res) => {
    await db.sequelize.transaction(async (transaction) => {
        try {
            const { address, latitude, longitude, city, state, phone, name, ownerName, type, id, status } = req.body;
            await db.store.update({ address, latitude, longitude, city, state, phone, name, ownerName, type, status }, { where: { id }, transaction })
            sendUpdatedSuccess(sense, res);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}

// "PUT" REQUEST 
exports.updateOrder = async (req, res) => {
    const { orderId, cartItems, storeId, storeOrderId, status } = req.body;

    await db.sequelize.transaction(async (transaction) => {
        try {

            // COUNT Price
            const storeOrderPrice = getPrice(cartItems)
            // UPDATE store order
            await db.storeOrder.update({ status, orderTotal: storeOrderPrice, storeId }, { where: { id: storeOrderId }, transaction })
            // GET Store Order Items
            const storeOrderItem = await db.storeOrderItem.findAll({ attributes: ['id', 'cartItemId'], where: { [Op.and]: [{ storeOrderId }, { isDeleted: false }] }, transaction })

            const removedItem = [],
                newItem = [];

            storeOrderItem?.map(x => {
                const data = cartItems.find(y => y.cartItemId === x.cartItemId)
                if (!data) removedItem.push(x.id)
            })

            cartItems?.map(x => {
                const data = storeOrderItem.find(y => y.cartItemId === x.cartItemId)
                if (!data) newItem.push({ ...x, storeOrderId })
            })
            // REMOVE 
            removedItem.length && await db.storeOrderItem.update({ isDeleted: true }, { where: { id: removedItem }, transaction })
            // ADD New Items
            newItem.length && await db.storeOrderItem.bulkCreate(newItem, { transaction })
            // GET ORDER STATUS
            const orderStatus = await db.storeOrder.findOne({ where: { id: storeOrderId }, attributes: ['status'], transaction })

            if (orderStatus.status !== status) {
                await db.storeOrder.update({ status }, { where: { id: storeOrderId }, transaction })
                await db.storeOrderHistory.create({ storeOrderId, status }, { transaction })
            }

            sendUpdatedSuccess(sense, res);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}

// "GET" REQUEST 
exports.storeOrderByOrderId = async (req, res) => {
    const { orderId, id } = req.query;
    await db.sequelize.transaction(async (transaction) => {
        try {
            const response = await db.storeOrder.findAll({
                where: {
                    [Op.or]: [{ orderId }, { id }]
                }, transaction,
                attributes: ['orderTotal', 'status', 'id'],
                include: [
                    {
                        model: db.store,
                        attributes: ['name', "id"],
                    },
                    {
                        model: db.storeOrderItem,
                        attributes: ['id'],
                        where: { isDeleted: false },
                        include: {
                            model: db.cartItem,
                            attributes: ['price', 'quantity', 'id'],
                            include: {
                                model: db.product,
                                attributes: ['name'],
                                include: {
                                    model: db.productVarient,
                                    as: 'varients',
                                    attributes: ['weight'],
                                    include: {
                                        model: db.weightType,
                                        as: 'type',
                                        attributes: ['name'],
                                    }
                                }
                            }
                        }
                    }]
            })
            sendUpdatedSuccess(sense, res, response);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}


// "GET" REQUEST 
exports.storeOrdersByStoreId = async (req, res) => {
    const { id } = req.query;
    await db.sequelize.transaction(async (transaction) => {
        try {
            const response = await db.storeOrder.findAll({
                where: { storeId: id }, transaction,
                attributes: ['orderTotal', 'status', 'id'],
                include: [
                    {
                        model: db.order,
                        attributes: ['currentStatus', "id", "orderSubtotal"],
                    },
                    {
                        model: db.storeOrderPayment,
                        attributes: ['paymentStatus', "id", "paidAmount", "totalAmount"],
                    },
                ]
            })
            sendUpdatedSuccess(sense, res, response);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}


// "PUT" REQUEST TO UPDATE ORDER
exports.update = () => { }

// "PUT" REQUEST 
exports.cancle = () => { }

// "DELETE" REQUEST 
exports.delete = () => { }

// "GET" REQUEST
exports.orderById = (req, res) => {
    try {

    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// "PUT" REQUEST TO UPDATE ORDER's (status, isPaid, paidAmount)
exports.updateOrderInfo = (req, res) => {
    try {
        const { orderId, currentStatus, isPaid, paidAmount } = req.body;
        db.sequelize.transaction(async (transaction) => {
            // check if order status is exist then ignore create new order 
            if (!checkIsExistOrderStatus(orderId, currentStatus)) {
                await db.orderStatus.create({ status: currentStatus, orderId }, transaction);

            }
            await db.order.update({ currentStatus, isPaid, paidAmount }, { where: { id: orderId }, transaction })
        })
        sendUpdatedSuccess(sense, res);
    }
    catch (err) {
        sendErrorMessage(err, res);
    }
}


function dataFilterQuery(fromDate, toDate, status) {
    let orderQuery = {}
    if (status) {
        orderQuery = {
            [Op.and]: [
                {
                    deliveryStartTime: {
                        [Op.gt]: startDate(fromDate),
                        [Op.lt]: endDate(toDate)
                    },
                    currentStatus: status
                }
            ]
        }
    }
    else if (fromDate && toDate) {
        orderQuery['deliveryStartTime'] = {
            [Op.gt]: startDate(fromDate),
            [Op.lt]: endDate(toDate)
        }
    }
    return orderQuery
}


function getPrice(cartItems = []) {
    return cartItems.length > 1 ? cartItems.reduce((totalPrice, item) => {
        return parseFloat(parseFloat(totalPrice.price ? (totalPrice.price * item.quantity) : totalPrice) + parseFloat(item.price * item.quantity)).toFixed(2);
    }) : parseFloat(cartItems[0]?.price * cartItems[0]?.quantity).toFixed(2)
}