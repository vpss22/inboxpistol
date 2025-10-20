const sequelize = require('sequelize');
const moment = require('moment');
const con = require('./connection');

const mailLog = require('./mailLog');

//create table using schema
var contactSchema = con.define('ig_contacts', {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    email: {
        type: sequelize.STRING,
        allowNull: false,
        // unique: true,
        default:''
    },
    group_ids: {
        type: sequelize.TEXT, // New column to store group IDs
        defaultValue: [] // Default to an empty array
    },
    status: {
        type: sequelize.STRING,
        defaultValue: 1
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

module.exports = contactSchema
