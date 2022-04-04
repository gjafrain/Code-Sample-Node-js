module.exports = (sequelize, DataTypes) => {
    const CategoryProductModel = sequelize.define('categoryProduct', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
            freezeTableName: true
        }
    )

    CategoryProductModel.associate = (db) => {
        db.category.belongsToMany(db.product, { as: 'products', through: 'categoryProduct' })
        db.product.belongsToMany(db.category, { through: 'categoryProduct' })
    }
    return CategoryProductModel
}