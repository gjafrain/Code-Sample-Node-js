const AWS = require('aws-sdk');

const SESConfig = {
}
AWS.config.update(SESConfig);
exports.sns = new AWS.SNS({apiVersion: '2010-12-01'})