const env = process.env.NODE_ENV || 'development';

const dbConfig = {
    "development": {
        "username": process.env.DEV_DB_USER,
        "password": process.env.DEV_DB_PASSWORD,
        "database": process.env.DEV_DB_NAME,
        "host": '127.0.0.1',
        "dialect": "mysql",
        "debug": false
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "debug": false
    }
};

const fwKeys = {
    development: {
        PUBLIC_KEY: process.env.FW_TEST_PUBLIC_KEY,
        SECRET_KEY: process.env.FW_TEST_SECRET_KEY
    },
    production: {
        PUBLIC_KEY: process.env.FW_PUBLIC_KEY,
        SECRET_KEY: process.env.FW_SECRET_KEY
    }
};


module.exports = {
    db_config: dbConfig[env],
    fw_keys: fwKeys[env]
}