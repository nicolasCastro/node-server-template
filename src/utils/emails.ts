import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';

export const sendEmail = async (data: any, next: any) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER ?? 'Gmail',
        port: parseInt(process.env.MAIL_PORT) ?? 587,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });


    const handlebarOptions: any = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
        extName: ".hbs"
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))
    
    // data example
    // var mailOptions = {
    //     from: '"Rabbit Apps" <info@rabbit-apps.com>',
    //     to: 'castronico90@gmail.com',
    //     subject: 'Welcome!',
    //     template: 'forgot-password-email',
    //     context: {
    //         name: "username",
    //         company: 'My Company'
    //     }
    // };

    // trigger the sending of the E-mail
    transporter.sendMail(data, function (error, info) {
        console.log(error);
        if (!error) {
            next(true);
        } else {
            next(false);
        }
    });
}