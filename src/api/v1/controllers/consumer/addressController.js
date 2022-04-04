const { Op } = require("sequelize");
const db = require('../../config/database');
// 
const { sendErrorMessage, listSuccess, createSuccess, updateSuccess, deleteSuccess, sendUpdatedSuccess, sendDeletedSuccess } = require('../../helper/queryMessage');
const sense = 'Address';

exports.list = async (req, res) => {
    try {
        const addressList = await getAddressList(req.user.id, res);
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

exports.create = async (req, res) => {
    try {
        const { phone, state, city, address, type, pincode, latitude, longitude, landmark, houseNumber } = req.body,
            addressRequestBody = {
                phone,
                state,
                city,
                address,
                type,
                landmark,
                houseNumber,
                latitude,
                longitude,
                pincode,
                userId: req.user.id,
            };
        db.address.create(addressRequestBody)
            .then(async () => {
                const addressList = await getAddressList(req.user.id, res);
                if (!addressList) return true // RETURN IF GET SOMETHING WRONG
                const reply = {
                    success: true,
                    message: createSuccess(sense),
                    data: addressList
                }
                res.send(reply)
            })
            .catch(err => {
                sendErrorMessage(err, res, [])
            })
    }
    catch (err) {
        sendErrorMessage(err, res, [])
    }
}

exports.update = async (req, res) => {
    try {
        const { phone, state, city, address, type, landmark, houseNumber, latitude, longitude, pincode, id, isDefault } = req.body,
            addressRequestBody = {
                phone,
                state,
                city,
                address,
                type,
                landmark,
                houseNumber,
                latitude,
                longitude,
                pincode,
                userId: req.user.id,
                isDefault
            };
        db.address.update(addressRequestBody, {
            where: { id }
        })
            .then(async () => {
                const addressList = await getAddressList(req.user.id, res);
                if (!addressList) return true // RETURN IF GET SOMETHING WRONG
                const reply = {
                    success: true,
                    message: updateSuccess(sense),
                    data: addressList
                }
                res.send(reply)
            })
            .catch(err => {
                sendErrorMessage(err, res, [])
            })
    }
    catch (err) {
        sendErrorMessage(err, res, [])
    }
}

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;
        await db.sequelize.transaction(async (transaction) => {
            await db.address.update({ isDeleted: true }, { where: { id }, transaction })
            sendDeletedSuccess(sense, res, { id })
        })
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// "POST" REQUEST 
// {id} IN BODY
exports.setDefault = async (req, res) => {
    try {
        const { id } = req.body,
            userId = req.user.id;

        await db.sequelize.transaction(async (transaction) => {

            const defaultAddressList = await db.address.findAll({
                where: { [Op.and]: [{ userId }, { isDefault: true }] },
                attributes: ['id'],
                transaction
            });

            if (defaultAddressList?.length) {
                const ids = defaultAddressList.map(address => address.id)
                await db.address.update({ isDefault: false }, { where: { id: ids }, transaction })
            }

            await db.address.update({ isDefault: true }, { where: { id }, transaction })
            const addressList = await getAddressList(userId, res, transaction)
            sendUpdatedSuccess(sense, res, addressList)
        })
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

// HELPER FUNCTION
function getAddressList(userId, res, transaction) {
    return new Promise(async (resolve) => {
        try {
            db.address.findAll({
                where: { [Op.and]: [{ userId }, { isDeleted: false }] },
                attributes: ['id', 'address', 'houseNumber', 'pincode', 'type', 'landmark', 'isDefault', 'phone', 'latitude', 'longitude'],
                transaction
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

// HELPER FUNCTION
exports.getAddressById = (id, res) => {
    return new Promise(async (resolve) => {
        try {
            db.address.findOne({
                where: { id },
                attributes: ['id', 'address', 'houseNumber', 'pincode', 'type', 'landmark', 'fullName', 'phone', 'latitude', 'longitude']
            })
                .then(response => {
                    resolve(response)
                }).catch(err => {
                    resolve(null)
                    sendErrorMessage(err, res)
                })
        } catch (err) {
            resolve(null)
            sendErrorMessage(err, res)
        }
    })
}