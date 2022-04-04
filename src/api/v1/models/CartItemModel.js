module.exports = (sequelize, DataTypes) => {
    const CartItemModel = sequelize.define('cartItem', {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        }
    }, {
            freezeTableName: true
        }
    )

    CartItemModel.associate = (db) => {
        db.product.hasOne(CartItemModel);
        CartItemModel.belongsTo(db.product);
        db.cart.hasMany(CartItemModel, { as: 'cartItems' });
        db.productVarient.hasOne(CartItemModel);
        CartItemModel.belongsTo(db.productVarient);
        // CartItemModel.belongsTo(db.cart);
    }
    return CartItemModel
}