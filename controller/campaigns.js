var url = require('url');
var crypto = require('crypto');
var { Sequelize, Op } = require('sequelize');
var cron = require('node-cron');

//require models 
const Campaign = require('../models/campaign');
const Users = require('../models/users');
const Contact = require('../models/contacts');
const Group = require('../models/group');
const linkCount = require('../models/campaignLinkCount');
const MailLog = require('../models/mailLog');
const Schedule = require('../models/schedule');
const schMail = require('../models/sch_email');
const smtpDetails = require('../models/smtpDetails');
const sendMail = require('../config/mailapi');

cron.schedule("* * * * *", function () {
    cronSchedule();
});

// get all campaigns
module.exports.getCampaigns = (req, res) => {
    if (req.session.Id) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query?.sort?.split(" ")[0] || 'createdAt';
        const sortOrder = req.query?.sort?.split(" ")[1] || 'DESC';

        const searchCondition = search ? {
            [Op.or]: [
                { createdAt: { [Op.like]: `%${search}%` } },
                { campaign_name: { [Op.like]: `%${search}%` } },
            ]
        } : {};

        Campaign.findAndCountAll({
            where: {
                user_id: req.session.Id,
                ...searchCondition
            },
            order: [[sortBy, sortOrder]],
            limit: limit,
            offset: offset
        }).then(result => {
            const totalPages = Math.ceil(result.count / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            Contact.findAll({ where: { user_id: req.session.Id } }).then(conDetails => {
                Group.findAll({
                    where: { user_id: req.session.Id }
                }).then(grpDetails => {
                    // Initialize ig_contacts key for each group
                    grpDetails.forEach(group => {
                        group.ig_contacts = [];
                    });

                    function isValidJSON(str) {
                        try {
                        JSON.parse(str);
                        return true;
                        } catch (e) {
                        return false;
                        }
                        }
                        
                    // Manually filter contacts for each group
                    grpDetails.forEach(group => {
                        const groupId = group.id.toString();
                        group.ig_contacts = conDetails.filter(contact => {
                            // const groupIds = JSON.parse(contact.group_ids).map(Number);

                            // let groupIds;
                            if (contact?.group_ids && isValidJSON(contact.group_ids)) {
                                const groupIds = JSON.parse(contact.group_ids).length ? JSON.parse(contact.group_ids)?.map(Number) : [];
                                return groupIds.includes(parseInt(groupId));
                            }
                            else{
                                // groupIds = []
                                return [];
                            }
                        });
                  
                    });

                    res.render('campaigns', {
                        campaign: result.rows,
                        conDetails: conDetails,
                        grpDetails: grpDetails,
                        pagination: {
                            totalPages: totalPages,
                            currentPage: page,
                            hasNextPage: hasNextPage,
                            hasPrevPage: hasPrevPage
                        },
                        BaseUrl : process.env.BASE_URL  
                    });
                }).catch(err => {
                    console.log('err: ', err);
                    res.json({ status: false, message: 'Group not found.', err: err.message ||err });
                });
            }).catch(err1 => {
                console.log('err1: ', err1);
                res.json({ status: false, message: 'Contact not found.',err: err.message ||err  });
            });
        }).catch(err2 => {
            console.log('err2: ', err2);
            res.json({ status: false, message: 'Campaign not found.', err: err.message ||err  });
        });
    } else {
        res.redirect('/');
    }
};

