var admin = require("firebase-admin");

var serviceAccount = require("./farmerBuggy.json");

exports.firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// module.exports = firebase;