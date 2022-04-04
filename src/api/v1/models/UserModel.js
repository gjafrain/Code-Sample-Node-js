module.exports = (db, DataTypes) => {
    const UserModel = db.define('user', {
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            default: ''
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            default: ''
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            default: ''
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            // unique: 'uniqueTag',
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
            default: ''
        },
        dateOfBirth: {
            type: DataTypes.STRING,
            allowNull: true,
            default: ''
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
    })

    UserModel.associate = (db) => {
        db.userRole.hasOne(UserModel, {
            foreignKey: {
                name: 'roleId',
                allowNull: false,
            }
        })
        UserModel.belongsTo(db.userRole, {
            foreignKey: {
                name: 'roleId',
                allowNull: false,
            }
        })
    }
    return UserModel;
}