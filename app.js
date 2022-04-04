require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
//
const db = require('./src/api/v1/config/database');
// IMPORT ROUTES
const mainRoutes = require('./src/routes');
// Sync DB, in case if there filed/table missing
db.sequelize.sync()
    .then(() => console.log('DB Conected......!'))
    .catch(err => console.log('Error: ', err))

const app = express();

// CROSS ACCESS
app.use(cors())


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// DEFAULT ROUTE
app.get('/', (req, res) => { res.send('Welcome To GreenFarmer :)') })
// IMAGES PATH
app.use('/images/category', express.static('images/category'))
app.use('/images/product', express.static('images/product'))
// Api routes
app.use('/', mainRoutes);

const PORT = process.env.PORT || 3300;

app.listen(PORT, console.log('Server is running on ' + PORT + ' port'));
