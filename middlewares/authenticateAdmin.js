module.exports = (req, res, next) => {
    if (req.session.admin && req.session.admin.id) {
        res.locals.admin = req.session.admin;
        return next();
    }

    next(new Error('You don\'t have permission to view this page'));
}