module.exports = (db, DataTypes) => {

    const SupportModel = db.define('support', {
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: true
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        freezeTableName: true
    })
    return SupportModel
}