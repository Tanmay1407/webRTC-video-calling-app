# WebRTC-Based Video Calling App 📹

A real-time video calling application built with **WebRTC**, featuring a signalling server, and leveraging **STUN/TURN servers** for NAT traversal.

## 🚀 Features
- **Real-time Video Calling**: Establish direct peer-to-peer connections using WebRTC.
- **Signaling Server**: Built with **Socket.IO** to exchange Session Description Protocol (SDP) offers/answers and ICE candidates.
- **STUN/TURN Integration**: Uses Google’s STUN/TURN servers to fetch ICE candidates for public IP discovery and NAT traversal.
- **Low Latency**: Optimized for seamless audio and video transmission.

## 🌐 Why WebRTC Prefers UDP Over TCP
- **Connectionless Protocol**: UDP is faster as it doesn’t require acknowledgement packets like TCP.
- **Tolerates Minor Data Loss**: Suitable for real-time media where slight data loss is preferable to delays.
- **No Head-of-Line Blocking**: Ensures smoother streams by delivering packets independently.

## 🛠️ Technologies Used
- **WebRTC**: For peer-to-peer communication.
- **Socket.IO**: For signaling between peers.
- **Google STUN/TURN Servers**: For ICE candidate gathering and NAT traversal.
- **HTML/CSS/JavaScript**: Frontend implementation.

## 🖼️ Application Flow
1. **Signaling**: Clients connect to the signalling server to exchange SDP offers/answers.
2. **ICE Candidate Gathering**: STUN/TURN servers fetch public IPs to enable connection.
3. **Peer-to-Peer Communication**: WebRTC establishes a secure connection for real-time audio/video.

![Flow Diagram](https://github.com/Tanmay1407/webRTC-video-calling-app/blob/main/WebRTC_Framework_Flow.png)
