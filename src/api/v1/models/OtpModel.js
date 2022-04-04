module.exports = (db, DataTypes) => {
    const OtpModel = db.define('otp', {
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        expireIn: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        freezeTableName: true
    })
    return OtpModel;
}