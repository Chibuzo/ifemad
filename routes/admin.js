var express = require('express');
var router = express.Router();
const adminService = require('../services/adminService');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const walletService = require('../services/walletService');
const userService = require('../services/userService');
const paymentService = require('../services/paymentService');
const { User } = require('../models');


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
    const criteria = {
        where: {
            description: 'withdrawal', status: 'pending'
        },
        attributes: ['id', 'amount', 'status', 'createdAt'],
        include: {
            model: User,
            attributes: ['id', 'fullname']
        },
        order: [
            ['createdAt', 'DESC']
        ]
    };
    const { transactions: withdrawals } = await walletService.fetchTransactions(criteria);
    res.render('admin/dashboard', { withdrawals });
});


router.get('/payments', authenticateAdmin, async (req, res, next) => {
    try {
        const criteria = {
            include: [
                {
                    model: User,
                    attributes: ['id', 'fullname']
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        };
        const payments = await paymentService.listPayments(criteria);
        res.render('admin/payments', { payments });
    } catch (err) {
        next(err);
    }
});

router.get('/investors', authenticateAdmin, async (req, res, next) => {
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


module.exports = router;
