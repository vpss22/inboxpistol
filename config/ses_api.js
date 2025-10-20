const AWS = require('aws-sdk');
//test
AWS.config.update({ region: 'us-east-1' });

const ses = new AWS.SES();

async function sendSesMail(details, campData, subject, mailList) {
      console.log('details: ', details);

      var data = (campData.font_family)?.toString();
      var dtt = data?.split(',')
      var linkHTML = '';
      for (let i = 0; i < dtt?.length; i++) {
            if (linkHTML != '') {
                  linkHTML += '|' + dtt[i]
            } else {
                  linkHTML += dtt[i]
            }
      }
      var link = '<link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family=' + linkHTML + '" media="all">'

      var htmlbody = '<!DOCTYPE html><html><head>' +
            '<meta charset="utf-8">' +
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
            link +
            '</head><body>' +
            campData.template + '</body></html>'


      const params = {
            Source: details.email,
            Destination: {
                  ToAddresses: [mailList],
            },
            Message: {
                  Subject: {
                        Data: subject,
                  },
                  Body: {
                        Text: {
                              Data: '',
                        },
                        Html: {
                              Data: htmlbody,
                        },
                  },
            }
      };

      console.log("here1     ................");
   try {
            console.log("heres2     ................");
        const data = await ses.sendEmail(params).promise();  // Use .promise() with async/await
        console.log('Email sent successfully:', data);
        return data;
    } catch (err) {
        console.error('Error sending email:', err);
       
    }

}


module.exports = sendSesMail;