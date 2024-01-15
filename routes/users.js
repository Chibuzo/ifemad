const express = require('express');
const router = express.Router();
const contributionService = require('../services/contributionService');
const userService = require('../services/userService');
const payoutService = require('../services/payoutService');
const banks = require('../config/bank_codes.json');
const { ANNUAL_PAYABLE } = require('../config/constants');


/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.get('/dashboard', async (req, res, next) => {
    try {
        const user = req.session.user;
        const data = await userService.fetchDashboardData(user.id);
        res.render('user/dashboard', { ...data });
    } catch (err) {
        next(err);
    }
});

router.get('/profile', async (req, res, next) => {
    try {
        const user = await userService.view({ id: req.session.user.id });
        const { beneficiary, documents } = await userService.fetchUserProfileData(user.id);
        res.render('user/profile', { user, documents: documents || {}, beneficiary: beneficiary || {} });
    } catch (err) {
        next(err);
    }
});

router.post('/upload-photo', async (req, res, next) => {
    try {
        const { id: userId } = req.session.user;
        await userService.uploadProfilePhoto(req.files.profile_photo, userId);
        res.redirect('/user/profile');
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

router.post('/contribution', async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const resp = await contributionService.create({ ...req.body, userId });
        res.json({ status: 'success', reference: resp.reference });
    } catch (err) {
        res.json({ status: 'error', message: err.message });
    }
});

router.get('/contributions', async (req, res, next) => {
    try {
        const user = req.session.user;
        const { totalContribution, contributions } = await userService.getTotalContribution(user.id);
        const annualPayable = ANNUAL_PAYABLE - totalContribution;
        res.render('user/contribution', { user, contributions, annualPayable, publicKey: process.env.PUBLIC_KEY });
    } catch (err) {
        next(err);
    }
});

router.get('/payouts', async (req, res, next) => {
    try {
        const user = req.session.user;
        const payouts = await payoutService.list({ where: { userId: user.id } });
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

router.post('/security-pin', async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        await userService.changePin({ ...req.body }, user_id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.post('/beneficiaries', async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        await userService.saveBeneficiaries({ ...req.body }, req.files, user_id);
        res.redirect('/user/profile');
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
