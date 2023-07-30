module.exports = (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        res.locals.user = req.session.user;
        return next();
    }

    next(new Error('You don\'t have permission to view this page'));
}