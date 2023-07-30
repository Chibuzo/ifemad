const formatFns = require('../services/UtillityService');

module.exports = (req, res, next) => {
    res.locals.view = formatFns;
    return next();
}