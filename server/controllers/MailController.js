/**
 * MailController.js
 * Author: Roman Shuvalov
 */
'use strict';
const nodemailer = require('nodemailer');
    
    
module.exports = {
    sendMail: async (email, token) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.timeweb.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'info@hevachat.com',
                pass: 'jpVuM33c'
            }
        });
        
        let result = await transporter.sendMail({
            from: '"Hevachat" <info@hevachat.com>',
            to: `${email}`,
            subject: "Reset password",
            // text: "",
            html: `<div style="text-align: center;
                background-color: #fff;
                padding: 50px;
                margin: 0 auto;">
                <img  style="border-radius: 150px;
                width: 150px;" src="https://hevachat.com/favicon.png">
                <h2 style="color: #333333;">Восстановление пароля</h2>
                <p style="color: #667788;">Для восстановления пароля нажмите на кнопку ниже</p>
                <a style="padding: 10px 20px;
                background: #008ff7;
                border: none;
                color: #fff;
                text-decoration: none;
                border-radius: 50px;
                transition: all 0.2s;
                margin-top: 20px;
                display: inline-block;" href="https://hevachat.com/reset?token=${token}">Сбросить пароль</a>
            </div>`
        });
    },

    sendMailToSupport: async (message, email, user) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.timeweb.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'support@hevachat.com',
                pass: 'H2Uh9ekj'
            }
        });
        
        let result = await transporter.sendMail({
            from: '"Hevachat" <support@hevachat.com>',
            to: `support@hevachat.com`,
            subject: `Message from ${user._id}`,
            // text: "",
            html: `<div>
                <h1>Пользователь</h1>
                <p>
                    id: ${user._id}<br/>
                    Имя: ${user.name.first}<br/>
                    Фамилия: ${user.name.last}<br/>
                    Почта для ответа: <a href="mailto:${email}">${email}</a>
                </p>

                <h1>Сообщение</h1>
                <p>
                    ${message}
                </p>
            </div>`
        });

        console.log(result);
    },
}