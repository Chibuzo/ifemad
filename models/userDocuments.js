'use strict';

module.exports = (sequelize, DataTypes) => {
    const Documents = sequelize.define('Documents', {
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        photo: DataTypes.STRING,
        birthCertificate: DataTypes.STRING,
        forceId: DataTypes.STRING,
        appointmentLetter: DataTypes.STRING,
        proofOfAddress: DataTypes.STRING
    }, {
        timestamps: true,
        tableName: 'documents'
    });

    return Documents;
}