//get all campaign.
module.exports.getFilteredCampaigns = (req, res) => {
    if (req.session.Id) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;
        const search = req?.query?.search?.trim() || '';
        const sortBy = req.query?.sort?.split(" ")[0] || 'createdAt';
        const sortOrder = req.query?.sort?.split(" ")[1] || 'DESC';

        const searchCondition = search ? {
            [Op.or]: [
                { createdAt: { [Op.like]: `%${search}%` } },
                { campaign_name: { [Op.like]: `%${search}%` } },
            ]
        } : {};

        Campaign.findAndCountAll({
            where: {
                user_id: req.session.Id,
                ...searchCondition
            },
            order: [[sortBy, sortOrder]],
            limit: limit,
            offset: offset
        }).then(result => {
            const totalPages = Math.ceil(result.count / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            Contact.findAll({ where: { user_id: req.session.Id } }).then(conDetails => {
                Group.findAll({
                    where: { user_id: req.session.Id },
                    include: [{ model: Contact, attributes: ['id'] }]
                }).then(grpDetails => {
                    res.json({
                        status: true,
                        campaign: result.rows,
                        conDetails: conDetails,
                        grpDetails: grpDetails,
                        pagination: {
                            totalPages: totalPages,
                            currentPage: page,
                            hasNextPage: hasNextPage,
                            hasPrevPage: hasPrevPage
                        },
                        BaseUrl : process.env.BASE_URL  
                    });
                }).catch(err => {
                    console.log('err: ', err);
                    res.json({ status: false, message: 'Group not found.' });
                });
            }).catch(err1 => {
                console.log('err1: ', err1);
                res.json({ status: false, message: 'Contact not found.' });
            });
        }).catch(err2 => {
            console.log('err2: ', err2);
            res.json({ status: false, message: 'Campaign not found.' });
        });
    } else {
        res.redirect('/');
    }
};

//save create-campaign data.
module.exports.postCreateCampaigns = (req, res) => {
    var campaign_name = req.body.campaign_name
    var template = req.body.data
    var id = req.body.id
    var link
    if (req.body.link) {
        var ll = JSON.parse(req.body.link)
        link = ll.toString();
    }

    if (campaign_name) {
        Campaign.findOne({ where: { campaign_name: campaign_name, user_id: req.session.Id } }).then((result) => {
            if (result) {
                res.json({ status: false, message: 'Campaign already exists..Try another.' })
            } else {
                Campaign.create({ campaign_name: campaign_name, user_id: req.session.Id }).then((addCampaign) => {
                    res.json({ status: true, message: 'Campaign created.', data: addCampaign, BaseUrl : process.env.BASE_URL  })
                }).catch((err) => {
                    res.json({ status: false, message: 'Campaign not created.' })
                });
            }
        }).catch((err1) => {
            res.json({ status: false, message: 'Campaign not find.' })
        });
    } else {
        var temp_trim = template.trim();
        Campaign.update({ font_family: link, template: temp_trim }, { where: { id: id } }).then((updatedCamp) => {
            res.json({ status: true, message: 'Campaign updated.' })
        }).catch((err) => {
            res.json({ status: false, message: 'Campaign not updated.' })
        });
    }
}

module.exports.dataLink = (req, res) => {
    var id = req.body.id
    Campaign.findOne({ where: { id: id } }).then((findData) => {
        res.json({ status: true, findData: findData });
    }).catch((err) => {
        res.json({ status: false, message: 'Campaign not found' })
    });
}

//get create-campaign page.
module.exports.getCreateCampaigns = (req, res) => {
    if (req.session.Id) {
        res.render('create-campaign', { campaignData: '',BaseUrl : process.env.BASE_URL  });
    } else {
        res.redirect('/')
    }
}

//edit campaign api call.
module.exports.campaignId = (req, res) => {
    if (req.session.Id) {
        var id = req.params.id
        Campaign.findOne({ where: { id: id } }).then((getData) => {
            var dataId = encrypt(id)
            res.render('create-campaign', { campaignData: getData, id: dataId, BaseUrl : process.env.BASE_URL  });
        }).catch((err) => {
            console.log('err: ', err);
            res.json({ status: false, message: 'Campaign not found.' })
        });
    } else {
        res.redirect('/')
    }
}

//image save in local storage
module.exports.imageSave = (req, res) => {
    var file = req.file.filename
    res.json({ status: true, image: file })
}

//delete campaign.
module.exports.campaignDelete = (req, res) => {
    Campaign.destroy({ where: { id: req.body.id } }).then(deleted => {
        res.json({ status: true, message: 'Campaign deleted.' })
    }).catch(err => {
        res.json({ status: false, message: 'Campaign not deleted.' })
    })
}

//show preview template
module.exports.previewTemplate = (req, res) => {
    Campaign.findOne({ where: { id: req.body.id } }).then(camData => {
        res.json({ status: true, data: camData })
    }).catch(err => {
        res.json({ status: false, message: 'Campaign not found.' })
    })
}

