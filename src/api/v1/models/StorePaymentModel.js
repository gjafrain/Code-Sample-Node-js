
module.exports = (sequelize, DataTypes) => {
    const StoreOrderPaymentModel = sequelize.define('storeOrderPayment',
        {
            paymentMethod: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            paymentStatus: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            paymentRefId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            paidBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            platform: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            paidAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            pendingAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            }
        }, {
        freezeTableName: true
    })

    StoreOrderPaymentModel.associate = (db) => {
        StoreOrderPaymentModel.belongsTo(db.order);
        db.order.hasMany(StoreOrderPaymentModel);
        StoreOrderPaymentModel.belongsTo(db.storeOrder);
        db.storeOrder.hasOne(StoreOrderPaymentModel);
    }
    return StoreOrderPaymentModel
}
