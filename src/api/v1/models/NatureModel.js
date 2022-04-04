module.exports = (db, DataTypes) => {
    const NatureModel = db.define('nature', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'uniqueTag',
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
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
    return NatureModel
}