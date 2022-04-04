const router = require('express').Router();
// Controller
const controller = require('../../controllers/consumer/categoryController')
// Form Validation 
const { validateBody, schemas } = require('../../helper/formValidations');

// Define routes
router.get('/list', controller.list);
router.get('/top10Category', controller.getTop10Category);

module.exports = router;