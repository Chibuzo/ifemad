const { ErrorHandler } = require('../helpers/errorHandler');
const { Payout } = require('../models');


const create = async (payoutData) => {
    return Payout.create(payoutData);
}

const list = async criteria => {
    return Payout.findAll({ ...criteria, order: [['createdAt', 'DESC']], raw: true, nest: true });
}

const update = async (payoutId, { status }) => {
    return Payout.update({ status }, { where: { id: payoutId } });
}

module.exports = {
    create,
    list,
    update
}