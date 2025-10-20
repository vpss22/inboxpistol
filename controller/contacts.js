//models require
const Contact = require('../models/contacts');
const Group = require('../models/group');
const Users = require('../models/users');
const { Op } = require('sequelize')


module.exports.getContacts = async (req, res) => {
    if (req.session.Id) {
        try {
            // Find the user
            const user = await Users.findOne({ where: { id: req.session.Id } });
            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found.' });
            }

            const { search, sortField, sortOrder, page, limit } = req?.query;

            // Default values
            const searchValue = '';
            const sortFieldDefault = 'createdAt';
            const sortOrderDefault = 'DESC';
            const pageDefault = 1;
            const limitDefault = 10;
            const offset = (pageDefault - 1) * limitDefault;

            const searchCondition = searchValue ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { email: { [Op.like]: `%${searchValue}%` } }
                ]
            } : {};

            // Find all contacts for the user
            const { count, rows } = await Contact.findAndCountAll({
                where: {
                    user_id: req.session.Id,
                    ...searchCondition
                },
                order: [[sortFieldDefault, sortOrderDefault]],
                limit: limitDefault,
                offset: offset
            });


            
            // Process contacts to include group details
            const processedContacts = await Promise.all(rows?.map(async (contact) => {


                function isValidJSON(str) {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
                let groupIds = [];
                if (contact?.group_ids && isValidJSON(contact.group_ids)) {
                    let parsedGroupIds;
                    parsedGroupIds = JSON.parse(contact.group_ids);
                    if (!Array.isArray(parsedGroupIds)) {
                        parsedGroupIds = parsedGroupIds ? [parsedGroupIds] : [];
                    }

                    groupIds = parsedGroupIds.length > 0 ? parsedGroupIds : [];
                } else if (contact.group_id != null) {
                    groupIds = [contact.group_id].filter(id => id !== null);
                }

                const groupDetails = await Group.findAll({
                    where: { id: (groupIds) },
                    attributes: ['id', 'name']
                });

                return {
                    ...contact.toJSON(),
                    groupDetails: groupDetails
                };
            }));

            // Find all groups for the user
            const groups = await Group.findAll({
                where: { user_id: user.id },
                include: [{ model: Contact, attributes: ['id'] }]
            });

            res.render('contacts', { contacts: processedContacts, group: groups, contactCount: count });
        } catch (err) {
            console.error('Error fetching contacts:', err);
            // res.render('contacts', { contacts: [], group: [], contactCount: 0, err: err });
            res.status(200).json({ status: false, message: 'Failed to fetch contacts.', error: err.message || err });
        }
    } else {
        res.redirect('/');
    }
};

