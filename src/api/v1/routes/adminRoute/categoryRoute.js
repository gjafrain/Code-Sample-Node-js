const router = require('express').Router();
// Controller
const controller = require('../../controllers/admin/categoryController')
// Form Validation 
const { validateBody, schemas } = require('../../helper/formValidations');
const { sendErrorMessage } = require('../../helper/queryMessage');

// Define routes
router.get('/list', controller.list);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.delete);
router.get('/top10Category', controller.getTop10Category);
router.get('/getById/:id', controller.getById);
router.get('/options', controller.options);
router.put('/updateImage', controller.updateImage);

module.exports = router;