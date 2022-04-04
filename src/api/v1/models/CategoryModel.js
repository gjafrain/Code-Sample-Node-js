module.exports = (sequelize, DataTypes) => {
    const CategoryModel = sequelize.define('category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'uniqueTag',
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        thumbImage: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        index: {
            type: DataTypes.INTEGER(11),
        },
        categoryTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'categoryType',
                key: 'id'
            }
        },
        natureId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
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
        },
    }, {
            freezeTableName: true
        }
    )

    CategoryModel.associate = (db) => {
        CategoryModel.belongsTo(db.categoryType, {
            as: 'categoryType',
            foreignKey: 'categoryTypeId'
        });
        CategoryModel.belongsTo(db.nature, {
            as: 'nature',
            foreignKey: 'natureId'
        });
        CategoryModel.hasMany(db.categoryProduct);
        db.categoryProduct.belongsTo(CategoryModel);
    }
    return CategoryModel
}