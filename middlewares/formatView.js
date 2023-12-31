const formatFns = require('../services/UtillityService');

module.exports = (req, res, next) => {
    res.locals.view = formatFns;
    res.locals.user = req.session.user;
    return next();
}