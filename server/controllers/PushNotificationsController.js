const https = require('https');

const androidAppId = process.env.ONESIGNAL_ANDROID_APP_ID
const iosAppId = process.env.ONESIGNAL_IOS_APP_ID

const optionsSendAndroid = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + process.env.ONESIGNAL_ANDROID_API_KEY
    }
};
const optionsDeleteAndroid = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "DELETE",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + process.env.ONESIGNAL_ANDROID_API_KEY
    }
};

const optionsSendIos = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + process.env.ONESIGNAL_IOS_API_KEY
    }
};
const optionsDeleteIos = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "DELETE",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + process.env.ONESIGNAL_IOS_API_KEY
    }
};

function sendPushNotification(data) {
    return new Promise((resolve) => {
        let message = {}
        let options = {}
        if(data.os === 'android') {
            options = optionsSendAndroid
            message = {
                app_id: androidAppId,
                android_accent_color: data.color,
                android_led_color: data.color,
                include_player_ids: data.push_ids,
                contents: {"en": data.text},
                headings: {"en": data.header_text},
                small_icon: data.icon,
                large_icon: data.avatar,
                data: data.additional,
                send_after: new Date(Date.now()+2500).toISOString(),
                thread_id: data.group_id,
                android_group: data.group_name,
                collapse_id: data.group_id,
                android_channel_id: data.channel_id,
                priority: 10,
            }
        } else {
            options = optionsSendIos
            message = {
                app_id: iosAppId,
                include_player_ids: data.push_ids,
                contents: {"en": data.text},
                headings: {"en": data.header_text},
                data: data.additional,
                send_after: new Date(Date.now()+2500).toISOString(),
            }
        }

        let req = https.request(options, function(res) {  
            res.on('data', function(data) {
                console.log(JSON.parse(data));
                resolve(JSON.parse(data).id)
            });
        });
        
        req.on('error', function(e) {
            console.log("ERROR:");
            console.log(e);
        });
        
        req.write(JSON.stringify(message));
        req.end();
    })
};

function removePushNotification(id) {
    let removeNotification1 = {...optionsDeleteAndroid}
    removeNotification1.path += `/${id}?app_id=${androidAppId}`
    let req = https.request(removeNotification1, function(res) {  
        res.on('data', function(data) {
            // console.log(JSON.parse(data));
        });
    });
    
    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });
    
    req.end();

    let removeNotification2 = {...optionsDeleteIos}
    removeNotification2.path += `/${id}?app_id=${iosAppId}`
    let req = https.request(removeNotification2, function(res) {  
        res.on('data', function(data) {
            // console.log(JSON.parse(data));
        });
    });
    
    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });
    
    req.end();
}

module.exports = {
    sendPushNotification,
    removePushNotification
}