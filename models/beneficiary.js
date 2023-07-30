'use strict';

module.exports = (sequelize, DataTypes) => {
    const Beneficiary = sequelize.define('Beneficiary', {
        userId: {
            type: DataTypes.CHAR(36),
            index: true
        },
        fullname: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
        },
        dob: DataTypes.DATE,
        address: DataTypes.STRING,
        relationship: DataTypes.STRING,
        bank: DataTypes.STRING,
        accountNumber: DataTypes.STRING(10)
    }, {
        timestamps: true,
        tableName: 'beneficiaries'
    });

    return Beneficiary;
}