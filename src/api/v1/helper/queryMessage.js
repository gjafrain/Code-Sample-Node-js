const consts = require('../utils/constants')

exports.error = (valdationError = {}) => {
    if (!valdationError.errors)
        if (valdationError.message) return valdationError.message;
        else return consts.replies.DEFAULT_MESSAGE;
    else if (valdationError.errors.length) return valdationError.errors[0].message.replace(/_/g, ' ');
    else return consts.replies.DEFAULT_MESSAGE;
}

exports.success = (defaultMessage) => {
    return defaultMessage || consts.replies.SUCCESS_MESSAGE;
}

exports.addSuccess = (sense) => {
    return `${sense} ${consts.replies.ADD_SUCCESS}`;
}
exports.fetchSuccess = (sense) => {
    return `${sense} ${consts.replies.FETCH_SUCCESS}`;
}
exports.createSuccess = (sense) => {
    return `${sense} ${consts.replies.CREATED_SUCCESS}`;
}
exports.updateSuccess = (sense) => {
    return `${sense} ${consts.replies.UPDATED_SUCCESS}`;
}
exports.deleteSuccess = (sense) => {
    return `${sense} ${consts.replies.DELETED_SUCCESS}`;
}
exports.listSuccess = (sense) => {
    return `${sense} ${consts.replies.LIST_SUCCESS}`;
}
exports.sendSuccess = (sense) => {
    return `${sense} ${consts.replies.SEND_SUCCESS}`;
}


exports.sendSuccessMessage = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.sendSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendListSuccess = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.listSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendCreatedSuccess = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.createSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendFetchSuccess = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.fetchSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendUpdatedSuccess = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.updateSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendDeletedSuccess = (sense, res, data, status = 200) => {
    const reply = {
        success: true,
        message: exports.deleteSuccess(sense),
        data
    };
    res.status(status).send(reply);
}

exports.sendErrorMessage = (err, res, data = {}, status = 200) => {
    const reply = {
        success: false,
        message: exports.error(err),
        data
    };
    res.status(status).send(reply);
}