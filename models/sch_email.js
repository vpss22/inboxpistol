const sequelize = require('sequelize');
const moment = require('moment');
const con = require('./connection');

//create table using schema
var scheduleEmailSchema = con.define('ig_schedule_email', {
    email: {
        type: sequelize.STRING
    },
    status: {
        type: sequelize.STRING
    },
    cmp_id: {
        type: sequelize.INTEGER
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

module.exports = scheduleEmailSchema
