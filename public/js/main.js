const socket = io()

const muteButton = document.getElementById('muteButton')
const userForm = document.getElementById('userForm');
const usernameInput = document.getElementById('usernameInput');
const userList = document.getElementById('userList');
const cameraButton = document.getElementById('cameraButton')
const endCallButton = document.getElementById('endCallButton')
const localVideoDisplay = document.getElementById('localVideo')
const remoteVideoDisplay = document.getElementById('remoteVideo')
let caller;

let isVideo = false
remoteVideoDisplay.style.display = 'none'
let localStream = ''

endCallButton.style.display = 'none'
let thisUser = ''

userForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission
    const username = usernameInput.value.trim();
    if (username) {
        thisUser = username
        addUserToList(username);
        usernameInput.value = ''; 
        userForm.style.display = 'none';
        socket.emit("new-user",username)
    }
});

function addUserToList(username) {
    const li = document.createElement('li');

    const userText = document.createTextNode(username == thisUser ? username+" (You)":username);
    li.appendChild(userText);

    if(username != thisUser){
        const callIcon = document.createElement('i');
        callIcon.className = 'fas fa-phone-alt call-icon';
        callIcon.title = `Call ${username}`;
        callIcon.addEventListener('click', () => {
            initiateCall(username);
        });
        li.appendChild(callIcon);
    }
    
    userList.appendChild(li);
}

async function initiateCall(username) {
    if(thisUser.length == 0){
        alert("Please create a user...")
        return
    }
    console.log(`Calling ${username}...`);
    let pc = PeerConnection.getInstance();
    const offer = await pc.createOffer()
    console.log(`Offer Create For User ${username}: ${offer}`);
    await pc.setLocalDescription(offer)
    socket.emit("offer",{from: thisUser, to: username, offer: pc.localDescription})
}

socket.on("new-joined",allUsers =>{
    userList.innerHTML = ''
    for(user of allUsers) addUserToList(user.username)
})

muteButton.addEventListener('click', () => {
    console.log('Mute button clicked');
});

cameraButton.addEventListener('click', () => {
    if(isVideo) localVideoDisplay.srcObject = null
    else startMyVideo()
    isVideo = !isVideo
});

endCallButton.addEventListener('click', () => {
    socket.emit("exit-call", caller)
});


async function startMyVideo(){
    try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        localStream = stream
        localVideoDisplay.srcObject = localStream
        isVideo = true
    } catch (error) {
        console.log(`Error occurred while stating local video stream: ${error}`)
    }
}
startMyVideo()

//Socket Listeners
socket.on("icecandidate", async candidate => {
    console.log(`A ICE Candidate Received from Network: ${JSON.stringify(candidate)}`);
    let pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
})

socket.on("offer", async ({from,to,offer}) => {
    console.log(`Offer Received From: ${from} : Offer: ${offer}`);
    let pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket.emit("answer",{to, from, answer: pc.localDescription})
    caller = [to,from]
    remoteVideoDisplay.style.display = 'block'
})

socket.on("answer", async({from,to,answer})=>{
    console.log(`Answer Received From ${to} : ${answer}`);
    let pc = PeerConnection.getInstance()
    await pc.setRemoteDescription(answer)
    remoteVideoDisplay.style.display = 'block'
    socket.emit("active-end-call",{from,to})
    caller = [to,from]
})

socket.on("active-end-call",({to,from})=>{
    endCallButton.style.display = 'block'
})

socket.on("exit-call",()=>{
    caller = [];
    PeerConnection.killInstance()
    remoteVideoDisplay.style.display = 'none'
    endCallButton.style.display = 'none'
})


//Singleton method to get instance of peerConnection
const PeerConnection = (function (){
    let peerConnection;
    const createPeerConnection = () => {
        // Using Google's free Stun Server to get ICE Candidate (for Public IP)
       const config = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
       }
       const peerConnection = new RTCPeerConnection(config)

       //Adding localStream to peerConnection
       localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track,localStream)
       });

       //Getting remoteStream from peerConnection
       peerConnection.ontrack = function(event){
            remoteVideoDisplay.srcObject = event.streams[0]
       }

       //Listening for ICE Candidate
       peerConnection.onicecandidate = function(event) {
        if(event.candidate) {
            socket.emit("icecandidate", event.candidate);
        }
    }

    return peerConnection;
    }

    return {
        getInstance: () => {
        if(!peerConnection){
            peerConnection = createPeerConnection()
        }
        return peerConnection
    },
      killInstance: ()=>{
        PeerConnection.getInstance().close()
        peerConnection = null
      }
}
})()