export function getHM(time) {
    var time = new Date(time)

    var hours = time.getHours()
    var minutes = time.getMinutes()

    if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
    }
    if (hours.toString().length == 1) {
        hours = "0" + hours;
    }

    return hours + ":" + minutes
}