
module.exports = (sequelize, DataTypes) => {
    const CategoryTypeModel = sequelize.define('categoryType',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'uniqueTag',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: ''
            }
        }, {
            freezeTableName: true
        })
    return CategoryTypeModel
}
