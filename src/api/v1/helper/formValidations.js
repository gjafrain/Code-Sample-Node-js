const Joi = require('joi');
const consts = require('../utils/constants');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = schema.validate(req.body);
            if (result.error) {
                return res.status(400).json({ success: false, message: result.error.message, validationError: true })
            }
            if (!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
        }
    },

    schemas: {
        createCategoryType: Joi.object().keys({
            name: Joi.string().required().error(Error(consts.validation.NAME_REQUIRED)),
            image: Joi.any(),
            isActive: Joi.boolean().optional().error(Error(consts.validation.ISACTIVE_VALUE_TYPE_ERROR)),
        }),
        updateCategoryType: Joi.object().keys({
            name: Joi.string().required().error(new Error(consts.validation.NAME_REQUIRED)),
            id: Joi.number().required().error(new Error(consts.validation.ID_REQUIRED)),
            image: Joi.any(),
            isActive: Joi.boolean().optional().error(new Error(consts.validation.ISACTIVE_VALUE_TYPE_ERROR))
        }),
        deleteCategoryType: Joi.object().keys({
            id: Joi.number().required().error(new Error(consts.validation.CATEGORY_TYPE_ID_REQUIRED))
        }),
    }
}
