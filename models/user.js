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
            type: DataTypes.STRING(80),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
        },
        nin: DataTypes.STRING(16),
        date_joining_force: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dob: DataTypes.DATE,
        address: DataTypes.STRING,
        state: DataTypes.STRING,
        force: DataTypes.STRING(20),
        areaOfService: DataTypes.STRING(20),
        currentRank: DataTypes.STRING(20),
        password: DataTypes.STRING(60),
        profilePhoto: DataTypes.STRING,
        bank: DataTypes.STRING(50),
        accountNumber: DataTypes.STRING(10),
        annualAmtPayable: DataTypes.INTEGER,
        securityQuestion: DataTypes.STRING,
        securityAnswer: DataTypes.STRING,
        pin: DataTypes.STRING,
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
        User.hasMany(models.Payout, { foreignKey: 'userId' });
        User.hasMany(models.Contribution, { foreignKey: 'userId' });
    };

    return User;
}