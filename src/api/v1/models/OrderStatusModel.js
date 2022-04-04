module.exports = (db, DataTypes) => {
    const OrderStatusModel = db.define('orderStatus', {
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        freezeTableName: true
    })
    OrderStatusModel.associate = (db) => {
        db.order.hasMany(OrderStatusModel);
        OrderStatusModel.belongsTo(db.order);
    }
    return OrderStatusModel;
}