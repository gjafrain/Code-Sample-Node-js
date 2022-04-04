const { Op, where } = require("sequelize");
const multer = require('multer');
//
const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const { sendErrorMessage } = require('../../helper/queryMessage');
const { uploadProductImage } = require("../../utils/uploadFile");
const { addCategoryProduct, updateCategoryProduct } = require('./categoryController')
const sense = 'Product';

exports.list = (req, res) => {
    try {
        db.product.findAll(
            {
                where: { isDeleted: false },
                attributes: ['id', 'name', 'image', 'color', 'discreption'],
                include: [{
                    model: db.nature,
                    as: "nature",
                    attributes: ['name']
                },
                {
                    model: db.category,
                    attributes: ['name']
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
                sendErrorMessage(err, res, [])
            })
    } catch (err) {
        sendErrorMessage(err, res, [])
    }
}

exports.create = async (req, res) => {
    try {
        uploadProductImage(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                sendErrorMessage({ message: `Multer uploading error: ${err.message}` }, res, [], 500)
                return;
            } else if (err) {
                // An unknown error occurred when uploading.
                if (err.name == 'ExtensionError') {
                    sendErrorMessage({ message: err.message }, res, [])
                } else {
                    sendErrorMessage({ message: `unknown uploading error: ${err.message}` }, res, [])
                }
                return;
            }

            db.sequelize.transaction(async (transaction) => {
                try {
                    const { name, image, color, discreption, natureId, categoriesId, varients } = req.body,
                        productBody = { name, image, color, discreption, natureId };

                    productBody.image = req.file.path

                    const product = await db.product.create(productBody, { transaction });

                    const categoryProductBody = JSON.parse(categoriesId).map(x => ({ categoryId: x, productId: product.id }));

                    const varientsBody = JSON.parse(varients)
                    // ADD PRODUCT VARIENT
                    const productVarientResponse = await addProductVarient(varientsBody, product.id, res, transaction)
                    if (!productVarientResponse) return true;
                    // ADD PRODUCT INTO CATEGORY's PRODUCT LIST
                    const categoryProductResponse = await addCategoryProduct(categoryProductBody, res, transaction);
                    if (!categoryProductResponse) return true;

                    const reply = {
                        success: true,
                        message: queryMessage.createSuccess(sense),
                        data: { id: product.id }
                    }
                    res.send(reply);
                }
                catch (err) {
                    sendErrorMessage(err, res)
                }
            })
        })
    }
    catch (err) {
        sendErrorMessage(err, res)
    }
}

exports.update = (req, res) => {

    db.sequelize.transaction(async (transaction) => {
        try {
            const { name, color, discreption, natureId, categoriesId, id } = req.body,
                productBody = { name, color, discreption, natureId };
            await db.product.update(productBody, { where: { id }, transaction });
            const productCategories = await exports.fetchProductCategories(id, res, transaction);

            // CHECK proeduct have categories
            if (productCategories) {
                // FIND removed category
                const removedCategoryId = [];
                productCategories.map(x => {
                    if (!categoriesId.find(y => x.categoryId === y)) removedCategoryId.push(x.id)
                })
                // REMOVE Category
                removedCategoryId.length && await db.categoryProduct.destroy({ where: { id:removedCategoryId }, transaction });
            }

            await updateCategoryProduct(categoriesId, id, res, transaction);

            const reply = {
                success: true,
                message: queryMessage.updateSuccess(sense),
            }
            res.send(reply)
        }
        catch (err) {
            const reply = {
                success: false,
                message: queryMessage.error(err),
            }
            res.send(reply)
        }
    })
}

exports.updateProductImage = (req, res) => {
    try {
        uploadProductImage(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                sendErrorMessage({ message: `Multer uploading error: ${err.message}` }, res, [], 500)
                return;
            } else if (err) {
                // An unknown error occurred when uploading.
                if (err.name == 'ExtensionError') {
                    sendErrorMessage({ message: err.message }, res, [])
                } else {
                    sendErrorMessage({ message: `unknown uploading error: ${err.message}` }, res, [])
                }
                return;
            }

            db.product.update({ image: req.file.path }, { where: { id: req.body.id } })
                .then((response) => {
                    const reply = {
                        success: true,
                        message: queryMessage.updateSuccess(sense),
                    }
                    res.send(reply)
                })
                .catch(err => {
                    sendErrorMessage(err, res)
                })
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

exports.updateProductVarient = (req, res) => {
    try {
        const { id, updatedPrice, price, weightTypeId, weight, stock, isActiveStock } = req.body;

        const requestModal = {
            updatedPrice,
            price,
            isActiveStock,
            stock,
            weight,
            weightTypeId
        }

        requestModal.updatedPrice = updatedPrice >= price ? null : updatedPrice;
        db.productVarient.update(requestModal, { where: { id } })
            .then(() => {
                const reply = {
                    success: true,
                    message: queryMessage.updateSuccess(sense),
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
        const { id } = req.body;
        db.product.update({ isDeleted: true }, { where: { id } })
            .then(types => {
                const reply = {
                    success: true,
                    message: queryMessage.deleteSuccess(sense),
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

exports.byNatureId = (req, res) => {
    try {
        const { id } = req.query;
        db.product.findAll({
            where: {
                [Op.and]: [{ natureId: id }, { isDeleted: false }]
            },
            attributes: ['id', 'name', 'image', 'color', 'discreption'],
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
        }).then(response => {
            const reply = {
                success: true,
                message: queryMessage.deleteSuccess(sense),
                data: response
            }
            res.send(reply)
        })
            .catch(err => {
                sendErrorMessage(err, res)
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

exports.byProductId = (req, res) => {
    try {
        const { id } = req.query;
        db.product.findOne({
            where: {
                [Op.and]: [{ id }, { isDeleted: false }]
            },
            attributes: ['id', 'name', 'image', 'color', 'discreption', 'natureId'],
            include: [
                {
                    model: db.productVarient,
                    as: 'varients',
                    attributes: ['id', 'weight', 'updatedPrice', 'price', 'isActiveStock', 'stock'],
                    include: {
                        model: db.weightType,
                        as: 'type',
                        attributes: ['id'],
                    },
                },
                {
                    model: db.categoryProduct,
                    attributes: ['id', 'categoryId'],
                }
            ]
        }).then(response => {
            const reply = {
                success: true,
                message: queryMessage.deleteSuccess(sense),
                data: response
            }
            res.send(reply)
        }).catch(err => {
            sendErrorMessage(err, res)
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

function addProductVarient(productVarientBody, productId, res, transaction) {
    return new Promise((resolve) => {
        try {
            productVarientBody = productVarientBody.map(x => ({
                ...x,
                productId: productId,
                updatedPrice: x.updatedPrice >= x.price ? null : x.updatedPrice,
            }))
            db.productVarient.bulkCreate(productVarientBody, { transaction })
                .then(response => {
                    resolve(response.length)
                })
                .catch(err => {
                    sendErrorMessage(err, res)
                    resolve(null)
                })
        }
        catch (err) {
            sendErrorMessage(err, res)
            resolve(null)
        }
    })
}

exports.fetchProductCategories =  (productId, res, transaction) => {
    return new Promise(async(resolve) => {
        try {
            const categories = await db.categoryProduct.findAll({ where: { productId }, transaction, attributes: ["id", "categoryId"] })
            resolve(categories);
        }
        catch (err) {
            queryMessage.sendErrorMessage(err, res);
            resolve(null)
        }
    })
}
