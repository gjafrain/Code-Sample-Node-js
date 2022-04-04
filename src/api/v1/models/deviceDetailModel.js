module.exports = (db, DataTypes) => {
    const deviceDetailModel = db.define('deviceDetail', {
        fcmToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deviceType: {
            type: DataTypes.ENUM('iOS', 'Android', 'Web'),
            allowNull: false,
            defaultValue: 'Android'
        },
        deviceBrand: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        deviceName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        appVersion: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        isLogin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

    }, {
        freezeTableName: true
    })

    deviceDetailModel.associate = (db) => {
        db.user.hasOne(deviceDetailModel, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
            }
        })
    }
    return deviceDetailModel;
}