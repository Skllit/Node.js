var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sklallucination@gmail.com',
    pass: 'qxmx nfzq bobp oaby'
  }
});

var mailOptions = {
  from: 'sklallucination@gmail.com',
  to: 'nivedan.r@ust.com',
  subject: 'BlackSphere sent a mail',
  text: 'ur laptop is hacked!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});