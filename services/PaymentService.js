const { Payment, UserInvestments } = require('../models');
const { fw_keys } = require('../config/config');
const { FW_API_URL } = require('../config/constants');
const { getExchangeRate } = require('./UtillityService');
const APIRequest = require('../helpers/APIRequest');
const { ErrorHandler } = require('../helpers/errorHandler');

const savePaymentDetails = async ({ tx_ref: inf_reference, status, transaction_id }) => {
    // first verify payment status
    const { amount, amount_settled, payment_type: channel, currency } = await verifyPayment(transaction_id);

    // verify product reference
    const userInvestmentId = inf_reference.split('_')[1];
    const [userInvestment, exchange_rate] = await Promise.all([
        UserInvestments.findByPk(userInvestmentId, { raw: true }),
        getExchangeRate(currency)
    ]);
    if (!userInvestment) {   // wahala!
        // log this, alert
        throw new ErrorHandler(400, 'Invalid investment reference');
    }

    // verify currency
    if (userInvestment.currency != currency) {
        // log this
        throw new ErrorHandler(400, 'Wrong payment currency');
    }

    // verify amount paid
    // if (order.total_amount > amount) {
    //     // log this, alert admin
    //     throw new handleError(400, 'Amount paid is less than order amount');
    // }
    await Payment.create({
        inf_reference,
        amount,
        amount_settled,
        channel,
        currency,
        investmentId: userInvestment.InvestmentId,
        userInvestmentId: userInvestment.id,
        transaction_id,
        userId: userInvestment.UserId,
        status
    });
    await UserInvestments.update({ status: 'active', currency, exchange_rate }, { where: { id: userInvestment.id } });
    return { userInvestment_id: userInvestment.id, user_id: userInvestment.UserId };
}


const verifyPayment = async (transactionId) => {
    const option = {
        headers: { Authorization: `Bearer ${fw_keys.SECRET_KEY}` },
        baseURL: FW_API_URL
    };
    const apiRequest = new APIRequest(option);
    const url = `/transactions/${transactionId}/verify`;
    const { status: responseStatus, data } = await apiRequest.get(url);

    if (responseStatus != 'success') throw new ErrorHandler(400, 'unable to verify transaction status');

    if (data.status != 'successful') throw new ErrorHandler(400, 'Payment attempt didn\'t succeed');
    return data;
}


const listPayments = async (criteria) => {
    return Payment.findAll(criteria);
}

module.exports = {
    savePaymentDetails,
    listPayments
}