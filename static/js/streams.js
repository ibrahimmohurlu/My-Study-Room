const APP_ID = 'eb3e875e3cec4057b70bd1e07645b3c0'
const CHANNEL = sessionStorage.getItem('roomName')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
let NAME = sessionStorage.getItem('userName')

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
const studySessionLength = 5

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(error)
        window.open('/', '_self')
    }

    //index 0 audio index 1 is video
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let member = await createMember()

    let player = `
    <div class="video-container" id="user-container-${UID}">
        <div class="username-wrapper" id="username-wrapper-${UID}"><span id="user-name">${member.name}</span></div>
             <div class="video-player" id="user-${UID}"></div>
        </div>
                `
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    document.getElementById(`username-wrapper-${UID}`).style.backgroundColor = "rgba(52, 171, 58, 0.88)"
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container${user.uid}`)
        if (player != null) {
            player.remove()
        }

        let member = await getMember(user)

        player = `
        <div class="video-container" id="user-container-${user.uid}">
            <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                <div class="video-player" id="user-${user.uid}"></div>
            </div>
                `
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === 'audio') {
        user.audioTrack.play()
    }

}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()

    deleteMember()
    window.open('/', '_self')
}

let handleUserCheck = async () => {
    let response = fetch(`/update_status/?UID=${UID}&room_name=${CHANNEL}`)
    let member = await (await response).json()
    if (member.check_status === true) {
        document.getElementById('timer-btn').style.backgroundColor = '#ff7900'
    } else {
        document.getElementById('timer-btn').style.backgroundColor = '#fff'
    }
    const sessionInterval = setInterval(async () => {
        let response = fetch(`/can_session_start/?room_name=${CHANNEL}`)
        let canSessionStart = await (await response).json()
        console.log(canSessionStart.can_session_start)
        if (canSessionStart.can_session_start) {
            clearInterval(sessionInterval)
            startStudySession()
        }
    }, 1000)
}



let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgba(255, 80, 80, 1)'
    }
}

let toggleMicrophone = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        document.getElementById("mic-btn").style.backgroundColor = "#fff"
        //e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        document.getElementById("mic-btn").style.backgroundColor = "rgba(255, 80, 80, 1)"
        //e.target.style.backgroundColor = 'rgba(255, 80, 80, 1)'
    }
}
let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })
    let member = await response.json()
    return member
}


let getMember = async (user) => {
    let response = fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await (await response).json()
    return member
}

let getMembers = async () => {
    let response = fetch(`/get_members/?room_name=${CHANNEL}`)
    let members = await (await response).json()
    return members
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })
    let member = await response.json()
}

joinAndDisplayLocalStream()


async function startTimer(duration, display, type, _callback) {
    var timer = duration, minutes, seconds;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = type + " session ends in " + minutes + ":" + seconds;
        console.log("interval works")
        if (--timer < 0) {
            clearInterval(interval)
            display.textContent = ""
            _callback()
        }
    }, 1000);
    return
}



window.addEventListener('beforeunload', deleteMember)

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)

document.getElementById('camera-btn').addEventListener('click', toggleCamera)

document.getElementById('mic-btn').addEventListener('click', toggleMicrophone)

document.getElementById('timer-btn').addEventListener('click', handleUserCheck)

let revertSessionChanges = async () => {
    let response = fetch(`/update_status/?UID=${UID}&room_name=${CHANNEL}`)
    let member = await (await response).json()
    console.log("member stauts changed to: " + member.check_status)
    let timerBtn = document.getElementById('timer-btn')
    timerBtn.style.backgroundColor = '#fff'
    timerBtn.style.cursor = "pointer"
    let micBtn = document.getElementById('mic-btn')
    micBtn.addEventListener('click', toggleMicrophone)
    toggleMicrophone()
    micBtn.style.cursor = "pointer"
    document.getElementById('timer-btn').addEventListener('click', handleUserCheck)
}


let startStudySession = async () => {
    let timerBtn = document.getElementById('timer-btn')
    timerBtn.style.backgroundColor = '#42855B'
    timerBtn.style.cursor = "default"
    document.getElementById('timer-btn').removeEventListener('click', handleUserCheck)
    let timer = document.getElementById("timer")
    let micBtn = document.getElementById('mic-btn')
    micBtn.removeEventListener('click', toggleMicrophone)
    micBtn.style.cursor = "default"
    if (!localTracks[0].muted) {
        toggleMicrophone()
    }
    startTimer(studySessionLength, timer, "Study", revertSessionChanges)
}

let checkForSession = async () => {
    let response = fetch(`/can_session_start/?room_name=${CHANNEL}`)
    let canSessionStart = await (await response).json()
    console.log(canSessionStart.can_session_start)
    if (canSessionStart.can_session_start) {
        clearInterval(sessionInterval)
        startStudySession()
    }
}






