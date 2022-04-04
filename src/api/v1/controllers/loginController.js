const db = require('../config/database');
const { sendErrorMessage, success } = require('../helper/queryMessage');
const { LOGIN_SUCCESS_MSG, ACCOUNT_NOT_EXIST } = require('../utils/constants/replies');
const { verifyOTP } = require('./OTPController');
const { genrateToken } = require('../middleware/authentication');
const { updateUser } = require('./consumer/userController');
const { modifyCart } = require('./consumer/cartController');

// "POST" REQUEST
exports.login = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const isVerify = await verifyOTP(phone, otp, res);
        if (!isVerify) return;

        let user = await db.user.findOne(
            { where: { phone }, attributes: ['name', 'lastName', 'phone', 'email', 'dateOfBirth', 'roleId', 'id'] })

        if (!user) {
            // CHECK IF REQUEST HAS USER
            if (req.user) {
                user = await updateUser(req.user.id, { phone }, res);
                if (!user) return true;
            } else {
                sendErrorMessage({ message: ACCOUNT_NOT_EXIST }, res)
                return true
            }
        } else {
            user = user.get()
        }
        req.user && await modifyCart(req.user.id, user.id)
        // CREATE TOKEN
        const token = await genrateToken({ id: user.id });

        user['token'] = token;
        user['refreshToken'] = token;

        const reply = {
            success: true,
            message: success(LOGIN_SUCCESS_MSG),
            data: user
        }
        res.send(reply)
    } catch (err) {
        sendErrorMessage(err, res)
    }
}
