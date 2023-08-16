const APIRequest = require('../helpers/APIRequest');
const { PAYSTACK_API_URL } = require('../config/constants');
const { ErrorHandler } = require('../helpers/errorHandler');
const { Contribution } = require('../models');
const { generateUniqueValue } = require('./UtillityService');

const option = {
    headers: { Authorization: `Bearer ${process.env.SECRET_KEY}` },
    baseURL: PAYSTACK_API_URL
};
const apiRequest = new APIRequest(option);

const verifyPayment = async (reference) => {
    const url = `/transaction/verify/${reference}`;
    const { status: responseStatus, data } = await apiRequest.get(url);

    if (!responseStatus) throw new ErrorHandler(400, 'Unable to verify transaction status');
    if (data.status != 'success') throw new ErrorHandler(400, 'Payment attempt didn\'t succeed');

    // save payment
    const { currency, channel, status } = data;
    await Contribution.update({ status, channel, currency }, { where: { reference } });
    return data;
}

const create = async data => {
    return Contribution.create({ ...data, reference: generateUniqueValue(30, false, 'IFEMAD') });
}

const list = async criteria => {
    return Contribution.findAll({ ...criteria, order: [['createdAt', 'DESC']], raw: true, nest: true });
}


module.exports = {
    verifyPayment,
    list,
    create
}