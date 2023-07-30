const { Transaction, Withdrawal, Payment } = require('../models');

const fetchTransactions = async criteria => {
    const allTransactions = await Transaction.findAll(criteria);

    let balance = 0;
    const transactions = allTransactions.map(trans => {
        if (trans.status === 'success') {
            if (trans.type === 'C') balance += trans.amount;
            else if (trans.type === 'D') balance -= trans.amount
        }
        return {
            ...trans.toJSON()
        }
    });
    return { transactions, balance };
}

const listUserWithdrawals = async criteria => {
    const withdrawals = await Withdrawal.findAll({ ...criteria, raw: true });
    return withdrawals;
}

// const topUpWallet = async ({ amount, status, flw_ref, transaction_id, user_id }) => {
//     const payment = await Payment.create({
//         userId: user_id,
//         amount, transaction_id, status,
//         reference: flw_ref
//     });

//     return Transaction.create({
//         description: 'topup',
//         amount,
//         user_id,
//         payment_id: payment.id,
//         type: 'C',
//         status: 'success'
//     });
// }

const requestWithdrawal = async ({ bank, account_name, account_number, amount, user_id }) => {
    const withdrawal = await Withdrawal.create({
        user_id, bank, account_name, account_number, amount
    });
    return withdrawal;
}

const listWithdrawals = async criteria => {
    const withdrawals = await Withdrawal.findAll(criteria);
    return Promise.all(withdrawals.map(async withdrawal => {
        const { balance } = await fetchTransactions({ where: { user_id: withdrawal.user_id } });
        return {
            ...withdrawal.toJSON(),
            balance
        };
    }));
}

const updateWithdrawal = async ({ id, status }) => {
    const valid_status = ['Approved', 'Cancelled'];
    if (valid_status.includes(status)) {
        await Withdrawal.update({ status }, { where: { id } });
        const withdrawal = await Withdrawal.findByPk(id);
        const { id: withdrawal_id, amount, user_id } = withdrawal.toJSON();

        if (status === 'Approved' && withdrawal_id) {
            return Transaction.create({
                description: 'withdrawal',
                amount,
                user_id,
                withdrawal_id,
                type: 'D',
                status: 'success'
            });
        }
    }

    return null;
}

module.exports = {
    fetchTransactions,
    requestWithdrawal,
    listWithdrawals,
    listUserWithdrawals,
    updateWithdrawal
}