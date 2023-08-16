const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const isAuthenticated = require('../middlewares/isAuthenticated');
const userService = require('../services/userService');
// const paymentService = require('../services/paymentService');
const walletService = require('../services/walletService');
const contributionService = require('../services/contributionService');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const emailService = require('../services/emailService');
const { ErrorHandler } = require('../helpers/errorHandler');


router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const userSession = req.session.user ?? null;
        res.render('login', { title: 'Welcome' });
    } catch (err) {
        next(err);
    }
});

router.get('/about', async (req, res, next) => {
    res.render('about', { title: 'About Ecoblue Token' });
});

router.get('/faq', isAuthenticated, (req, res, next) => {
    res.render('faq', { title: 'Frequently asked Questions' });
});

router.get('/terms-and-conditions', isAuthenticated, (req, res, next) => {
    res.render('terms', { title: "Terms of Agreement" });
});

router.get('/privacy-policy', isAuthenticated, (req, res, next) => {
    res.render('privacy-policy', { title: "Privacy Policy" });
});

router.get('/contact', isAuthenticated, async (req, res, next) => {
    res.render('contact', { title: 'Contact InvestNFarm' });
});

router.get('/signup', async (req, res, next) => {
    try {
        res.render('signup', { title: 'Sign Up' });
    } catch (err) {
        next(err);
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/signup', async (req, res, next) => {
    try {
        const newUser = await userService.create(req.body);
        res.render('signup', { title: 'Sign Up', newUser });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { user, otp } = await userService.login(req.body);
        req.session.user = user;
        req.session.otp = otp;
        if (req.body.remember_me) {
            req.session.cookie.maxAge = 60 * 60 * 1000 * 24 * 30;   // 30 days
            req.session.user.remember_me = true;
        }
        //if (req.query.json == 'true') return res.json({ status: true });
        res.render('verify-otp', { otp });
    } catch (err) {
        next(err);
    }
});

router.get('/verify-otp', (req, res, next) => {
    const { otp } = req.query;
    res.render('verify-otp', { otp });
});

router.post('/verify-otp', authenticate, (req, res, next) => {
    const { otp } = req.body;
    if (otp == req.session.otp) {
        return res.redirect('/user/dashboard');
    }
    res.render('verify-otp', { message: 'Wrong OTP' });
});

router.get('/activate/:email_hash/:hash_string', async (req, res, next) => {
    try {
        const email_hash = req.params.email_hash;
        const hash_string = req.params.hash_string;
        const user = await userService.activateAccount(email_hash, hash_string);
        res.redirect('/user/activate-account');
    } catch (err) {
        next(err);
    }
});

router.get('/user/activate-account', (req, res) => {
    let user_status = 'active';
    if (req.query.q && req.query.q === 'inactive') {
        user_status = 'inactive';
    }
    res.render('user/activate-account', { user_status });
});

router.get('/resend-verification-email', async (req, res) => {
    const email = req.session.temp_email || '';
    const [user] = await userService.find({ where: { email } });
    emailService.sendConfirmationEmail(user);
    res.end();
});

router.get('/reset-password', async (req, res, next) => {
    res.render('reset-password', { title: 'Reset Password' });
});

router.post('/send-reset-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const [user] = await userService.find({ where: { email } });
        let message = 'A password reset link has been sent to your email';
        emailService.sendPasswordResetLink(user);
        if (!user) message = 'There is no account associated with this email';
        res.render('reset-password', { title: 'Reset Password', message });
    } catch (err) {
        next(err);
    }
});

router.get('/password-reset/:email_hash/:hash_string', async (req, res, next) => {
    try {
        const email_hash = req.params.email_hash;
        const hash_string = req.params.hash_string;
        const { id, status } = await userService.verifyPasswordResetLink(email_hash, hash_string);
        req.session.reset_password_id = id;
        res.render('password-reset-form', { title: 'Set new password', status });
    } catch (err) {
        next(err);
    }
});

router.post('/reset-password', async (req, res, next) => {
    try {
        if (!req.session.reset_password_id) throw new ErrorHandler(400, 'Invalid operation');
        const { password } = req.body;
        await userService.changePassword(password, req.session.reset_password_id);
        delete req.session.reset_password_id;
        res.render('login', { title: 'Login', message: 'Your password reset was successful.' });
    } catch (err) {
        next(err);
    }
})


router.post('/update-user', authenticateAdmin, async (req, res, next) => {
    try {
        await userService.updateUser(req.body);
        res.json({ status: true });
    } catch (err) {
        next(err);
    }
});

router.get('/complete-payment', isAuthenticated, async (req, res, next) => {
    try {
        await contributionService.verifyPayment(req.query.reference);
        res.json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.post('/send-email', (req, res, next) => {
    try {
        emailService.emailEcoBlue(req.body);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
