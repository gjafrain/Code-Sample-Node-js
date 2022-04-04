module.exports = (db, DataTypes) => {
    const UserRoleModel = db.define('userRole', {
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'uniqueTag',
        },
    }, {
        freezeTableName: true
    }
    )
    return UserRoleModel
}