module.exports.getDesiredContacts = async (req, res) => {
    if (req.session.Id) {
        try {
            // Find the user
            const user = await Users.findOne({ where: { id: req.session.Id } });
            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found.' });
            }

            const { search, sortField, sortOrder, page, limit } = req?.query;

            // Default values
            const searchValue = search?.trim() || '';
            const sortFieldDefault = sortField || 'createdAt';
            const sortOrderDefault = sortOrder || 'DESC';
            const pageDefault = parseInt(page, 10) || 1;
            const limitDefault = parseInt(limit, 10) || 10;
            const offset = (pageDefault - 1) * limitDefault;

            const searchCondition = searchValue ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { email: { [Op.like]: `%${searchValue}%` } }
                ]
            } : {};

            // Find all contacts for the user
            const { count, rows } = await Contact.findAndCountAll({
                where: {
                    user_id: req.session.Id,
                    ...searchCondition
                },
                order: [[sortFieldDefault, sortOrderDefault]],
                limit: limitDefault,
                offset: offset
            });

            // Process contacts to include group details
            let flag = 1;
            let flags = [];
            const processedContacts = await Promise.all(rows?.map(async (contact) => {

                // const groupIds = JSON.parse(contact.group_ids).length > 0
                //     ? JSON.parse(contact.group_ids)
                //     : [contact.group_id].filter(id => id !== null);

                function isValidJSON(str) {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch (e) {
                        return false;
                    }
                }


                let groupIds = [];

                if (contact?.group_ids && isValidJSON(contact.group_ids)) {
                    let parsedGroupIds;
                    parsedGroupIds = JSON.parse(contact.group_ids);
                    if (!Array.isArray(parsedGroupIds)) {
                        parsedGroupIds = parsedGroupIds ? [parsedGroupIds] : [];
                    }
                    groupIds = parsedGroupIds.length > 0 ? parsedGroupIds : [];
                    flag = 2;
                    flags = parsedGroupIds;
                } else if (contact.group_id != null) {
                    groupIds = [contact.group_id].filter(id => id !== null);
                    flags = groupIds
                }
    
                const groupDetails = await Group.findAll({
                    where: { id: (groupIds) },
                    attributes: ['id', 'name']
                });
                return {
                    ...contact.toJSON(),
                    groupDetails: groupDetails
                };
            }));

            // Find all groups for the user
            const groups = await Group.findAll({
                where: { user_id: user.id },
                include: [{ model: Contact, attributes: ['id'] }]
            });

            // Render the contacts view with processed contacts and groups
            res.json({ contacts: processedContacts, group: groups, contactCount: count, flag: flag, flags: flags });

        } catch (err) {
            console.error('Error fetching contacts:', err);
            res.status(500).json({ status: false, message: 'Failed to fetch contacts.' });
        }
    } else {
        res.redirect('/');
    }
};

//Save contacts details.

module.exports.postContacts = (req, res) => {
    let { 'group[]': groupIds } = req?.body

    // Normalize group to always be an array
    if (!Array.isArray(groupIds)) {
        groupIds = groupIds ? [groupIds] : [];
    }

    var name = req.body.name?.trim()
    var email = req.body.email?.trim()

    Contact.findOne({ where: { email: email, user_id: req.session.Id } }).then(result => {
        if (result) {
            res.json({ status: false, message: 'Email already exists in this table...Try another.' })
        } else {
            if (!groupIds.length) {
                Contact.create({ name: name, email: email, user_id: req.session.Id }).then(addData => {
                    res.json({ status: true, message: 'Contact added.' })
                }).catch(err => {
                    res.json({ status: false, error: err, message: 'Contact not added.' })
                });
            } else {
                Contact.create({ name: name, email: email, group_ids: JSON.stringify(groupIds.map(Number)), user_id: req.session.Id }).then(addData => {
                    res.json({ status: true, message: 'Contact added.', newContact: addData })
                }).catch(err => {
                    res.json({ status: false, error: err, message: 'Contact not added.' })
                });
            }
        }
    }).catch(err1 => {
        res.json({ status: false, error1: err1 })
    });
}

//Save Imported contacts details.

module.exports.postImportedContacts = async (req, res) => {
    try {
        const importedContacts = JSON.parse(req?.body?.contactData);

        const Groups = req?.body?.['groups[]'];

        let groups;
        // Normalize group to always be an array     
        if (!Array.isArray(Groups)) {

            groups = Groups ? [Groups] : [];
        } else {
            groups = Groups;
        }
        
        // Prepare contact data with normalized group_ids and user_id
        const contactData = importedContacts.map((obj) => {
            return { ...obj, group_ids: JSON.stringify(groups.map(Number)), user_id: req?.session.Id }
        });
        
        // Extract emails for checking duplicates
        const emails = contactData.map(contact => contact.email);

        // Step 1: Find existing contacts with the same emails
        const existingContacts = await Contact.findAll({
            where: {
                email: emails
            }
        });


        // Step 2: Separate new contacts from existing contacts
        const existingEmailSet = new Set(existingContacts.map(contact => contact.email));

        const contactsToInsert = contactData.filter(contact => !existingEmailSet.has(contact.email));
        const contactsToUpdate = contactData.filter(contact => existingEmailSet.has(contact.email));
        

        // Step 3: Update existing contacts with duplicate emails
        for (const contact of contactsToUpdate) {
            await Contact.update(
                { group_ids: (contact.group_ids), name: contact.name }, // Fields to update
                { where: { email: contact.email } }  // Condition to find existing contact by email
            ).catch(err => {
                console.error(`Error updating contact with email ${contact.email}: `, err);
            });
        }

        // Step 4: Insert new contacts that do not already exist
        if (contactsToInsert.length > 0) {
            await Contact.bulkCreate(contactsToInsert)
                .catch(err => {
                    console.error('Error inserting new contacts: ', err);
                });
        }

        // Step 5: Send response with the result
        return res.json({
            status: true,
            message: `Successfully imported ${contactsToInsert.length} new contacts and updated ${contactsToUpdate.length} existing contacts`
        });

    } catch (err) {
        return res.json({ status: false, error: err.message });
    }
};

