const router = require('express').Router();
// IMPORT ROUTES
const categoryTypeRoute = require('./categoryTypeRoute');
const categoryRoute = require('./categoryRoute');
const natureRoute = require('./natureRoute');
const productRoute = require('./productRoute');
const feedbackRoute = require('./feedbackRoute');
const cartRoute = require('./cartRoute');
const userRoute = require('./userRoute');
const addressRoute = require('./addressRoute');
const orderRoute = require('./orderRoute');
const supportRoute = require('./supportRoute');
// CONTROLLER
const { createGuestUser, updateDeviceDetail } = require('../../controllers/consumer/userController');
// AUTH 
const { authenticationToken } = require('../../middleware/authentication');

// Integrate routes
// SELF ROUTE
router.post('/createSession', createGuestUser);
router.put('/deviceDetail', authenticationToken, updateDeviceDetail);
// REF ROUTE
router.use('/categoryType/', categoryTypeRoute);
router.use('/category/', categoryRoute);
router.use('/nature/', natureRoute);
router.use('/product/', productRoute);
router.use('/feedback/', authenticationToken, feedbackRoute);
router.use('/cart/', authenticationToken, cartRoute);
router.use('/user/', authenticationToken, userRoute);
router.use('/address', authenticationToken, addressRoute);
router.use('/order', authenticationToken, orderRoute);
router.use('/support', authenticationToken, supportRoute);

module.exports = router;