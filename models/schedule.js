const sequelize = require('sequelize');
const moment = require('moment');
const con = require('./connection');

//model require
const schMail = require('./sch_email');
const mailLog = require('./mailLog');

//create table using schema
var scheduleSchema = con.define('ig_schedule', {
    schedule_time: {
        type: sequelize.DATE,
        get: function (fieldName) {
            const rawValue = this.getDataValue('schedule_time');
            if (rawValue) {
                // Ensure the date is in ISO format before formatting
                const isoDate = moment(rawValue, moment.ISO_8601);
                return isoDate.isValid() ? isoDate.format('YYYY-MM-DD HH:mm:ss') : false;
            } else {
                return false;
            }
        }
    },
    subject: {
        type: sequelize.STRING
    },
    count: {
        type: sequelize.INTEGER
    },
    email: {
        type: sequelize.STRING
    },
    user_id: {
        type: sequelize.STRING
    },
    status: {
        type: sequelize.STRING
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


//relation between schedule and schedule email.
scheduleSchema.hasMany(schMail, { foreignKey: 'sch_id', onDelete: 'cascade' });
schMail.belongsTo(scheduleSchema, { foreignKey: 'sch_id' });

//relation between schedule and email log.
scheduleSchema.hasMany(mailLog, { foreignKey: 'sch_id', onDelete: 'cascade' });
mailLog.belongsTo(scheduleSchema, { foreignKey: 'sch_id' });

module.exports = scheduleSchema
