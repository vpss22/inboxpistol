const nodemailer = require('nodemailer');

async function sendMail(details, campData, subject, mailList)
{ 
      console.log('details: ', details);
      var smtpTransport = nodemailer.createTransport({
		service: details.service,
		host: details.host,
            port: details.port,
            secure: true,
		auth: {
			user: details.email, // user field on frontend in smtp settings
			pass: details.password
		}
      });  
 

      var data = (campData.font_family)?.toString();
      var dtt = data?.split(',')
      var linkHTML = '';
      for(let i=0; i<dtt?.length; i++){
            if(linkHTML!=''){
                  linkHTML +='|'+dtt[i]
            }else{
                  linkHTML +=dtt[i]
            }
      }
      var link = '<link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family='+linkHTML+'" media="all">'
      
      var htmlbody = '<!DOCTYPE html><html><head>'+
      '<meta charset="utf-8">'+
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
      link+  
      '</head><body>'+
      campData.template+'</body></html>'
      
      var mailOptions={
            from: details.email,
            to : mailList,
            subject : subject,
            text : '',
            html: htmlbody
      }
      
      let info = await smtpTransport.sendMail(mailOptions);
      smtpTransport.close();
      console.log(info)
      return info;

}

module.exports = sendMail;