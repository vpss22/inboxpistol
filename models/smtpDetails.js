const sequelize = require('sequelize');
const con = require('./connection');
const moment = require('moment');

//create table using schema
var smtpSchema = con.define('ig_smtp_details', {
    email: {
        type: sequelize.STRING
    },
    password: {
        type: sequelize.STRING
    },
    service: {
        type: sequelize.STRING
    },
    host: {
        type: sequelize.STRING
    },
    port: {
        type: sequelize.STRING
    },
    status: {
        type: sequelize.STRING,
        defaultValue: 1
    },
    createdAt: {
        type: sequelize.DATE,
        get: function (fieldName) {
            const rawValue = this.getDataValue('createdAt');
            if (rawValue) {
                // Ensure the date is in ISO format before formatting
                const isoDate = moment(rawValue, moment.ISO_8601);
                return isoDate.isValid() ? isoDate.format('YYYY-MM-DD HH:mm:ss') : false;
            } else {
                return false;
            }
        }
    },
    updatedAt: {
        type: sequelize.DATE,
        get: function (fieldName) {
            const rawValue = this.getDataValue('updatedAt');

            if (rawValue) {
                // Ensure the date is in ISO format before formatting
                const isoDate = moment(rawValue, moment.ISO_8601);
                return isoDate.isValid() ? isoDate.format('YYYY-MM-DD HH:mm:ss') : false;
            } else {
                return false;
            }
        }
    },
});

module.exports = smtpSchema
