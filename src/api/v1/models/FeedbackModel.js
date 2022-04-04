
module.exports = (db, DataTypes) => {
    const FeedbackModel = db.define('feedback', {
        feedback: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'product',
                key: 'id'
            }
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        contractId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('Product', 'Order', 'Contract'),
            allowNull: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
            freezeTableName: true
        }
    )
    return FeedbackModel
}