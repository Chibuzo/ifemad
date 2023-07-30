'use strict';

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        description: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        payment_id: {
            type: DataTypes.INTEGER
        },
        reference: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        }
    }, {});

    Transaction.associate = function (models) {
    };

    return Transaction;
}