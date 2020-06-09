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
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var r =
    ( 
        (
            day_diff === 0 && 'Today'
        )
        || (day_diff === 1 && 'Yesterday')
        || (year_diff === 0 && day + ' ' + arr[month-1])
    );
    return r;
}

export function LastMessageDate(time) {
    var time = new Date(time)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length == 1) {
        hours = "0" + hours;
    }

    var diff = (((new Date()).getTime() - time.getTime()) / 1000),
        day_diff = new Date().getDate() - time.getDate(),
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
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var r =
    ( 
        (
            day_diff == 0 && 
            (hours + ':' +  minutes)
        )
        || (day_diff === 1 && 'Yesterday')
        || (year_diff === 0 && day + ' ' + arr[month-1])
    );

    return r;
}

export function OnlineDate(time) {
    var time = new Date(time)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length == 1) {
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
            +((day<10) ? '0'+day.toString() +  " " + 'in' + " " + hours + ':' +  minutes : day.toString() +  " " + 'in' + " " + hours + ':' +  minutes)
        );
    
        
    var r =
    ( 
        (
            day_diff == 0 && 
            (
                (diff < 60 && 'just now')
                || (diff < 120 && "1 " + 'minute' + " " + 'ago' + "")
                || (diff < 3600 && Math.floor(diff / 60) + " " + 'minutes' + " " + 'ago' + "")
                || (diff < 7200 && "1 " + 'hour' + " " + 'ago' + "")
                || (diff < 86400 && Math.floor(diff / 3600) + " " + 'hours' + " " + 'ago')
            )
        )
        || (day_diff == 1 && 'yerstaday' + " " + 'in' + " " + hours + ':' +  minutes)
        || (day_diff < 7 && day_diff + " " + 'days' + " " + 'ago' + " " + 'in' + " " + hours + ':' +  minutes)
        || (day_diff < 31 && Math.ceil(day_diff / 7) + " " + 'weeks' + " " + 'ago' + " " + 'in' + " " + hours + ':' +  minutes)
    );
    return r;
}