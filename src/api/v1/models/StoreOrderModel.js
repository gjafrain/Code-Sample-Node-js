module.exports = (db, DataTypes) => {
    const StoreOrderModel = db.define('storeOrder', {
        orderTotal: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        freezeTableName: true
    })

    StoreOrderModel.associate = (db) => {
        StoreOrderModel.belongsTo(db.store);
        db.store.hasMany(StoreOrderModel);
        StoreOrderModel.belongsTo(db.order);
        db.order.hasOne(StoreOrderModel);
    }

    return StoreOrderModel
}