// //Save contacts details.


//delete contact details.
module.exports.deleteContacts = (req, res) => {
    Contact.destroy({ where: { id: req.body.id } }).then(deleteData => {
        res.json({ status: true, message: 'Contact deleted.' })
    }).catch(err => {
        res.json({ status: false, message: 'contact not deleted.' })
    });
}

//group create.
module.exports.groupCreate = (req, res) => {
    var group = req.body.group
    Group.findOne({ where: { name: group, user_id: req.session.Id } }).then(findGroup => {
        if (findGroup) {
            res.json({ status: false, message: 'Group name already exists...Try another.' })
        } else {
            Group.create({ name: group, user_id: req.session.Id }).then(groupData => {
                res.json({ status: true, message: 'Group added successfully.', group: groupData })
            }).catch(err => {
                res.json({ status: false, message: 'Group not added.' })
            });
        }
    }).catch(err => {
        res.json({ status: false, message: 'Group not found.' })
    });
}

//delete group details.
module.exports.deleteGroup = (req, res) => {
    Group.destroy({ where: { id: req.body.id } }).then(deleteGrp => {
        res.json({ status: true, message: 'Group deleted.' })
    }).catch(err => {
        res.json({ status: false, message: 'Group not deleted.' })
    });
}

//update group details.
module.exports.groupUpdate = (req, res) => {
    var group = req.body.group
    var id = req.body.id

    Group.findOne({ where: { id: id } }).then(findGroup => {
        if (findGroup) {
            Group.update({ name: group }, { where: { id: id } }).then(groupData => {
                res.json({ status: true, message: 'Group name updated.' })
            }).catch(err => {
                res.json({ status: false, message: 'Group not updated.' })
            });
        } else {
            res.json({ status: false, message: 'Group name not exists...Try another.' })
        }
    }).catch(err1 => {
        res.json({ status: false, message: 'Group not found.' })
    });
}

module.exports.updateContact = (req, res) => {
    var id = req.body.id
    var name = req.body.name?.trim()
    var email = req.body.email?.trim()
    let { 'group[]': group } = req?.body
    // var group = req.body.group

    // Normalize group to always be an array
    if (!Array.isArray(group)) {
        group = group ? [group] : [];
    }

    if (group && group?.length) {
        Contact.update({ name: name, email: email, group_ids: JSON.stringify(group?.map(Number)), group_id: null }, { where: { id: id } }).then(updtData => {
            res.json({ status: true, message: 'Contact updated.' })
        }).catch(err => {
            res.json({ status: false, message: 'Contact not updated.' })
        });
    } else {
        Contact.update({ name: name, email: email, group_ids: JSON.stringify([]), group_id: null }, { where: { id: id } }).then(updtData => {
            res.json({ status: true, message: 'Contact updated.' })
        }).catch(err => {
            res.json({ status: false, message: 'Contact not updated.' })
        });
    }
}

module.exports.viewPage = (req, res) => {
    Contact.findAll({ attributes: ['id', 'name', 'email', 'createdAt'] }, { where: { user_id: req.session.Id } }).then(result => {
        let json = {
            "draw": 1,
            "recordsTotal": result.length,
            "recordsFiltered": result.length,
            "data": result
        };
        res.send(json);
    }).catch(err => {
        res.json({ status: false })
    });
}
