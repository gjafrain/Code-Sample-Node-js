const router = require('express').Router();
// IMPORT ROUTES
const categoryTypeRoute = require('./categoryTypeRoute');
const categoryRoute = require('./categoryRoute');
const natureRoute = require('./natureRoute');
const productRoute = require('./productRoute');
const feedbackRoute = require('./feedbackRoute');
const weightTypeRoute = require('./weightTypeRoute');
const useRoleRoute = require('./useRoleRoute');
const orderRoute = require('./orderRoute');
const storeRoute = require('./storeRoute');
const paymentRoute = require('./paymentRoute');
const { login } = require('../../controllers/loginController');
const { sendOTP } = require('../../controllers/OTPController');

// Integrate routes
router.post('/sendOTP', sendOTP);
router.use('/categoryType/', categoryTypeRoute);
router.use('/category/', categoryRoute);
router.use('/nature/', natureRoute);
router.use('/product/', productRoute);
router.use('/feedback/', feedbackRoute);
router.use('/weightType/', weightTypeRoute);
router.use('/userRole/', useRoleRoute);
router.use('/order/', orderRoute)
router.use('/store/', storeRoute)
router.use('/payment/', paymentRoute)
router.post('/login/', login);

module.exports = router;