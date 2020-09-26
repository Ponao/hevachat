/**
 * RoomController.js
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
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}