const moment = require('moment');
const db = require('../../config/database');
// 
const { sendErrorMessage, listSuccess, createSuccess, deleteSuccess, success } = require('../../helper/queryMessage');
const { getCartPrice, getCartProduct } = require("./cartController");
const { getAddressById } = require("./addressController");
const { getUserById } = require("./userController");
const { OrderStatusEnum, cartEnum } = require("../../utils/enum");
const sense = 'Order';


// "GET" REQUEST TO PLACE ORDER
exports.deliveryTimeSlots = async (req, res) => {
    try {
        let deliverySlots = [],
            currentHour = moment().format('h'),
            currentHour24Format = moment().format('H'),
            currentMinuts = moment().format('mm'),
            isMorning = moment().format('a') === 'am',
            scheduleTime = moment().format('LLL');

        let addHours = 0,
            addMinuts = 0;

        if (currentHour24Format < 9) {
            addHours = 9 - currentHour24Format;
            currentHour = 9
            isMorning = true
        } else if (currentHour24Format < 12) {
            addHours = 12 - currentHour24Format;
            currentHour = 0
            isMorning = false
        }
        else if (currentHour24Format < 15) {
            addHours = 15 - currentHour24Format;
            currentHour = 3
            isMorning = false
        }
        else if (currentHour24Format < 24) {
            addHours = 24 - currentHour24Format;
            currentHour = 9
            isMorning = true
            addHours = addHours + 9;
        }

        addMinuts = 60 - currentMinuts;

        if (currentMinuts > 0) addHours = parseInt(addHours) - 1

        scheduleTime = moment(scheduleTime).add(addHours, 'hours').format('LLL');
        scheduleTime = moment(scheduleTime).add(addMinuts, 'minutes').format('LLL');

        [1, 2, 3, 4, 5, 6, 7, 89, 0].map((x, i) => {

            // CHECK IF TODAY's SLOTS OVER
            if (currentHour >= 3 && !isMorning) {
                // ADD 14 HOURS TO GET NEXT DAY 7 am TIME
                // scheduleTime = moment(scheduleTime).add(3, 'hours').format('LLL')
                deliverySlots.push({
                    start: scheduleTime,
                    end: moment(scheduleTime).add(3, 'hours').format('LLL')
                })
                // SET NEXT DAY TIME 
                currentHour = 9
                isMorning = true

                scheduleTime = moment(scheduleTime).add(18, 'hours').format('LLL')
            }
            else if (currentHour === 9 && isMorning) {  // 
                // scheduleTime = moment(scheduleTime).add(14, 'hours')
                deliverySlots.push({
                    start: scheduleTime,
                    end: moment(scheduleTime).add(3, 'hours').format('LLL')
                })
                // SET NEXT DAY TIME 
                currentHour = 0
                isMorning = false
                scheduleTime = moment(scheduleTime).add(3, 'hours').format('LLL')
            } else {
                deliverySlots.push({
                    start: scheduleTime,
                    end: moment(scheduleTime).add(3, 'hours').format('LLL')
                })
                // SET NEXT DAY TIME 
                currentHour = 3
                isMorning = false
                scheduleTime = moment(scheduleTime).add(3, 'hours').format('LLL')
            }
            return x
        })

        res.send({
            success: true,
            data: deliverySlots
        })
    } catch (err) {
        sendErrorMessage(err, res)
    }
}

// "POST" REQUEST TO PLACE ORDER
exports.placeOrder = async (req, res) => {
    try {
        const { addressId, deliveryStartTime, deliveryEndTime, paymentMethod, cartId } = req.body,
            userId = req.user.id;
        db.sequelize.transaction(async (transaction) => {
            try {
                const cart = await getCartPrice(cartId, res);
                if (!cart) return true;

                const address = await getAddressById(addressId, res)
                if (!address) return true;

                const user = await getUserById(userId, res)
                if (!user) return true;

                const requestBody = {
                    address: address.address,
                    fullName: user.name + " " + user.lastName,
                    houseNumber: address.houseNumber,
                    landmark: address.landmark,
                    pincode: address.pincode,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    addressType: address.type,
                    deliveryPhone: address.phone,
                    phone: user.phone,
                    orderTotal: cart.total,
                    orderSubtotal: cart.subTotal,
                    paymentMethod: paymentMethod,
                    deliveryStartTime,
                    deliveryEndTime,
                    userId,
                    cartId: cartId,
                    currentStatus: OrderStatusEnum.Placed
                },
                    orderStatusRequestBody = {
                        status: OrderStatusEnum.Placed
                    };

                // CREATE ORDER
                const order = await db.order.create(requestBody, { transaction });
                // ADD ORDER ID
                orderStatusRequestBody.orderId = order.id;
                // CREATE ORDER STATUS
                await db.orderStatus.create(orderStatusRequestBody, { transaction })
                // UPDATE CART STATUS 
                await db.cart.update({ status: cartEnum.Placed }, { where: { id: cartId }, transaction })

                const reply = {
                    success: true,
                    message: createSuccess(sense),
                    data: { id: order.id }
                }
                res.send(reply);

                // getCartProduct(cartId).then(cartItem => {
                //     cartItem.map((item) => {
                //         item.product.map((product) => {
                //             if (product?.varient) {


                //             }
                //         })
                //     })
                // })


            }
            catch (err) {
                sendErrorMessage(err, res)
            }
        })
    } catch (err) {
        sendErrorMessage(err, res)
    }
}

// "GET" REQUEST TO FETCH ORDER LIST
exports.list = async (req, res) => {
    try {
        const addressList = await getOrderList(req.user.id, res);
        if (!addressList) return true // RETURN IF GET SOMETHING WRONG

        const reply = {
            success: true,
            message: listSuccess(sense),
            data: addressList
        }
        res.send(reply)

    } catch (err) {
        sendErrorMessage(err, res, [])
    }
}

// "DELETE" REQUEST TO CANCEL THE ORDER
exports.cancelOrder = (req, res) => {
    try {
        const { id } = req.body;
        db.orderStatus.update({ status: OrderStatusEnum.Canceled }, {
            where: { id }
        })
            .then(() => {
                const reply = {
                    success: true,
                    message: deleteSuccess(sense),
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

// "GET" REQUEST
exports.detail = (req, res) => {
    try {
        const { id } = req.params;
        db.order.findOne(
            {
                where: { id },
                attributes: ['id','fullName', 'email', 'phone', 'deliveryPhone', 'landmark', 'latitude', 'longitude', 'state', 'city', 'houseNumber', 'address', 'pincode', 'addressType', 'orderDiscount', 'orderTotal', 'orderSubtotal', 'deliveryCharges', 'paymentMethod', 'deliverOn', 'isPaid', 'paidAmount', 'discountAmount', 'paymentMethod', 'deliverOn', 'deliveryStartTime'],
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
                            attributes: ['quantity', 'price'],
                            include: {
                                model: db.product,
                                attributes: ['name'],
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

// HELPER FUNCTION
function getOrderList(userId, res) {
    return new Promise(async (resolve) => {
        try {
            db.order.findAll({
                where: { userId },
                attributes: ['id', 'orderTotal', 'orderSubtotal', 'paymentMethod', 'deliveryStartTime', 'deliveryEndTime', 'isPaid', 'paidAmount', 'discountAmount', 'currentStatus', 'createdAt'],
                order: [['id', 'DESC']]
            })
                .then(response => {
                    resolve(response)
                }).catch(err => {
                    resolve(null)
                    sendErrorMessage(err, res, [])
                })
        } catch (err) {
            resolve(null)
            sendErrorMessage(err, res, [])
        }
    })
}

