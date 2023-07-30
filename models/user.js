'use strict';
const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4
        },
        referenceNo: {
            type: DataTypes.CHAR(6),
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        middlename: DataTypes.STRING(20),
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
        },
        nin: DataTypes.STRING,
        dob: DataTypes.DATE,
        address: DataTypes.STRING,
        force: DataTypes.STRING,
        areaOfService: DataTypes.STRING,
        currentRank: DataTypes.STRING,
        password: DataTypes.STRING,
        profilePhoto: DataTypes.STRING,
        bank: DataTypes.STRING,
        accountNumber: DataTypes.STRING(10),
        annualAmtPayable: DataTypes.INTEGER,
        status: {
            type: Sequelize.ENUM('inactive', 'active', 'disabled'),
            defaultValue: 'inactive'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        tableName: 'users',
        indexes: [
            { unique: true, fields: ['email'] },
            { unique: true, fields: ['phone'] },
            { unique: true, fields: ['referenceNo'] }
        ],

    });

    User.associate = function (models) {
    };

    return User;
}