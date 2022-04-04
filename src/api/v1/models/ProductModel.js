
module.exports = (db, DataTypes) => {
    const ProductModel = db.define('product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'uniqueTag',
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        discreption: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        natureId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'nature',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
            freezeTableName: true
        }
    )

    ProductModel.associate = (db) => {
        ProductModel.belongsTo(db.nature);
        ProductModel.hasMany(db.categoryProduct);
        db.categoryProduct.belongsTo(ProductModel);
        ProductModel.hasMany(db.productVarient, { as: 'varients' });
    }
    return ProductModel;
}