const APIRequest = require('../helpers/APIRequest');
const { PAYSTACK_API_URL } = require('../config/constants');
const { ErrorHandler } = require('../helpers/errorHandler');
const { Contribution } = require('../models');

const option = {
    headers: { Authorization: `Bearer ${process.env.SECRET_KEY}` },
    baseURL: PAYSTACK_API_URL
};
const apiRequest = new APIRequest(option);

const verifyPayment = async (reference, account_id, user_id) => {
    const url = `/transaction/verify/${reference}`;
    const [{ status: responseStatus, data }, invoices] = await Promise.all([
        apiRequest.get(url),
        invoiceService.fetchSavedInvoices(account_id)
    ]);
    if (!responseStatus) throw new ErrorHandler(400, 'Unable to verify transaction status');
    if (data.status != 'success') throw new ErrorHandler(400, 'Payment attempt didn\'t succeed');

    // save payment
    const { amount, currency, channel, status } = data;
    await Promise.all([
        Payment.create({ amount, currency, channel, reference: data.reference, account_id, user_id, status }),
        SubmittedInvoices.update({ status: status == 'success' ? 'complete' : status }, { where: { account_id, status: 'pending' } }),
        invoiceService.createInvoiceXML(invoices, reference, amount)
    ]);
    return data;
}

const list = async criteria => {
    return Contribution.findAll({ where: criteria, raw: true });
}


module.exports = {
    verifyPayment,
    list
}