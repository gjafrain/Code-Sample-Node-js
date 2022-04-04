module.exports = (db, DataTypes) => {
    const StoreOrderStatusHistoryModel = db.define('storeOrderStatusHistory', {
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

    StoreOrderStatusHistoryModel.associate = (db) => {
        StoreOrderStatusHistoryModel.belongsTo(db.storeOrder);
        db.storeOrder.hasMany(StoreOrderStatusHistoryModel);
    }

    return StoreOrderStatusHistoryModel;
}