const { Op } = require("sequelize");
const db = require('../../config/database');
// 
const { sendErrorMessage, sendListSuccess, sendUpdatedSuccess, success, listSuccess, sendSuccessMessage } = require('../../helper/queryMessage');
const { firebase } = require('../../config/firebase/firebaseConfig');
const { sns } = require('../../utils/awsConfig');
const { OrderStatusEnum } = require('../../utils/enum');
const { startDate, endDate } = require("../../utils/common");
const { SUCCESS_MESSAGE } = require("../../utils/constants/replies");
const sense = 'Order';

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

// "GET" REQUEST 
exports.list = async (req, res) => {
    try {

        const { fromDate, toDate, status } = req.query,
            orderQuery = dataFilterQuery(fromDate, toDate, status);

        const orders = await db.order.findAll({
            where: {
                ...orderQuery
            }
        })
        sendListSuccess(sense, res, orders)
    }
    catch (err) {
        sendErrorMessage(err, res, [])
    }
}

// "PUT" REQUEST 
exports.updateStatus = async (req, res) => {
    const { orders, status } = req.body;

    await db.sequelize.transaction(async (transaction) => {
        try {
            await db.order.update({ currentStatus: status }, { where: { id: orders[0] }, transaction })
            const orderStatusBody = orders.map(x => ({ orderId: x, status }));
            await db.orderStatus.bulkCreate(orderStatusBody, { transaction })
            sendUpdatedSuccess(sense, res);
            // SEND NOTIFICATION
            // for (const orderId of orders) exports.sendNotifiction(orderId, status);
            orders.map(orderId => {
                exports.sendNotifiction(orderId, status)
            })
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
        const { id } = req.params;
        db.order.findOne(
            {
                where: { id },
                attributes: ['id', 'fullName', 'email', 'phone', 'deliveryPhone', 'landmark', 'state', 'city', 'houseNumber', 'address', 'pincode', 'addressType', 'orderDiscount', 'orderTotal', 'orderSubtotal', 'deliveryCharges', 'paymentMethod', 'deliverOn', 'isPaid', 'paidAmount', 'discountAmount', 'paymentMethod', 'deliverOn', "currentStatus", "latitude", "longitude"],
                include: [
                    {
                        model: db.orderStatus,
                        attributes: ['status', 'createdAt'],
                        order: [['createdAt', 'ASC']]
                    },
                    {
                        model: db.cart,
                        attributes: ['total', 'subTotal'],
                        include: {
                            model: db.cartItem,
                            as: "cartItems",
                            attributes: ['quantity', 'price', 'id'],
                            include: {
                                model: db.product,
                                attributes: ['name', 'image'],
                                include: {
                                    model: db.productVarient,
                                    as: "varients",
                                    attributes: ['weight'],
                                    include: {
                                        model: db.weightType,
                                        as: "type",
                                        attributes: ['name',],
                                    }
                                }
                            }

                        }
                    }
                ]
            })
            .then((response) => {
                const reply = {
                    success: true,
                    message: success(sense),
                    data: response
                }
                res.send(reply)
            })
            .catch(err => {
                sendErrorMessage(err, res)
            })
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
                exports.sendNotifiction(orderId, currentStatus)
            }
            await db.order.update({ currentStatus, isPaid, paidAmount }, { where: { id: orderId }, transaction })
        })
        sendUpdatedSuccess(sense, res);
    }
    catch (err) {
        sendErrorMessage(err, res);
    }
}

// "POST" REQUEST 
exports.sendNotifiction = async (orderId, status) => {
    try {
        const userDetail = await db.order.findOne({
            where: { id: orderId }, attributes: ['id'],
            include: {
                model: db.user,
                attributes: ['name', 'lastName'],
                include: {
                    model: db.deviceDetail,
                    attributes: ['fcmToken']
                }
            }
        });

        const options = notification_options,
            messageBody = {
                notification: {
                    body: `Your order #000${orderId} has been ${OrderStatusEnum.get(status).key}`,
                    sound: 'default',
                    // badge: '1',
                },
                "data": { "screen": 'OrderDetail', "id": orderId },
            };
        console.log('OrderStatusEnum....', OrderStatusEnum.get(status))

        firebase.messaging()
            .sendToDevice(userDetail.user.deviceDetail.fcmToken, messageBody)
            .then((response) => console.log("Successfully sent message:", response))
            .catch((error) => console.log("Error sending message:", error));
    }
    catch (err) {
        console.log("Error sending message:", err);
        // sendErrorMessage(err, res)
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

async function checkIsExistOrderStatus(orderId, status) {
    try {
        status = await db.order.findOne({
            where: {
                [Op.and]: [
                    { id: orderId },
                    { currentStatus: { [Op.eq]: status } }]
            }
        })
        if (status) return true;
        else return false;
    } catch (err) {
        return false;
    }
}