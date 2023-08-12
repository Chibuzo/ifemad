const express = require('express');
const router = express.Router();
const contributionService = require('../services/contributionService');
const userService = require('../services/userService');
const payoutService = require('../services/payoutService');
const banks = require('../config/bank_codes.json');


/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.get('/dashboard', async (req, res, next) => {
    try {
        const user = req.session.user;
        res.render('user/dashboard', { user });
    } catch (err) {
        next(err);
    }
});

router.get('/profile', async (req, res, next) => {
    try {
        const user = await userService.view({ id: req.session.user.id });
        const { beneficiary, documents } = await userService.fetchUserProfileData(user.id);
        res.render('user/profile', { user, documents, beneficiary });
    } catch (err) {
        next(err);
    }
});

router.post('/documents', async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await userService.uploadDocuments(req.files, userId);
        res.redirect('/user/profile');
    } catch (err) {
        next(err);
    }
});

router.post('/delete-document', async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const { documentName } = req.body;
        await userService.deleteDocument(documentName, userId);
        res.json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.get('/contributions', async (req, res, next) => {
    try {
        const user = req.session.user;
        const contributions = await contributionService.list({ userId: user.id });
        res.render('user/contribution', { user, contributions, publicKey: process.env.PUBLIC_KEY });
    } catch (err) {
        next(err);
    }
});

router.get('/payouts', async (req, res, next) => {
    try {
        const user = req.session.user;
        const payouts = await payoutService.list({ userId: user.id });
        res.render('user/withdrawal', { user, payouts, banks });
    } catch (err) {
        next(err);
    }
});

router.post('/withdrawal', async (req, res, next) => {
    try {
        const user = req.session.user;
        const payout = await payoutService.create({ ...req.body, userId: user.id });
        res.redirect('/user/payouts');
    } catch (err) {
        next(err);
    }
});


router.post('/update', async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        await userService.updateUser({ ...req.body }, user_id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.post('/beneficiaries', async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        await userService.saveBeneficiaries({ ...req.body }, user_id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.get('/wallet', async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        const withdrawals = await walletService.listUserWithdrawals({ where: { user_id } });
        res.render('user/wallet', { withdrawals, balance: 0 });
    } catch (err) {
        next(err);
    }
});

module.exports = router;