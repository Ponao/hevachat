/**
 * CallMessageController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Dialog = require('../models/Dialog');
const Message = require('../models/Message');
const User = require('../models/User');

const sendCallMessage = async (userIdFrom, userIdTo, io, type) => {
    let user = await User.findById(userIdFrom)
    let userTo = await User.findById(userIdTo)

    let dialog = await Dialog.findOne({'users': {'$all': [user, userTo]}}).populate([
        {
            path: 'users',
            select: ['_id', 'name', 'online', 'color']
        },
        {
            path: 'messages'
        },
        {
            path: 'lastMessage',
        },
    ]).sort({createdAt: 'DESC'});

    if(!dialog) {
        dialog = new Dialog()

        dialog.users = [user, userTo]

        await dialog.save()
    }

    let message = new Message()

    message.type = 'call'
    message.text = type
    message.user = user
    message.dialogId = dialog._id

    await message.save()

    dialog.lastMessage = message
    dialog.noRead = dialog.noRead + 1
    dialog.updatedAt = new Date()

    await dialog.save()

    io.to(`user.${userIdFrom}`).emit('sendMessageDialog', ({message, otherId: userIdTo}))
    io.to(`user.${userIdTo}`).emit('sendMessageDialog', ({message, otherId: userIdFrom}))
}

module.exports = {
    sendCallMessage
}