//get link count
module.exports.getLink = (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    var id = req.params.id
    var decryptId = decrypt(id)
    linkCount.findOne({ where: { campaign_id: decryptId, URL: queryObject.url } }).then(findData => {
        if (findData) {
            linkCount.increment('count', { by: 1, where: { campaign_id: decryptId, URL: queryObject.url } })
                .then(newData => {
                    res.writeHead(301, { "Location": queryObject.url });
                    return res.end();
                }).catch(err1 => {
                    res.json({ status: false, message: 'Count not updated.' })
                });
        } else {
            var cont = CountFun();
            linkCount.create({ count: cont, URL: queryObject.url, campaign_id: decryptId }).then(newData => {
                res.writeHead(301, { "Location": queryObject.url });
                return res.end();
            }).catch(err1 => {
                res.json({ status: false, message: 'Click not Count.' })
            });
        }
    }).catch(err => {
        res.json({ status: false, message: 'Id not exists.' })
    });
}

//send mail to the user
module.exports.mailSend = (req, res) => {
    var id = req.body.id
    var subject = req.body.subject
    var email = req.body.email
    var group = req.body.group
    var time = req.body.time
    var contactId
    if (req.body.contactId) {
        contactId = JSON.parse(req.body.contactId)
    }

    Campaign.findOne({ where: { id: id } }).then(async campData => {
        smtpDetails.findOne({ where: { user_id: campData.user_id } }).then(async smtpdetails => {
            if (campData != null && smtpdetails != null) {
                if (group) {
                    Contact.findAll({ attributes: ["email"],where: Sequelize.literal(`FIND_IN_SET(${group}, REPLACE(REPLACE(group_ids, '[', ''), ']', ''))`),}).then(async grpData => {
                        if(!grpData || !grpData?.length) return  res.json({ status: false, message: 'no contacts found.' })
                        if (time) {
                            Schedule.create({ schedule_time: time, subject: subject, count: grpData.length, user_id: req.session.Id, group_id: group, status: 0 }).then(async schData => {
                                let grpArray = [];
                                grpData.forEach(function (grpEmail) {
                                    grpArray.push({ 'email': grpEmail.email, 'sch_id': schData.id, 'cmp_id': id, 'status': '0' })
                                });
                                //bulk create of schedule Email.
                                schMail.bulkCreate(grpArray).then(schMailData => {
                                    res.json({ status: true, message: 'schedule email added.' })
                                }).catch(err => {
                                    res.json({ status: false, message: 'schedule email not added.' })
                                });
                            }).catch(err => {
                                res.json({ status: false, message: 'schedule not added.' })
                            });
                        } else {
                            var emailData = [];
                            grpData.forEach(element => {
                                emailData.push(element.email)
                            });
                            var chunkSize = 2;
                            var mailList = splitArray(emailData, chunkSize);
                            let getData = await sendMail(smtpdetails, campData, subject, mailList);
                            if (getData.messageId) {
                                res.json({ status: true, message: 'Email send.....Please check your mail inbox!' })
                            } else {
                                res.json({ status: false, message: 'We are not able to send email now, please try after sometime!' })
                            }
                        }
                    }).catch(err2 => {
                        console.log('err 2: ', err2);
                        res.json({ status: false, message: 'Cannot find group details.'});
                    });
                } else if (contactId) {
                    Contact.findAll({ attributes: ['email'], where: { id: { [Op.in]: contactId } } }).then(async conData => {
                        if (time != '') {
                            Schedule.create({ schedule_time: time, subject: subject, count: conData.length, user_id: req.session.Id, email: conData[0]?.email ? conData[0]?.email :'email', status: 0 }).then(async schData => {
                                let conArray = [];
                                conData.forEach(function (conEmail) {
                                    conArray.push({ 'email': conEmail.email, 'sch_id': schData.id, 'cmp_id': id, 'status': '0' })
                                });
                                //bulk create of schedule Email.
                                schMail.bulkCreate(conArray).then(schMailData => {
                                    res.json({ status: true, message: 'Schedule successfully created.' })
                                }).catch(err => {
                                    res.json({ status: false, message: 'Schedule  not created.' });
                                });
                            }).catch(err => {
                                res.json({ status: false, message: 'schedule not created.' })
                            });
                        } else {
                            var emailData = [];
                            conData.forEach(element => {
                                emailData.push(element.email)
                            });
                            var chunkSize = 2;
                            var mailList = splitArray(emailData, chunkSize);
                            let getData = await sendMail(smtpdetails, campData, subject, mailList);
                            if (getData.messageId) {
                                res.json({ status: true, message: 'Email send.....Please check your mail inbox!' })
                            } else {
                                res.json({ status: false, message: 'We are not able to send email now, please try after sometime!' })
                            }
                        }
                    }).catch(err1 => {
                        console.log('err1: ', err1);
                        res.json({ status: false, message: 'Can not find any contact.' })
                    });
                } else {
                    let getData = await sendMail(smtpdetails, campData, subject, email);
                    if (getData.messageId) {
                        return res.json({ status: true, message: 'Email send.....Please check your mail inbox!' })
                    } else {
                        return res.json({ status: false, message: 'We are not able to send email now, please try after sometime!' })
                    }
                }
            } else {
                res.json({ status: false, message: 'Please fill smtp details.' });
            }
        }).catch(err1 => {
            console.log('err1: ', err1);
            res.json({ status: false, message: 'Can not found smtp details.' })
        });
    }).catch(err => {
        res.json({ status: false, message: 'Campaign not found.' })
    });
}

