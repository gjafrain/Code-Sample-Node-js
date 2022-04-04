const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const sense = 'CategoryType'

exports.list = async (req, res) => {
    try {
        db.categoryType.findAll({ where: { isDeleted: false } })
            .then(types => {
                console.log('response.....', types)
                const reply = {
                    success: true,
                    message: queryMessage.listSuccess(sense),
                    data: types
                }
                res.send(reply)
            })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
                    data: []
                }
                res.send(reply)
            })
    }
    catch (err) {
        const reply = {
            success: false,
            message: queryMessage.error(err),
        }
        res.send(reply)
    }
}