'use strict';

const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Contribution = sequelize.define('Contribution', {
        reference: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING
        },
        channel: {
            type: DataTypes.STRING
        },
        status: {
            type: Sequelize.ENUM('pending', 'success', 'failed'),
            defaultValue: 'pending'
        }
    }, {
        timestamps: true,
        tableName: 'contributions',
        indexes: [
            {
                unique: true, fields: ['reference']
            }
        ]
    });

    Contribution.associate = function (models) {
        Contribution.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Contribution;
}