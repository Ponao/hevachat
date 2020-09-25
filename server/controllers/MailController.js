/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';
const nodemailer = require('nodemailer');
    
    
module.exports = {
    sendMail: async () => {
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
            from: '"Node js" <support@hevachat.com>',
            to: "pffbread@gmail.com",
            subject: "Message from Node js",
            text: "This message was sent from Node js server.",
            html: `<div>
                <h2>Восстановление пароля</h2>
                <p>Для восстановления пароля нажмите на кнопку ниже</p>
                <a href="hevachat.com" style="padding: 10px;background: #008ff7;border: none;">Сбросить пароль</a>
            </div>`
        });
    },
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}