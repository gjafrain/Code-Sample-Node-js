const { Op, fn, col } = require("sequelize");
const db = require('../../config/database');
const moment = require('moment');
// 
const { sendErrorMessage, sendListSuccess, sendUpdatedSuccess, success, listSuccess, sendSuccessMessage } = require('../../helper/queryMessage');
const { firebase } = require('../../config/firebase/firebaseConfig');
const { sns } = require('../../utils/awsConfig');
const { OrderStatusEnum, DriverOrderStatusEnum, StoreOrderStatusEnum } = require('../../utils/enum');
const { startDate, endDate } = require("../../utils/common");
const { SUCCESS_MESSAGE } = require("../../utils/constants/replies");
const { default: axios } = require("axios");
const sense = 'Order';

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

// "GET" REQUEST 
exports.list = async (req, res) => {
    try {
        const { date, status } = req.query,
            orderQuery = dataFilterQuery(date, status);

        const orders = await db.driverOrder.findAll({
            // where: {
            //     ...orderQuery
            // },
            attributes: ['id', 'status', 'orderId', 'storeOrderId'],
            include: [
                {
                    model: db.order,
                    attributes: ['orderTotal', 'orderSubtotal', 'paymentMethod', 'deliveryStartTime', 'deliveryEndTime', 'isPaid', 'paidAmount', 'currentStatus'],
                    include: {
                        model: db.cart,
                        attributes: ['id'],
                        include: [{
                            model: db.cartItem,
                            as: 'cartItems',
                            attributes: ['id']
                        }],
                    }
                },
                {
                    model: db.storeOrder,
                    include:
                    {
                        model: db.store,
                        attributes: ['longitude', 'latitude'],
                    }
                }
            ]
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
            await db.orderStatus.bulkCreate(orderStatusBody, { transaction })
            sendUpdatedSuccess(sense, res);
            // SEND NOTIFICATION
            // for (const orderId of orders) sendNotifiction(orderId, status);
        }
        catch (err) {
            sendErrorMessage(err, res);
        }
    })
}


// PUT 
exports.sendDeliveryAlert = async (req, res) => {
    try {

        // const { phone } = req.body;
        const phone = 9991134734;

        await db.sequelize.transaction(async (transaction) => {

            const user = await db.user.findOne({ where: { phone }, transaction })

            const message = `Dear ${user.name} ${user.lastName}, driver has been arrived, please collect your order`;
            await axios.get(`http://msg.pwasms.com/app/smsapi/index.php?key=35EE85CDF3EDE6&campaign=0&routeid=69&type=text&contacts=${phone}&senderid=SJSMTH&msg=${message}`)
            sendSuccessMessage('Alert', res);
        })
    } catch (err) {
        sendErrorMessage(err, res);
    }
}

exports.deliverOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        await db.sequelize.transaction(async (transaction) => {
            const driverOrder = await db.driverOrder.findOne({
                where: { orderId },
                attributes: ["id", "storeOrderId"],
                transaction
            })

            await db.driverOrder.update({ status: DriverOrderStatusEnum.Deliver }, {
                where: { id: driverOrder.id },
                transaction
            })
            await db.storeOrder.update({ status: StoreOrderStatusEnum.Delivered }, {
                where: { id: driverOrder.storeOrderId },
                transaction
            })
            await db.order.update({ currentStatus: OrderStatusEnum.Delivered }, {
                where: { id: orderId },
                transaction
            })
            sendSuccessMessage('Alert', res);
        })
    } catch (err) {
        sendErrorMessage(err, res);
    }
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
// exports.sendNotifiction = async (orderId, status) => {
exports.sendNotifiction = async (req, res) => {
    try {
        // const order = await db.order.findOne({ where: { id: orderId }, attributes: ['userId'] });
        // const token = await db.deviceDetail.findOne({ where: { userId: order.userId }, attributes: ['fcmToken'] });

        const options = notification_options,
            messageBody = {
                // notification: {
                //     title: 'FARMER BUGGY',
                //     body: `Your order #${0001} has been ${OrderStatusEnum[status]}`
                // }
                notification: {
                    // title: 'FARMER BUGGY',
                    body: `Your order #${000112} has been Shipped`,
                    sound: 'default',
                    badge: '1',
                },
                "data": { "screen": 'OrderDetail', "id": "112" },
            };

        firebase.messaging().sendToDevice('dGKKoFKpQAWHbPK_my3xDh:APA91bHRTEmFu0r7aFRqMvacbD7x-k9EbyYkUVbFBtGQ9HQdAiBNW2JcVJh5mutdB3bRY_1wOa0VAO07GVdIAoF_P4fAqE2pfwC7666etrfICVhS95ANZnw7IoGLm00J3SJKKpUBSseB', messageBody).then(function (response) {
            console.log("Successfully sent message:", response);
            sendSuccessMessage('Notification', res)
        })
            .catch(function (error) {
                console.log("Error sending message:", error);
                sendErrorMessage(error, res)
            });
    }
    catch (err) {
        sendErrorMessage(err, res)
    }

    // sendSuccessMessage('Notification', res)
}

function dataFilterQuery(date, status) {
    let orderQuery = {}
    if (status) {
        orderQuery = {
            [Op.and]: [
                {
                    createdAt: {
                        [Op.gt]: startDate(date)
                    },
                    currentStatus: status
                }
            ]
        }
    }
    else if (date) {
        orderQuery['createdAt'] = {
            [Op.gt]: startDate(date),
            [Op.lt]: endDate(date)
        }
    }
    return orderQuery
}

async function checkIsExistOrderStatus(orderId, status) {
    try {
        status = await db.order.findOne({ where: { id: orderId } })
        if (status) return true;
        else return false;
    } catch (err) {
        return false;
    }
}