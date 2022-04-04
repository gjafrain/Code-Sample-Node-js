const router = require('express').Router();
// Controller
const controller = require('../../controllers/admin/categoryTypeController');
// Form Validation 
const { validateBody, schemas } = require('../../helper/formValidations');

// Define routes
router.get('/list', controller.list);
router.post('/', validateBody(schemas.createCategoryType), controller.create);
router.put('/', validateBody(schemas.updateCategoryType), controller.update);
router.delete('/', validateBody(schemas.deleteCategoryType), controller.delete);

module.exports = router;