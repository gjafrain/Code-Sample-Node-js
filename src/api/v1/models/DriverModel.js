
module.exports = (sequelize, DataTypes) => {
    const DriverModel = sequelize.define('driver',
        {
            vehicleNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            vehicleName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            adharNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            drivingLicenceImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            drivingLicenceNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
        }, {
        freezeTableName: true
    })
    DriverModel.associate = (db) => {
        DriverModel.belongsTo(db.user);
        db.user.hasOne(DriverModel);
    }
    return DriverModel
}
