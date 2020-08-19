import {urlApi} from '../config'

const CTX = new (window.AudioContext || window.webkitAudioContext)()

let newMessageSound = new Audio(`${urlApi}/sounds/NewMessage.mp3`)
let beep = new Audio(`${urlApi}/sounds/Beep.mp3`)
let rington = new Audio(`${urlApi}/sounds/Rington.mp3`)

setInterval(() => {
    CTX.resume().then(() => {})
}, 3000)

beep.addEventListener("ended", function() {
    beep.currentTime = 0;
    let promise = beep.play()

    if (promise !== undefined) {
        promise.then(_ => {}).catch(error => {console.log(error)})
    }
});

rington.addEventListener("ended", function() {
    rington.currentTime = 0;
    let promise = rington.play()

    if (promise !== undefined) {
        promise.then(_ => {}).catch(error => {console.log(error)})
    }
});

export const playNewMessage = () => {
    newMessageSound.currentTime = 0
    let promise = newMessageSound.play()

    if (promise !== undefined) {
        promise.then(_ => {}).catch(error => {console.log(error)})
    }
}

export const playBeep = () => {
    beep.currentTime = 0
    
    let promise = beep.play()

    if (promise !== undefined) {
        promise.then(_ => {}).catch(error => {console.log(error)})
    }
}

export const stopBeep = () => {
    beep.currentTime = 0
    beep.pause()
}

export const playRington = () => {
    rington.currentTime = 0
    
    let promise = rington.play()

    if (promise !== undefined) {
        promise.then(_ => {}).catch(error => {console.log(error)})
    }
}

export const stopRington = () => {
    rington.currentTime = 0
    rington.pause()
}