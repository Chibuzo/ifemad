'use strict';

const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Payout = sequelize.define('Payout', {
        bank: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        account_name: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        account_number: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('pending', 'paid', 'rejected'),
            defaultValue: 'pending'
        }
    }, {
        tableName: 'payouts',
        timestamps: true,
    });

    Payout.associate = function (models) {
        Payout.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Payout;
}