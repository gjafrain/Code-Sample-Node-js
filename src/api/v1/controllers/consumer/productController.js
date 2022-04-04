const { Op, literal } = require("sequelize");
//
const db = require('../../config/database');
// 
const { listSuccess, sendErrorMessage } = require('../../helper/queryMessage');
const replies = require('../../utils/constants/replies');

const sense = 'Product';

exports.list = (req, res) => {
    try {
        db.product.findAll(
            {
                where: { isDeleted: false },
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
            })
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

// POST REQUEST TO SERACH PRODUCT BY NAME 
exports.searchProduct = (req, res) => {
    try {
        const { search = '', weightType = '', orderByName, naturesId = [], minPrice = 0, maxPrice = 1000 } = req.body;
        db.product.findAll(
            {
                where: { [Op.and]: [{ isDeleted: false }, { name: { [Op.startsWith]: search } }] },
                order: [
                    ['name', orderByName || 'ASC'],
                ],
                attributes: ['id', 'name', 'image', 'color', 'discreption'],
                include: [{
                    model: db.productVarient,
                    as: 'varients',
                    attributes: ['id', 'weight', 'updatedPrice', 'price', 'isActiveStock', 'stock'],
                    where: {
                        [Op.and]: [{ price: { [Op.between]: [minPrice, maxPrice] } }]
                    },
                    include: {
                        model: db.weightType,
                        as: 'type',
                        attributes: ['name'],
                        where: weightType ? {
                            name: weightType
                        } : {}
                    }
                },
                {
                    model: db.nature,
                    attributes: ['id', 'name'],
                    where: naturesId.length ? { id: naturesId } : {}
                }]
            })
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

// "GET" REQUEST TO PRODUCTS BY CATEGORY ID 
exports.getProductsByCategoryId = (req, res) => {

    try {
        const { id } = req.query;
        console.log("id : ", id)
        const whereCondition = id ? { [Op.and]: [{ isDeleted: false }, { id }] } : { [Op.and]: [{ isDeleted: false }] };

        db.category.findAll({
            where: whereCondition,
            // right: true,
            attributes: ['name', 'color'],
            require: true,
            include: {
                model: db.product,
                as: 'products',
                // right: true,
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
            }
        })
            .then(response => {

                const data = {
                    name: response[0]?.name || '',
                    color: response[0]?.color || '',
                    products: response[0]?.products || []
                }

                if (!id) response.map(category => {
                    category.products.map(product => {
                        if (!data.products.find(y => product.id === y.id)) data.products.push(product);
                    })
                })

                const reply = {
                    success: true,
                    message: listSuccess(sense),
                    data: data
                }
                res.send(reply)
            }).catch(err => {
                sendErrorMessage(err, res)
            })
    } catch (err) {
        sendErrorMessage(err, res)
    }
}

// HELPER FUNCTION TO GET PRODUCT PRICE AND STOCK 
exports.getProductVarientById = (productId, id, quanitity = 1, res) => {
    return new Promise(async (resolve) => {
        try {
            const productVarient = await db.productVarient.findOne({
                where: { [Op.and]: [{ id }, { productId }] },
                attributes: ['updatedPrice', 'price', 'stock', 'isActiveStock']
            })
            if (productVarient) {
                resolve(productVarient);
            } else {
                sendErrorMessage(err, res, null)
                resolve(null)
            }
        }
        catch (err) {
            sendErrorMessage(err, res, null)
            resolve(null)
        }
    })
}

