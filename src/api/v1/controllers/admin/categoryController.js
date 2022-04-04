
const db = require('../../config/database');
const multer = require('multer');

// 
const queryMessage = require('../../helper/queryMessage');
const { uploadCategoryImage } = require('../../utils/uploadFile');
const sense = 'Category';

exports.list = async (req, res) => {
    try {
        db.category.findAll({
            where: { isDeleted: false },
            attributes: ['id', 'name', 'image', 'thumbImage', 'color'],
            include: [{
                model: db.nature,
                as: "nature",
                attributes: ['name']
            },
            {
                model: db.categoryType,
                as: "categoryType",
                attributes: ['name']
            }]
        })
            .then(data => {
                const reply = {
                    success: true,
                    message: queryMessage.listSuccess(sense),
                    data
                }
                res.send(reply)
            })
            .catch(err => {
                queryMessage.sendErrorMessage(err, res, [])
            })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res, [])
    }
}

exports.create = (req, res) => {
    try {
        uploadCategoryImage(req, res, (err) => {
            console.log('....', err)
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                queryMessage.sendErrorMessage({ message: `Multer uploading error: ${err.message}` }, res, [], 500)
                return;
            } else if (err) {
                // An unknown error occurred when uploading.
                if (err.name == 'ExtensionError') {
                    queryMessage.sendErrorMessage({ message: err.message }, res, [])
                } else {
                    queryMessage.sendErrorMessage({ message: `unknown uploading error: ${err.message}` }, res, [])
                }
                return;
            }

            if (req.files.image && req.files.thumbImage) {
                queryMessage.sendErrorMessage({ message: 'Category Image is required!' }, res)
                return;
            }

            const requestBody = req.body;

            requestBody.image = req.files.image ? req.files.image[0].path : '';
            requestBody.thumbImage = req.files.thumbImage ? req.files.thumbImage[0].path : requestBody.image;

            db.category.create(requestBody)
                .then(response => {
                    console.log('response....', response)
                    const reply = {
                        success: true,
                        message: queryMessage.createSuccess(sense),
                        id: response.id
                    }
                    res.send(reply)
                })
                .catch(err => {
                    queryMessage.sendErrorMessage(err, res)
                })
        })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

exports.update = async (req, res) => {
    try {
        const requestBody = req.body;
        db.category.update(requestBody, {
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
                queryMessage.sendErrorMessage(err, res)
            })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

exports.updateImage = async (req, res) => {
    try {
        uploadCategoryImage(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                queryMessage.sendErrorMessage({ message: `Multer uploading error: ${err.message}` }, res, [], 500)
                return;
            } else if (err) {
                // An unknown error occurred when uploading.
                if (err.name == 'ExtensionError') {
                    queryMessage.sendErrorMessage({ message: err.message }, res, [])
                } else {
                    queryMessage.sendErrorMessage({ message: `unknown uploading error: ${err.message}` }, res, [])
                }
                return;
            }

            if (req.files.image && req.files.thumbImage) {
                queryMessage.sendErrorMessage({ message: 'Category Image is required!' }, res)
                return;
            }

            const requestBody = req.body;

            requestBody.image = req.files.image ? req.files.image[0].path : '';
            requestBody.thumbImage = req.files.thumbImage ? req.files.thumbImage[0].path : requestBody.image;

            db.category.update(requestBody, { where: { id: req.body.id } })
                .then((response) => {
                    const reply = {
                        success: true,
                        message: queryMessage.updateSuccess(sense),
                    }
                    res.send(reply)
                })
                .catch(err => {
                    queryMessage.sendErrorMessage(err, res)
                })
        })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

exports.delete = (req, res) => {
    try {
        const requestBody = req.body;
        db.category.update({ isDeleted: true }, {
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
                queryMessage.sendErrorMessage(err, res)
            })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

exports.getTop10Category = (req, res) => {
    try {
        db.category.findAll({
            where: { isDeleted: false },
            attributes: ['id', 'name', 'image', 'thumbImage', 'color', 'index'],
            include: {
                model: db.product,
                as: 'products',
                attributes: ['id', 'name', 'image', 'color', 'discreption'],
                through: {
                    attributes: [],
                },
                include: {
                    model: db.productVarient,
                    as: 'varients',
                    attributes: ['id', 'weight', 'updatedPrice', 'price', 'isActiveStock', 'stock'],
                    include: {
                        model: db.weightType,
                        as: 'type',
                        attributes: ['name'],
                    }
                }
            }
        })
            .then(types => {
                const reply = {
                    success: true,
                    message: queryMessage.listSuccess(sense),
                    data: types
                }
                res.send(reply)
            })
            .catch(err => {
                queryMessage.sendErrorMessage(err, res), []
            })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res, [])
    }
}

// "GET" REQUEST
exports.options = async (req, res) => {
    try {
        db.category.findAll({
            where: { isDeleted: false },
            attributes: ['id', 'name']
        })
            .then(data => {
                const reply = {
                    success: true,
                    message: queryMessage.listSuccess(sense),
                    data
                }
                res.send(reply)
            })
            .catch(err => {
                queryMessage.sendErrorMessage(err, res, [])
            })
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res, [])
    }
}

exports.getById = (req, res) => {
    try {
        db.category.findOne(
            {
                where: { id: req.params.id },
                attributes: ['id', 'name', 'image', 'thumbImage', 'color'],
                include: [{
                    model: db.nature,
                    as: "nature",
                    attributes: ['id', 'name']
                },
                {
                    model: db.categoryType,
                    as: "categoryType",
                    attributes: ['id', 'name']
                },{
                    model: db.product,
                    as: "products",
                    // attributes: ['id', 'name']
                }]
            })
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

// ADD PRODUCT INTO CATEGORY's PRODUCT LIST
exports.addCategoryProduct = (categoryProductBody, res, transaction) => {
    return new Promise((resolve) => {
        db.categoryProduct.bulkCreate(categoryProductBody, { transaction })
            .then(response => {
                resolve(true)
            }).catch(err => {
                queryMessage.sendErrorMessage(err, res)
                resolve(null)
            })
    })
}

exports.updateCategoryProduct = (categoriesId, productId, res, transaction) => {
    return new Promise((resolve) => {
        const categoryProductBody = categoriesId.map(x => ({ categoryId: x, productId }))
        db.categoryProduct.bulkCreate(categoryProductBody, { updateOnDuplicate: ["categoryId", "productId"], transaction })
            .then(() => {
                resolve(true)
            }).catch(err => {
                queryMessage.sendErrorMessage(err, res)
                resolve(null)
            })
    })
}

