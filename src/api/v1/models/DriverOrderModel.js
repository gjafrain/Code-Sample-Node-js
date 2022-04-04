
module.exports = (sequelize, DataTypes) => {
    const DriverOrderModel = sequelize.define('driverOrder',
        {
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue: false
            }
        }, {
        freezeTableName: true
    })
    DriverOrderModel.associate = (db) => {
        DriverOrderModel.belongsTo(db.driver);
        db.driver.hasOne(DriverOrderModel);
        DriverOrderModel.belongsTo(db.order);
        db.order.hasOne(DriverOrderModel);
        DriverOrderModel.belongsTo(db.storeOrder);
        db.storeOrder.hasMany(DriverOrderModel);
    }
    return DriverOrderModel
}
