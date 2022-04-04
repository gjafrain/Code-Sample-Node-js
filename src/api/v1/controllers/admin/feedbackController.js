const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const sense = 'Feedback';

exports.list = (req, res) => {
    try {
        db.feedback.findAll(
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

exports.create = async (req, res) => {
    try {
        const requestBody = req.body;
        db.feedback.create(requestBody)
            .then(response => {
                console.log('response....', response)
                const reply = {
                    success: true,
                    message: queryMessage.createSuccess(sense),
                }
                res.send(reply)
            })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
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

exports.update = async (req, res) => {
    try {
        const requestBody = req.body;
        db.feedback.update(requestBody, {
            where: {
                id: requestBody.id
            }
        })
            .then(types => {
                const reply = {
                    success: true,
                    message: queryMessage.updateSuccess(sense),
                }
                res.send(reply)
            })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
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

exports.delete = (req, res) => {
    try {
        const requestBody = req.body;
        db.feedback.update({ isDeleted: true }, {
            where: {
                id: requestBody.id
            }
        }).then(types => {
            const reply = {
                success: true,
                message: queryMessage.deleteSuccess(sense),
            }
            res.send(reply)
        })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
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