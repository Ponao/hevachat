import languages from "../languages";
import store from "../Redux/store";

export function getHM(date) {
    var time = new Date(date)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length === 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length === 1) {
        hours = "0" + hours;
    }

    return hours + ":" + minutes
}

export function timeAt(date) {
    let lang = store.getState().user.lang
    var time = new Date(date)

    var day_diff = new Date().getDate() - time.getDate(),
        year_diff = new Date().getFullYear() - time.getFullYear();
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate();
        
    if (year_diff > 0)
        return (
            year.toString()+'.'
            +((month<10) ? '0'+month.toString() : month.toString())+'.'
            +((day<10) ? '0'+day.toString() : day.toString())
        );

    var arr=[
        languages[lang].january,
        languages[lang].february,
        languages[lang].march,
        languages[lang].april,
        languages[lang].may,
        languages[lang].june,
        languages[lang].july,
        languages[lang].august,
        languages[lang].september,
        languages[lang].october,
        languages[lang].november,
        languages[lang].december
    ];

    var r =
    ( 
        (
            day_diff === 0 && languages[lang].today
        )
        || (day_diff === 1 && languages[lang].yerstaday)
        || (year_diff === 0 && day + ' ' + arr[month-1])
    );
    return r;
}

export function LastMessageDate(timeR) {
    let lang = store.getState().user.lang
    var time = new Date(timeR)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length === 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length === 1) {
        hours = "0" + hours;
    }

    var day_diff = new Date().getDate() - time.getDate(),
        year_diff = new Date().getFullYear() - time.getFullYear();
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate();
        
    if (year_diff > 0)
        return (
            year.toString()+'.'
            +((month<10) ? '0'+month.toString() : month.toString())+'.'
            +((day<10) ? '0'+day.toString() : day.toString())
        );

    var arr=[
        languages[lang].jan,
        languages[lang].feb,
        languages[lang].mar,
        languages[lang].apr,
        languages[lang].may,
        languages[lang].jun,
        languages[lang].jul,
        languages[lang].aug,
        languages[lang].sep,
        languages[lang].oct,
        languages[lang].nov,
        languages[lang].dec,
    ];

    var r =
    ( 
        (
            day_diff === 0 && 
            (hours + ':' +  minutes)
        )
        || (day_diff === 1 && languages[lang].yerstaday)
        || (year_diff === 0 && day + ' ' + arr[month-1])
    );

    return r;
}

export function OnlineDate(timeR) {
    let lang = store.getState().user.lang
    var time = new Date(timeR)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length === 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length === 1) {
        hours = "0" + hours;
    }

    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate();
        console.log(day)

    var diff = (((new Date()).getTime() - time.getTime()) / 1000),
        day_diff = new Date().getDate() - time.getDate();
    var month_diff = (new Date().getMonth()+1) - (time.getMonth()+1)

    if (isNaN(day_diff) || day_diff < 0 || month_diff >= 1 )
        return (
            year.toString()+'.'
            +((month<10) ? '0'+month.toString() : month.toString())+'.'
            +((day<10) ? '0'+day.toString() + ' in ' + hours + ':' +  minutes : day.toString() + ' in ' + hours + ':' +  minutes)
        );
    
        
    var r =
    ( 
        (
            day_diff === 0 && 
            (
                (diff < 60 && languages[lang].just_now)
                || (diff < 120 && '1 ' + languages[lang].minute_1 + ' ' + languages[lang].ago)
                || (diff < 3600 && Math.floor(diff / 60) + ' ' + declension(Math.ceil(diff / 60), [languages[lang].minute_1, languages[lang].minute_2, languages[lang].minute_5]) + ' ' + languages[lang].ago)
                || (diff < 7200 && '1 ' + languages[lang].hour_1 + ' ' + languages[lang].ago)
                || (diff < 86400 && Math.floor(diff / 3600) + ' ' + declension(Math.ceil(diff / 3600), [languages[lang].hour_1, languages[lang].hour_2, languages[lang].hour_5]) + ' ' + languages[lang].ago)
            )
        )
        || (day_diff === 1 && languages[lang].yerstaday + ' ' + languages[lang].in + ' ' + hours + ':' +  minutes)
        || (day_diff < 7 && day_diff + ' ' + declension(Math.ceil(day_diff), [languages[lang].day_1, languages[lang].day_2, languages[lang].day_5]) + ' ' + languages[lang].ago + ' ' + languages[lang].in + ' ' + hours + ':' +  minutes)
        || (day_diff < 31 && Math.ceil(day_diff / 7) + ' ' + declension(Math.ceil(day_diff / 7), [languages[lang].week_1, languages[lang].week_2, languages[lang].week_5]) + ' ' + languages[lang].ago + ' ' + languages[lang].in + ' ' + hours + ':' +  minutes)
    );
    return r;
}

function declension(n, text_forms) {  
    n = Math.abs(n) % 100; var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}