module.exports = (db, DataTypes) => {
    const StoreOrderItemModel = db.define('storeOrderItem', {
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        freezeTableName: true
    })

    StoreOrderItemModel.associate = (db) => {
        StoreOrderItemModel.belongsTo(db.storeOrder);
        db.storeOrder.hasMany(StoreOrderItemModel);
        StoreOrderItemModel.belongsTo(db.cartItem);
        db.cartItem.hasOne(StoreOrderItemModel);
    }
    return StoreOrderItemModel
}