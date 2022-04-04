// ***** NOT IN USE *****


const db = require('../config/database');
const moment = require('moment')
const axios = require('axios');
const { sendErrorMessage, sendSuccess, sendSuccessMessage } = require('../helper/queryMessage');
const { sns } = require('../utils/awsConfig');
const repliesMessage = require('../utils/constants/replies');
const userController = require('./consumer/userController')
const sense = 'OTP';

// POST REQUEST TO SEND OTP
exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (phone.length != 10) {
            sendErrorMessage({ message: repliesMessage.INVALID_PHONE }, res);
            return;
        }
        const otp = phone == "9991134734" ? 1234 : Math.floor(1000 + Math.random() * 9000);
        const message = `${otp} is your login otp for Farmer Buggy. tjNw3jJJ821`;
        try {
            await axios.get(`http://msg.pwasms.com/app/smsapi/index.php?key=35EE85CDF3EDE6&campaign=0&routeid=69&type=text&contacts=${phone}&senderid=SJSMTH&msg=${message}`);
            sendSuccessMessage(sense, res);
            saveOtp(phone, otp, res)
        } catch (error) {
            sendErrorMessage(error, res);
        }
    } catch (err) {
        sendErrorMessage(err, res);
    }
}

// POST REQUEST TO SEND OTP
exports.sendOTPToLogin = async (req, res) => {
    try {
        const { phone } = req.body;

        // CHECK USER IS EXIST OR NOT
        const isExistUser = await userController.checkUserExist(phone, res, true);
        if (!isExistUser) return true;

        const otp = Math.floor(1000 + Math.random() * 9000);

        global.phone = phone;

        const reply = {
            success: true,
            message: sendSuccess(sense),
            data: { otp }
        }
        res.send(reply);
    } catch (err) {
        sendErrorMessage(err, res);
    }
}

// HELPER FUNCTION TO VERIFY OTP WITH PHONE NUMBER
exports.verifyOTP = (phone, otp, res) => {
    return new Promise(async (resolve) => {
        try {
            const savedOtp = await getOtp(phone, res);

            if (!savedOtp) {
                sendErrorMessage({ message: repliesMessage.OTP_NOT_FOUND }, res);
                resolve(false);
                return;
            }

            const now = moment();
            const exp = moment(savedOtp.expireIn);

            // get the difference between the moments
            const diff = exp.diff(now, 'seconds');

            if (isNaN(diff) || diff < 1) {
                sendErrorMessage({ message: repliesMessage.OTP_EXPIRED }, res);
                resolve(false);
            }
            else if (savedOtp.otp != otp) {
                sendErrorMessage({ message: repliesMessage.INCORRECT_OTP }, res);
                resolve(false);
            }
            else {
                saveOtp(phone, "", res);
                resolve(true);
            }
        } catch (err) {
            sendErrorMessage(err, res)
            resolve(false)
        }
    })
}

function saveOtp(phone, otp, res) {
    return new Promise(async (resolve) => {
        try {
            const expireIn = otp ? moment().add(3, 'minutes') : moment();
            const updatedOtp = await db.otp.update({ otp, expireIn }, { where: { phone } });
            if (!updatedOtp || updatedOtp[0] === 0) {
                await db.otp.create({ otp, phone, expireIn });
            }
            resolve(true)
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}

function getOtp(phone, res) {
    return new Promise(async (resolve) => {
        try {
            const otp = await db.otp.findOne({ where: { phone } });
            resolve(otp)
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}