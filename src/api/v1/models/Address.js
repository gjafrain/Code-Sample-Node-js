module.exports = (db, DataTypes) => {
    const AddressModel = db.define('address', {
        fullName: {
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
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        landmark: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        houseNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        type: {
            type: DataTypes.ENUM('Home', 'Work', 'Other'),
            allowNull: false,
            defaultValue: 'Home'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        freezeTableName: true
    })

    AddressModel.associate = (db) => {
        db.user.hasOne(AddressModel, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
            }
        })
    }
    return AddressModel;
}