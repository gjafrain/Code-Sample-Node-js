module.exports = (sequelize, DataTypes) => {
    const CartModel = sequelize.define('cart', {
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        subTotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'assigned', 'checkout', 'abandoned', 'paid'),
            defaultValue: 'open'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        freezeTableName: true
    })
    return CartModel
}