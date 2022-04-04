module.exports = (db, DataTypes) => {
    const WeightTypeModel = db.define('weightType', {
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
        }
    }, {
            freezeTableName: true
        }
    )

    return WeightTypeModel;
}