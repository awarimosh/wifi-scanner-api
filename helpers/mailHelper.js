exports.send_mail = function (to, sub, msg) {
    var nodemailer = require("nodemailer");
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "signagelog@gmail.com",
            pass: "1vje!lj$"
        }
    });
    var mailOptions = {
        from: 'Suretouch Supports<noreply@suretouch.com>', // sender address
        to: to, // list of receivers
        subject: sub, //'Password Reset ✔', // Subject line
        text: msg, // plaintext body
        html: msg // html body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}