var cnt = 0;
function CountFun() {
    cnt = parseInt(cnt) + parseInt(1);
    return cnt;
}

function encrypt(id) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // Generate a 32-byte key
    const iv = crypto.randomBytes(16); // Initialization vector

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(id, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return iv.toString('hex') + ':' + crypted; // Include IV with the encrypted data
}

function decrypt(encrypted) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from('d6F3Efeq', 'utf8'); // Ensure your key is 32 bytes for aes-256-cbc
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}



function splitArray(emailData, chunkSize) {
    return Array(Math.ceil(emailData.length / chunkSize)).fill().map(function (_, i) {
        return emailData.slice(i * chunkSize, i * chunkSize + chunkSize);
    });
}

function cronSchedule() {
    const d = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
    Schedule.findAll({ where: { 'schedule_time': d } }).then(result => {
        if (result.length > 0) {
            MailLog.create({ 'email': result.id }).then(async addMailLog => { }).catch(er1 => { });
            result.forEach(element => {
                schMail.findAll({ attributes: ['email', 'cmp_id'], where: { 'sch_id': element.id } }).then(async findEmail => {
                    smtpDetails.findOne({ where: { user_id: element.user_id } }).then(details => {
                        for (let i = 0; i < findEmail.length; i++) {
                            Campaign.findOne({ where: { 'id': findEmail[i].cmp_id } }).then(async findCamp => {
                                let getData = await sendMail(details, findCamp, element.subject, findEmail[i].email);
                                if (getData.messageId) {
                                    MailLog.create({
                                        'email': findEmail[i].email,
                                        'camp_id': findEmail[i].cmp_id,
                                        'grp_id': element.group_id,
                                        'user_id': element.user_id,
                                        'sch_id': element.id,
                                        'status': '1'
                                    }).then(async addMailLog => {
                                        if (addMailLog) {
                                            schMail.destroy({ where: { sch_id: element.id } }).then(async delSchMail => {
                                            }).catch(er => { });
                                        }
                                    }).catch(er1 => {
                                        console.log(er1)
                                    });
                                } else {
                                    MailLog.create({
                                        'email': findEmail[i].email,
                                        'camp_id': findEmail[i].cmp_id,
                                        'grp_id': element.group_id,
                                        'user_id': element.user_id,
                                        'sch_id': element.id,
                                        'status': '0'
                                    }).then(async addMailLog => {
                                        if (addMailLog) {
                                            schMail.destroy({ where: { sch_id: element.id } }).then(async delSchMail => { }).catch(er => { });
                                        }
                                    }).catch(er1 => {
                                        console.log(er1)
                                    });
                                }
                            }).catch(err => {
                                console.log(err)
                            });
                        }
                    });
                });
                Schedule.update({ 'status': '1' }, { where: { id: element.id } }).then(async updateSch => { }).catch(er2 => { });
            });
        } else {
            console.log('cron running.')
        }
    }).catch(err1 => {
        console.log(err1)
    });
}
