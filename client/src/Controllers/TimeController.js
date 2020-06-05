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