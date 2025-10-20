const sequelize = require('sequelize');
const con = require('./connection');
const moment = require('moment');

//require models
const Contact = require('./contacts');
const Schedule = require('./schedule');

//create table using schema
var groupSchema = con.define('ig_group', {
    name: {
        type: sequelize.STRING,
        allowNull: false
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

//relation between group and contact
groupSchema.hasMany(Contact, { foreignKey: 'group_id', onDelete: 'cascade' });
Contact.belongsTo(groupSchema, { foreignKey: 'group_id' });

//relation between Schedule and group
groupSchema.hasMany(Schedule, { foreignKey: 'group_id', onDelete: 'cascade' });
Schedule.belongsTo(groupSchema, { foreignKey: 'group_id' });

module.exports = groupSchema

