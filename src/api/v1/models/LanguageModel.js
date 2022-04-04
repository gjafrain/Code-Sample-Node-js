module.exports = (sequelize, DataTypes) => {
    const LanguageModel = sequelize.define('language', {
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
    }, {
            freezeTableName: true
        }
    )
    return LanguageModel
}