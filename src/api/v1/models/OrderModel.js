module.exports = (db, DataTypes) => {
    const OrderModel = db.define('order', {
        fullName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deliveryPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        landmark: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        houseNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        addressType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        orderDiscount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        orderTotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        orderSubtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        deliveryCharges: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        paymentMethod: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        deliveryStartTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deliveryEndTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deliverOn: {
            type: DataTypes.DATE,
            allowNull: true
        },
        confirmOrder: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        },
        paidAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        discountAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        currentStatus: {
            type: DataTypes.INTEGER,
            allowNull: true,
            default: 1
        },
    }, {
        freezeTableName: true
    })

    OrderModel.associate = (db) => {
        db.user.hasOne(OrderModel);
        OrderModel.belongsTo(db.user);
        db.user.hasOne(OrderModel);
        db.cart.hasOne(OrderModel);
        OrderModel.belongsTo(db.cart);
    }
    return OrderModel;
}