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

exports.create = async (req, res) => {
    try {
        const requestBody = req.value.body;
        db.categoryType.create(requestBody)
            .then(response => {
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
        const requestBody = req.value.body;
        db.categoryType.update(requestBody, {
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
        const requestBody = req.value.body;
        db.categoryType.update({ isDeleted: true }, {
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