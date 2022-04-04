const db = require('../../config/database');
// 
const { sendErrorMessage, listSuccess, createSuccess, updateSuccess, deleteSuccess } = require('../../helper/queryMessage');
const sense = 'Role';

exports.list = (req, res) => {
    try {
        db.userRole.findAll()
            .then(response => {
                const reply = {
                    success: true,
                    message: listSuccess(sense),
                    data: response
                }
                res.send(reply)
            }).catch(err => {
                sendErrorMessage(err, res, [])
            })
    } catch (err) {
        sendErrorMessage(err, res, [])
    }
}

exports.create = async (req, res) => {
    try {
        const requestBody = req.body;
        db.userRole.create(requestBody)
            .then(response => {
                const reply = {
                    success: true,
                    message: createSuccess(sense)
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

exports.update = async (req, res) => {
    try {
        const requestBody = req.body;
        db.userRole.update(requestBody, {
            where: {
                id: requestBody.id
            }
        })
            .then(types => {
                const reply = {
                    success: true,
                    message: updateSuccess(sense),
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

exports.delete = (req, res) => {
    try {
        const requestBody = req.body;
        db.userRole.update({ isDeleted: true }, {
            where: { id: requestBody.id }
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