const sequelize = require('sequelize');
const con = require('./connection');
const moment = require('moment');

//create table using schema
var linkSchema = con.define('ig_campaign_linkcount', {
    count: {
        type: sequelize.STRING
    },
    URL: {
        type: sequelize.STRING
    },
    campaign_id: {
        type: sequelize.INTEGER
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
            // if (rawValue) return moment(rawValue).format('YYYY-MM-DD HH:mm:ss')
            // else return false;
        }
    },
});

module.exports = linkSchema
