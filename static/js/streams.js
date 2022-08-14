const APP_ID = 'eb3e875e3cec4057b70bd1e07645b3c0'
const CHANNEL = 'main'
const TOKEN = '006eb3e875e3cec4057b70bd1e07645b3c0IADZama/MRhbqNyo++4ph7wiHWPPfV2ts5ivuJG72c0bsmTNKL8AAAAAEACLq5A0CLL6YgEAAQAGsvpi'
let UID
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null)
    //index 0 audio index 1 is video
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `
    <div class="video-container" id="user-container-${UID}">
        <div class="username-wrapper"><span class="user-name">My Name</span></div>
             <div class="video-player" id="user-${UID}"></div>
        </div>
                `
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0],localTracks[1]])
}

joinAndDisplayLocalStream()