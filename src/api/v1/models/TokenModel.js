module.exports = (db, DataTypes) => {
    const TokenModel = db.define('token', {
        token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sessionCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        }
    }, {
        freezeTableName: true
    })

    TokenModel.associate = (db) => {
        db.user.hasOne(TokenModel, {
            foreignKey: {
                name: 'userId',
            }
        });
        TokenModel.belongsTo(db.user, {
            foreignKey: {
                name: 'userId',
            }
        });
    }
    return TokenModel;
}