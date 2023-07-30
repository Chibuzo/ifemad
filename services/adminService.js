const Admin = require('../models').Admin;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { ErrorHandler } = require('../helpers/errorHandler');

const create = async ({ fname, lname, email, password }) => {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const data = {
        fullname: `${lname} ${fname}`,
        email,
        password: passwordHash
    };
    const newAdmin = await Admin.create(data);
    return newAdmin;
}

const login = async ({ email, password }) => {
    const foundAdmin = await Admin.findOne({
        where: { email },
        attributes: ['id', 'fullname', 'email', 'type', 'password']
    });
    if (!foundAdmin) throw new ErrorHandler(404, 'Email or password is incorrect');

    const admin = foundAdmin.toJSON();

    const match = await bcrypt.compare(password, foundAdmin.password);
    if (!match) throw new ErrorHandler(400, 'Email and password doesn\'t match');

    delete admin.password;
    return admin;
}

module.exports = {
    create,
    login
}