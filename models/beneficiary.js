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
            type: DataTypes.STRING(80),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
        },
        nin: DataTypes.STRING(16),
        dob: DataTypes.DATE,
        address: DataTypes.STRING,
        relationship: DataTypes.STRING(20),
        bank: DataTypes.STRING(50),
        accountNumber: DataTypes.STRING(10)
    }, {
        timestamps: true,
        tableName: 'beneficiaries'
    });

    return Beneficiary;
}