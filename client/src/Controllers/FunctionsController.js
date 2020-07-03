export function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

export function setTitle(path, routeArray) {
	var pageTitle;
	for (var i=0; i < routeArray.length; i++) {
		if (routeArray[i].path === path) {
			pageTitle = 'Hevachat | ' + routeArray[i].title;
		}
	}
	document.title = (pageTitle) ? pageTitle : 'Hevachat';
}

export function setForceTitle(title) {
	document.title = 'Hevachat | ' + title;
}