const db = require('../../config/database');
// 
const { sendErrorMessage } = require('../../helper/queryMessage');
const { SupportStatusEnum } = require('../../utils/enum');

exports.create = async (req, res) => {
    try {
        const { email, phone, type, description, rating, platform, title } = req.body,
            requestBody = {
                email, phone, type, description, rating, platform, title, status: SupportStatusEnum.Pending
            };
        await db.support.create(requestBody);

        const message = type === 'Feedback'
            ? "Thank you for your feedback."
            : type === 'Bug'
                ? "Your bug has been submitted, we will try to resolve in next update!"
                : "Thank you for your idea.";

        const reply = {
            success: true,
            message
        }
        res.send(reply)
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}