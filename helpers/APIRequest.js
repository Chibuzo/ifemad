const axios = require('axios');
const { ErrorHandler } = require('./errorHandler');


module.exports = class APIRequest {
    constructor(options) {
        this.option = Object.assign({ headers: { 'Content-Type': 'application/json' } }, options);
    }


    async get(url, params = null) {
        if (params) {
            this.option.params = params;
        }
        try {
            const response = await axios.get(url, this.option);
            return response.data;
        } catch (err) {
            if (err.response) {
                throw new ErrorHandler(err.response.status, err.response.data.message);
            } else if (err.request) {
                throw new ErrorHandler(500, 'Request failed');
            } else {
                throw new ErrorHandler(500, err.message);
            }
        }
    }

    async post(url, body = {}) {
        try {
            const response = await axios.post(url, body, this.option);
            return response.data;
        } catch (err) {
            throw new ErrorHandler(err.response.status, err.response.data.message);
        }
    }
}