const chance = require('chance').Chance();

const generateUniqueValue = (length = 35, num = false, prefix = null) => {
    const pool = num ? '0123456789' : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const uniqueValue = chance.string({ length, pool });
    return prefix ? `${prefix}_${uniqueValue}` : uniqueValue;
}

module.exports = {
    generateOTP: () => {
        return chance.string({ length: 6, pool: '0123456789' });
    },

    formatCurrency: input => {
        return parseInt(input).toLocaleString('en-US', { style: 'decimal' });
    },

    postIntro: (post, no_of_letters = 500) => {
        if (post.length <= no_of_letters) return post;
        const intro = post.substr(0, no_of_letters - 1);
        return intro.substr(0, intro.lastIndexOf(' ')) + '...';
    },

    generateUniqueValue,

    formatDate: date => new Date(date).toLocaleDateString('en-GB'),

    formatTime: date => new Date(date).toLocaleTimeString('en-US')
}