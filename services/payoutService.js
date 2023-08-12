const { ErrorHandler } = require('../helpers/errorHandler');
const { Payout } = require('../models');


const create = async (payoutData) => {
    return Payout.create(payoutData);
}

const list = async criteria => {
    return Payout.findAll({ where: criteria, raw: true });
}

module.exports = {
    create,
    list
}