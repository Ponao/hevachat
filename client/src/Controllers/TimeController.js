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

    var diff = (((new Date()).getTime() - time.getTime()) / 1000),
        day_diff = new Date().getDay() - time.getDay();
     var   month_diff = (new Date().getMonth()+1) - (time.getMonth()+1)
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate();

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
                || (diff < 120 && '1 minute ago')
                || (diff < 3600 && Math.floor(diff / 60) + 'minutes ago')
                || (diff < 7200 && '1 hour ago')
                || (diff < 86400 && Math.floor(diff / 3600) + 'hours ago')
            )
        )
        || (day_diff === 1 && languages[lang].yerstaday + languages[lang].in + hours + ':' +  minutes)
        || (day_diff < 7 && day_diff + 'days ago' + languages[lang].in + hours + ':' +  minutes)
        || (day_diff < 31 && Math.ceil(day_diff / 7) + 'weeks ago' + languages[lang].in + hours + ':' +  minutes)
    );
    return r;
}