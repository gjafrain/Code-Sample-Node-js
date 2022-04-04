const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const sense = 'Category';

exports.list = async (req, res) => {
    try {
        db.category.findAll({
            where: { isDeleted: false },
            attributes: ['id', 'name', 'image', 'thumbImage', 'color']
        })
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

exports.getTop10Category = (req, res) => {
    try {
        db.category.findAll({
            where: { isDeleted: false },
            attributes: ['id', 'name'],
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