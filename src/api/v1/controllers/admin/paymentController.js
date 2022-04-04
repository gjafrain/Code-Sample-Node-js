const db = require('../../config/database');
// 
const { sendErrorMessage, sendListSuccess, sendUpdatedSuccess, success, listSuccess, sendSuccessMessage, sendCreatedSuccess, sendFetchSuccess } = require('../../helper/queryMessage');
const { OrderStatusEnum, StorePaymentStatusEnum } = require('../../utils/enum');
const { startDate, endDate } = require("../../utils/common");
const { SUCCESS_MESSAGE } = require("../../utils/constants/replies");
const sense = 'Payment';


// "GET" REQUEST 
exports.getPaymentByStoreOrderId = async (req, res) => {
    const { id } = req.query;
    try {
        const paymet = await db.storeOrderPayment.findOne({ where: { storeOrderId: id } })
        sendFetchSuccess(sense, res, paymet)
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// "PUT" REQUEST 
exports.updateStoreOrderPayment = async (req, res) => {
    const { id, paymentMethod, paymentStatus, paymentRefId, paidBy, platform, paidAmount, } = req.body;
    try {
        const response = await db.storeOrderPayment.update({ paymentMethod, paymentStatus, paymentRefId, paidBy, platform, paidAmount }, { where: { id } })
        sendUpdatedSuccess(sense, res, response)
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}
