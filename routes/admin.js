var express = require('express');
var router = express.Router();
const adminService = require('../services/adminService');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const payoutService = require('../services/payoutService');
const userService = require('../services/userService');
const contributionService = require('../services/contributionService');
const { User, sequelize } = require('../models');


router.get('/', function (req, res) {
    res.render('admin/login', { title: 'Admin Login' });
});

router.get('/create', (req, res) => {
    res.render('admin/signup', { title: 'Create Admin' });
});

router.post('/create', async (req, res, next) => {
    try {
        await adminService.create(req.body);
        res.render('admin/login', { title: 'New Admin Login' });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        req.session.admin = await adminService.login(req.body);
        res.redirect('/admin/dashboard');
    } catch (err) {
        next(err);
    }
});

router.get('/dashboard', authenticateAdmin, async (req, res, next) => {
    try {
        const data = await adminService.fetchDashboardData();
        res.render('admin/dashboard', { ...data });
    } catch (err) {
        next(err);
    }
});


router.get('/contributions', authenticateAdmin, async (req, res, next) => {
    try {
        const criteria = {
            include: [
                {
                    model: User,
                    attributes: ['id', [sequelize.fn('CONCAT', sequelize.col('firstname'), ' ', sequelize.col('lastname')), 'fullname']]
                }
            ]
        };
        const contributions = await contributionService.list(criteria);
        res.render('admin/contribution', { contributions });
    } catch (err) {
        next(err);
    }
});

router.get('/payouts', authenticateAdmin, async (req, res, next) => {
    try {
        const criteria = {
            include: [
                {
                    model: User,
                    attributes: ['id', [sequelize.fn('CONCAT', sequelize.col('firstname'), ' ', sequelize.col('lastname')), 'fullname']]
                }
            ]
        };
        const payouts = await payoutService.list(criteria);
        res.render('admin/payouts', { payouts });
    } catch (err) {
        next(err);
    }
});

router.post('/process-payout', authenticateAdmin, async (req, res) => {
    try {
        const { action, payout_id } = req.body;
        await payoutService.update(payout_id, { status: action });
        res.json({ status: true });
    } catch (err) {
        res.json({ status: false });
    }
});

router.get('/users', authenticateAdmin, async (req, res, next) => {
    try {
        const users = await userService.find({
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/members', { users });
    } catch (err) {
        next(err);
    }
});

router.get('/users/profile', authenticateAdmin, async (req, res, next) => {
    try {
        const { user_id: userId } = req.query;
        const [user, { documents, beneficiary }, contributions, payouts] = await Promise.all([
            userService.view({ id: userId }),
            userService.fetchUserProfileData(userId),
            contributionService.list({ where: { userId } }),
            payoutService.list({ where: { userId } })
        ]);
        res.render('admin/user-profile', { user, documents: documents || {}, beneficiary: beneficiary || {}, contributions, payouts });
    } catch (err) {
        next(err);
    }
});


module.exports = router;
