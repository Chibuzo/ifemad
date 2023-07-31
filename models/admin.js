'use strict';

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            defaultValue: 'admin-user'
        },
        password: DataTypes.STRING,
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        indexes: [
            { unique: true, fields: ['email'] }
        ]
    });

    return Admin;
}