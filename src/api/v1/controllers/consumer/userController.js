const db = require('../../config/database');
// 
const { sendErrorMessage, createSuccess, updateSuccess, deleteSuccess, sendSuccessMessage, sendUpdatedSuccess } = require('../../helper/queryMessage');
const repliesMessage = require('../../utils/constants/replies');
//
const { saveToken, removeAllTokens, genrateSessionCode } = require('../../middleware/authentication');
const { UserRoleEnum } = require('../../utils/enum');
const sense = 'User';

// "POST" REQUEST TO CREATE USER AND LOGIN AS WELL
exports.create = async (req, res) => {
    try {
        const { name, lastName, email, phone, profileImage, dateOfBirth } = req.body,
            userRequestBody = {
                name,
                lastName,
                email,
                phone,
                profileImage,
                dateOfBirth,
                roleId: 2
            },
            userId = req.user.id;

        // CREATE USER
        let user = await exports.updateUser(userId, userRequestBody, res);
        if (!user) return true;

        // FIND USER
        user = await db.user.findOne({ where: { id: userId }, attributes: ['name', 'lastName', 'phone', 'email', 'id'] })

        const reply = {
            success: true,
            message: createSuccess(sense),
            data: user
        };
        res.send(reply);
    } catch (err) {
        sendErrorMessage(err, res);
    }
}

// PUT REQUEST TO UPDATE USER
exports.update = async (req, res) => {
    try {
        const { name, lastName, email, id } = req.body,
            userRequestBody = {
                name,
                lastName,
                email,
            };

        // UPDATE USER
        const user = await exports.updateUser(id, userRequestBody, res);
        if (!user) return true;

        const reply = {
            success: true,
            message: updateSuccess(sense),
            data: userRequestBody
        };
        res.send(reply);
    } catch (err) {
        sendErrorMessage({ message: phone + repliesMessage }, res);
    }
}

// DELETE REQUEST TO DELETE USER
exports.delete = async (req, res) => {
    try {
        const { id } = req.body,
            userRequestBody = {
                isDeleted: true
            }

        // CREATE USER
        const user = await exports.updateUser(id, userRequestBody, res);
        if (!user) return true;

        const deleteTokenSuccess = await removeAllTokens(db, id, res);
        if (!deleteTokenSuccess) return true;

        const reply = {
            success: true,
            message: deleteSuccess('Your Account'),
            data: userRequestBody
        };
        res.send(reply);
    } catch (err) {
        sendErrorMessage({ message: phone + repliesMessage }, res);
    }
}

// POSR REQUEST TO CREATE GUEST USER
exports.createGuestUser = async (req, res) => {
    try {
        const userRequestBody = {
            name: '',
            lastName: '',
            email: '',
            phone: '',
            profileImage: '',
            dateOfBirth: '',
            roleId: UserRoleEnum.Consumer
        };

        // CREATE USER
        const user = await createUser(userRequestBody, res);
        if (!user) return true;

        // CREATE TOKEN
        const sessionCode = req.body.sessionCode || await genrateSessionCode(user),
            tokenModel = {
                sessionCode,
                userId: user.id,
                deviceId: req.body.deviceId
            };

        // SAVED TOKEN
        const isSaved = await saveToken(db, tokenModel, res);
        if (!isSaved) return true;

        const deviceDetailModel = {
            deviceBrand: req.body.deviceBrand,
            deviceId: req.body.deviceId,
            appVersion: req.body.appVersion,
            deviceType: req.body.deviceType,
            fcmToken: req.body.fcmToken,
            userId: user.id
        }

        // SAVED DEVICE DETAIL
        const isAdded = await addDeviceDetail(deviceDetailModel, res);
        if (!isAdded) return true;

        const reply = {
            success: true,
            message: createSuccess('Session'),
            data: { sessionCode, user }
        };
        res.send(reply);
    } catch (err) {
        sendErrorMessage(err, res);
    }
}

// HELPER FUNCTION TO CHECK IF USER EXIST OR NOT 
exports.checkUserExist = (phone, res, shouldAlreadyExist = false) => {
    return new Promise(async (resolve) => {
        try {
            const userExist = await db.user.findOne({ where: { phone }, attributes: ['phone'] });
            if (shouldAlreadyExist && userExist) resolve(true);
            else if (shouldAlreadyExist && !userExist) {
                sendErrorMessage({ message: repliesMessage.ACCOUNT_NOT_EXIST }, res);
                resolve(false);
            }
            else if (userExist && !shouldAlreadyExist) {
                sendErrorMessage({ message: phone + repliesMessage.ALREADY_EXIST }, res);
                resolve(true);
            } else resolve(false);
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(true)
        }
    })
}

// HELPER FUNCTION TO CREATE USER
function createUser(userModel, res) {
    return new Promise(async (resolve) => {
        try {
            db.user.create(userModel).then(response => {
                userModel['id'] = response.id
                resolve(userModel);
            }).catch(err => {
                sendErrorMessage(err, res);
                resolve(false)
            });
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}

// HELPER FUNCTION TO UPDATE USER
exports.updateUser = (id, userModel, res) => {
    return new Promise(async (resolve) => {
        try {
            db.user.update(userModel, { where: { id } }).then((user) => {
                userModel.id = id
                resolve(userModel);
            }).catch(err => {
                sendErrorMessage(err, res);
                resolve(false)
            });
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}

// "PUT" Request
exports.updateDeviceDetail = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await db.deviceDetail.update({ fcmToken }, { where: { userId:req.user.id } });
        sendUpdatedSuccess('Device Detail', res)
    }
    catch (err) {
        sendErrorMessage(err, res);
        resolve(false)
    }
}

function addDeviceDetail(model, res) {
    return new Promise(async (resolve) => {
        try {
            db.deviceDetail.create(model).then(user => {
                resolve(user);
            }).catch(err => {
                sendErrorMessage(err, res);
                resolve(false)
            });
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}

exports.getUserById = (id, res) => {
    return new Promise(async (resolve) => {
        try {
            db.user.findOne({ where: { id } }).then(user => {
                resolve(user);
            }).catch(err => {
                sendErrorMessage(err, res);
                resolve(false)
            });
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}