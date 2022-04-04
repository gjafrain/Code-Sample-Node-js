const multer = require('multer');
var fs = require('fs')
// 
const categoryStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './images/category/')
    },
    filename: function (req, file, callback) {
        callback(null, new Date().toISOString() + file.originalname)
    }
})

const productStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        const path = "./images/product/"
        fs.exists(path, (exists) =>{
            if (!exists) fs.mkdir(path, (err) => callback(err, path))
            else callback(null, path)
        })
    },
    filename: function (req, file, callback) {
        callback(null, new Date().toISOString() + file.originalname)
    }
})

const limits = {
    filesize: 1024 * 1024
}

const fileFormat = (req, file, callback) => {
    console.log('file.mimeType....', file)
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        callback(null, true)
    } else {
        callback(null, false);
        const err = new Error('Only .png, .jpg and .jpeg format allowed!')
        err.name = 'ExtensionError'
        return callback(err);
    }
}

const categoryFields = [
    { name: 'image', maxCount: 1 },
    { name: 'thumbImage', maxCount: 1 },
]

exports.uploadCategoryImage = multer({ storage: categoryStorage, limits, fileFilter: fileFormat }).fields(categoryFields)
exports.uploadProductImage = multer({ storage: productStorage, limits, fileFilter: fileFormat }).single('image')
