const router = require('express').Router();
// IMPORT ROUTES
const consumerRoute = require('./consumerRoute');
const adminRoute = require('./adminRoute');
const driverRoute = require('./driverRoute');
const { login } = require('../controllers/loginController');
const { sendOTP, sendOTPToLogin, verifyOTP } = require('../controllers/OTPController');
// AUTH 
const { authenticationToken } = require('../middleware/authentication');
const { updateUser } = require('../controllers/consumer/userController');
const { list } = require('../controllers/admin/userController');
const { getCartProduct } = require('../controllers/consumer/cartController');

router.post('/userSlef', async (req, res) => {
  return await updateUser(req.body.id, { roleId: req.body.roleId }, res)
})

router.get('/getAll', (req, res) => list(req, res))

// Define routes
router.post('/sendOTP', sendOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/sendOtpToLogin', sendOTPToLogin);
router.post('/login', authenticationToken, login);
router.use('/admin', adminRoute);
router.use('/driver', driverRoute);
router.use('/', consumerRoute);



module.exports = router;