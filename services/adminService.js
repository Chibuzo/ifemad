const { Admin, Payout, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { ErrorHandler } = require('../helpers/errorHandler');
const contributionService = require('./contributionService');

const create = async ({ fname, lname, email, password }) => {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const data = {
        fullname: `${lname} ${fname}`,
        email,
        password: passwordHash
    };
    const newAdmin = await Admin.create(data);
    return newAdmin;
}

const login = async ({ email, password }) => {
    const foundAdmin = await Admin.findOne({
        where: { email },
        attributes: ['id', 'fullname', 'email', 'type', 'password']
    });
    if (!foundAdmin) throw new ErrorHandler(404, 'Email or password is incorrect');

    const admin = foundAdmin.toJSON();

    const match = await bcrypt.compare(password, foundAdmin.password);
    if (!match) throw new ErrorHandler(400, 'Email and password doesn\'t match');

    delete admin.password;
    return admin;
}

const fetchDashboardData = async () => {
    const criteria = {
        include: [
            {
                model: User,
                attributes: ['id', [sequelize.fn('CONCAT', sequelize.col('firstname'), ' ', sequelize.col('lastname')), 'fullname']]
            }
        ]
    };
    const [contributions, payouts, users, [contribution_chart_data]] = await Promise.all([
        contributionService.list(criteria),
        Payout.findAll({ where: { status: 'paid' }, order: [['createdAt', 'DESC']], raw: true }),
        User.findAll({ where: { status: 'active', deleted: false } }),
        sequelize.query('SELECT SUM(amount) total, DATE_FORMAT(createdAt, \'%b\') month FROM `contributions` WHERE status = ? GROUP BY DATE_FORMAT(createdAt, \'%b\') LIMIT 0, 8', { replacements: ['success'] }),
    ]);

    let totalNumOfContributions = 0;
    const totalContribution = contributions.reduce((total, con) => {
        if (con.status == 'success') {
            ++totalNumOfContributions;
            return total + parseInt(con.amount, 10);
        }
        return total;
    }, 0);
    const totalNumOfPayouts = payouts.length;

    // get recents
    contributions.length = totalNumOfContributions < 8 ? totalNumOfContributions : 8;
    payouts.length = totalNumOfPayouts < 8 ? totalNumOfPayouts : 8;

    // chart data
    const chartData = { data: [], categories: [] };
    contribution_chart_data.forEach(obj => {
        chartData.data.push(obj.total);
        chartData.categories.push(obj.month);
    });

    return {
        totalContribution,
        totalPayouts: payouts.reduce((total, payout) => payout.status == 'paid' ? total + parseInt(payout.amount, 10) : total, 0),
        totalNumOfContributions,
        totalNumOfPayouts,
        recentContributions: contributions,
        recentPayouts: payouts,
        activeUsers: users.length,
        chartData
    }
}

module.exports = {
    create,
    login,
    fetchDashboardData
}