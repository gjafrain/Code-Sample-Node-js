module.exports = (db, DataTypes) => {

    const ProductVarientModel = db.define('productVarient', {
        weight: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        updatedPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        isActiveStock: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        stock: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        weightTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'weightType',
                as: 'type',
                key: 'id'
            }
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
            freezeTableName: true
        }
    )

    ProductVarientModel.associate = (db) => {
        ProductVarientModel.belongsTo(db.weightType, { as: 'type', foreignKey: 'weightTypeId', });
        ProductVarientModel.belongsTo(db.product);
    }
    return ProductVarientModel
}