const { User, Beneficiary, Documents, Contribution, Payout, sequelize } = require('../models');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { Buffer } = require('buffer');
const crypto = require('crypto');
const path = require('path');
const { Op } = require('sequelize');
const saltRounds = 10;
const { ErrorHandler } = require('../helpers/errorHandler');
const { generateUniqueValue, generateOTP } = require('./UtillityService');
const s3Upload = require('./s3Service');
const { S3_BUCKET } = require('../config/constants');


const create = async ({ firstname, lastname, email, phone, password }) => {
    if (!firstname) throw new ErrorHandler(400, 'Firstname are required');
    if (!lastname) throw new ErrorHandler(400, 'Lastname are required');
    if (!email) throw new ErrorHandler(400, 'Email is required');
    if (!password) throw new ErrorHandler(400, 'Password is required');

    const existingEmail = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });

    if (existingEmail) throw new ErrorHandler(400, `A user already exist with this email or phone`);

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const data = {
        firstname,
        lastname,
        referenceNo: generateUniqueValue(6),
        email,
        phone,
        password: passwordHash
    };
    const newUser = await User.create(data);
    emailService.sendConfirmationEmail(newUser);
    delete newUser.password;
    return newUser;
}

const sendOtp = ({ fullname, email, phone }) => {
    const otp = generateOTP();
    // if (email) emailService.sendOTP(fullname, email, otp);
    // if (phone) smsService.sendOTP(fullname, phone, otp);
    return otp;
}

const login = async ({ email, password }) => {
    const user = await User.findOne({
        where: { email },
        attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'password', 'status'],
        raw: true
    });
    if (!user) throw new ErrorHandler(404, 'Email or password is incorrect');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ErrorHandler(400, 'Email and password doesn\'t match');

    if (user.status === 'inactive') {
        return { user };
    }

    // send OTP
    const otp = sendOtp(user);

    delete user.password;
    return { user, otp };
}

const findOne = async criteria => {
    return User.findOne({ where: criteria });
}

const view = async criteria => {
    const user = await findOne(criteria);
    if (!user) throw new ErrorHandler(404, 'User not found');
    return sanitize(user);
}

const activateAccount = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64').toString('ascii');
    const user = await view({ email });

    const hash = crypto.createHash('md5').update(user.email + 'okirikwenEE129Okpkenakai').digest('hex');
    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    await User.update({ status: 'active' }, { where: { email } });
    return { ...user, status: 'active' };
}

const verifyPasswordResetLink = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64').toString('ascii');
    const user = await User.findOne({ where: { email } }, { raw: true });
    if (!user) throw new ErrorHandler(400, 'User not found');

    const hash = crypto.createHash('md5').update(user.email + 'okirikwenEE129Okpkenakai').digest('hex');
    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    return { id: user.id, status: true };
}

const changePassword = async (newPassword, user_id) => {
    if (!newPassword) throw new ErrorHandler(400, 'Password can not be empty');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    return User.update({ password: passwordHash }, { where: { id: user_id } });
}

const find = async (criteria = {}) => {
    const { where = {} } = criteria;
    delete criteria.where;
    where.deleted = false;
    const users = await User.findAll({
        where,
        order: [
            ['createdAt', 'DESC']
        ],
        ...criteria
    });
    return users.map(user => sanitize(user));
}

const updateUser = async (userData, id) => {
    return User.update({ ...userData, date_joining_force: userData.date_joining_force || null }, { where: { id } });
}

const saveBeneficiaries = async (beneficiaryData, userId) => {
    const data = await Beneficiary.findOne({ where: { userId } });
    const [beneficiary, created] = await Beneficiary.findOrCreate({
        where: { userId },
        defaults: beneficiaryData
    });

    if (!created) {
        await Beneficiary.update(beneficiaryData, { where: { userId } });
    }
    return beneficiary;
}

const fetchUserProfileData = async userId => {
    const [beneficiary, documents] = await Promise.all([
        Beneficiary.findOne({ where: { userId } }),
        Documents.findOne({ where: { userId } })
    ]);
    return { beneficiary, documents }
}

const uploadProfilePhoto = async (photoFile, userId) => {
    const allowedFileTypes = ['image/gif', 'image/png', 'image/jpeg'];
    if (!allowedFileTypes.includes(photoFile.mimetype)) {
        throw new ErrorHandler(400, 'Unsupported file type');
    }
    const key = `profile-photo/${crypto.randomUUID()}${path.extname(photoFile.name)}`;
    const { Location } = await s3Upload(S3_BUCKET, key, photoFile.data);
    return User.update({ profilePhoto: Location }, { where: { id: userId } });
}

const uploadDocuments = async (selectedDocuments, userId) => {
    const errors = [];
    const documentArr = await Promise.all(Object.keys(selectedDocuments).map(async objKey => {
        let documentFile = selectedDocuments[objKey];
        // check file type
        const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowedFileTypes.includes(documentFile.mimetype)) {
            errors[objKey] = 'Unsupported file type';
            return errors;
        }
        const key = `user-documents/${crypto.randomUUID()}${path.extname(documentFile.name)}`;
        const { Location } = await s3Upload(S3_BUCKET, key, documentFile.data);
        return { [objKey]: Location };
    }));
    const documents = Object.assign({}, ...documentArr.map(doc => doc));

    const [docs, created] = await Documents.findOrCreate({
        where: { userId },
        defaults: documents
    });

    if (!created) {
        await Documents.update(documents, { where: { userId } });
    }
}

const deleteDocument = async (document, userId) => {
    // delete from aws
    return Documents.update({ [document]: '' }, { where: { userId } });
}

const fetchDashboardData = async userId => {
    const [contributions, payouts, [chartdata]] = await Promise.all([
        Contribution.findAll({ where: { userId }, order: [['createdAt', 'DESC']], raw: true }),
        Payout.findAll({ where: { userId }, order: [['createdAt', 'DESC']], raw: true }),
        sequelize.query('SELECT SUM(amount) total, DATE_FORMAT(createdAt, \'%b\') month FROM `contributions` WHERE userId = ? AND status = ? GROUP BY DATE_FORMAT(createdAt, \'%b\') LIMIT 0, 6', { replacements: [userId, 'success'] }),
    ]);

    let totalNumOfContributions = 0;
    const totalContribution = contributions.reduce((total, con) => {
        if (con.status == 'success') {
            ++totalNumOfContributions;
            return total + parseInt(con.amount, 10);
        }
        return total;
    }, 0);
    const totalNumOfPayouts = payouts.length;

    // get recents
    contributions.length = totalNumOfContributions < 4 ? totalNumOfContributions : 4;
    payouts.length = totalNumOfPayouts < 4 ? totalNumOfPayouts : 4;

    // chart data
    const chartData = { data: [], categories: [] };
    chartdata.forEach(obj => {
        chartData.data.push(obj.total);
        chartData.categories.push(obj.month);
    });
    return {
        totalContribution,
        totalPayouts: payouts.reduce((total, payout) => payout.status == 'paid' ? total + parseInt(payout.amount, 10) : total, 0),
        totalNumOfContributions,
        totalNumOfPayouts,
        recentContributions: contributions,
        recentPayouts: payouts,
        chartData
    }
}

const sanitize = user => {
    delete user.password;
    return {
        ...user.toJSON()
    };
}

module.exports = {
    create,
    login,
    activateAccount,
    find,
    view,
    updateUser,
    verifyPasswordResetLink,
    changePassword,
    saveBeneficiaries,
    fetchUserProfileData,
    uploadDocuments,
    uploadProfilePhoto,
    deleteDocument,
    fetchDashboardData
}