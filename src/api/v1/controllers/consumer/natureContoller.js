const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const sense = 'Nature';

exports.list = (req, res) => {
    try {
        db.nature.findAll(
            { where: { isDeleted: false } })
            .then(response => {
                const reply = {
                    success: true,
                    message: queryMessage.listSuccess(sense),
                    data: response
                }
                res.send(reply)
            }).catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
                    data: []
                }
                res.send(reply)
            })
    } catch (err) {
        const reply = {
            success: false,
            message: queryMessage.error(err),
            data: []
        }
        res.send(reply)
    }
}