
module.exports = (sequelize, DataTypes) => {
    const DriverOrderStatusModel = sequelize.define('driverOrderStatusHistory',
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
    DriverOrderStatusModel.associate = (db) => {
        DriverOrderStatusModel.belongsTo(db.driverOrder);
        db.driverOrder.hasMany(DriverOrderStatusModel);
    }
    return DriverOrderStatusModel
}
