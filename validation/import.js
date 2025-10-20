const yup = require('yup');


const ImportSchema = yup.object({
    body: yup.object({
        groups: yup.string().required('groups required'),
        contactData: yup.array().of(
            yup.object({
                name: yup.string().required('name field is required'),
                email: yup.string().email().required('email field is required')
            })
        ).required('contactData requried'),
    })
});

module.exports = ImportSchema
