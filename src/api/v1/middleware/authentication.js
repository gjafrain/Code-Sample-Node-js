const jwt = require('jsonwebtoken');
//
const { sendErrorMessage } = require('../helper/queryMessage');
const { SESSION_CODE_REQUIRED, TOKEN_EXPIRED, SESSION_CODE_EXPIRED } = require('../utils/constants/replies')

exports.genrateToken = async (user) => {
    return await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}

exports.genrateSessionCode = async (user) => {
    return await jwt.sign({ id: user.id }, '_')
}

exports.refreshToken = (token) => {
}

// HELPER FUNCTION TO SAVE TOKEN IN DB
exports.saveToken = (db, tokenModel, res) => {
    return new Promise(async (resolve) => {
        try {
            const hasToken = await db.token.findOne({ where: { deviceId: tokenModel.deviceId } })
            hasToken ?
                await db.token.update(tokenModel, { where: { deviceId: tokenModel.deviceId } })
                : await db.token.create(tokenModel)
            resolve(true);
        }
        catch (err) {
            sendErrorMessage(err, res);
            resolve(false)
        }
    })
}

// HELPER FUNCTION TO SAVE TOKEN IN DB
exports.updateToken = (db, tokenModel, userId, res) => {
    return new Promise((resolve) => {
        try {
            db.token.update(tokenModel, {
                where: { userId }
            }).then(() => {
                resolve(true);
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

exports.removeAllTokens = (db, userId, res) => {
    return new Promise((resolve) => {
        try {
            db.token.destroy({ where: { userId } }).then(() => {
                resolve(true);
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

exports.authenticationToken = (req, res, nxt) => {
    try {
        let token = req.headers['authorization'];
        // CHECK IF USER HAS "authentication" ELSE GET FROM SESSSION_CODE 
        if (!token) {
            token = req.headers['sessioncode'];
            // IF USER HAS NO SESSION_CODE SEND ERROR MESSAGE WITH STATUS CODE 402
            if (!token) {
                return sendErrorMessage({ message: SESSION_CODE_REQUIRED }, res, {}, 440)
            }
            else {
                jwt.verify(token, '_', (error, user) => {
                    if (error)
                        return sendErrorMessage({ message: SESSION_CODE_EXPIRED }, res, {}, 440);
                    req.user = { ...user, isGuest: true };
                    nxt()
                })
            }
        } else {

            const tokenType = token.split(' ')[0];
            token = token.split(' ')[1];

            if (tokenType !== 'Bearer')
                return sendErrorMessage({ message: AUTHENTICATION_DENIED }, res, {}, 401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
                if (error) return sendErrorMessage({ message: TOKEN_EXPIRED }, res, {}, 401);
                req.user = user;
                nxt()
            })
        }
    }
    catch (err) {
        sendErrorMessage(err, res);
    }
}