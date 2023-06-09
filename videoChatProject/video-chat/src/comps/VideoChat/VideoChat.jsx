import React from "react";
import './VideoChat.css';

function VideoChat() {
    const CAPTURE_OPTIONS = {
        audio: false,
        video: true
    }

    let peerConnection;
    let localStream;
    let remoteStream;

    let servers = {
        iceServers:[
            {
                urls:["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"]
            }
        ]
    }

    let init = async() => {
        localStream = await navigator.mediaDevices.getUserMedia(CAPTURE_OPTIONS)
        document.getElementById("user-2-video").srcObject= localStream;
    }

    const createOffer = async ()=>{
        peerConnection = new RTCPeerConnection(servers);

        remoteStream = new MediaStream();
        document.getElementById("user-1-video").srcObject= remoteStream;

        localStream.getTracks().forEach(element => {
            peerConnection.addTrack(element, localStream);
        });

        peerConnection.ontrack = async (event) => {
            event.streams[0].getTracks().forEach(element => {
                remoteStream.addTrack(element);
            });
        }

        peerConnection.onicecandidate = async (event) => {
            if(event.candidate) {
                document.getElementById("offer-sdp").value = JSON.stringify(peerConnection.localDescription);
                navigator.clipboard.writeText(JSON.stringify(peerConnection.localDescription));
            }
        }

        let offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        offer = JSON.stringify(offer);
        document.getElementById("offer-sdp").value = offer;

    }

    const createAnswer = async () => {
        peerConnection = new RTCPeerConnection(servers);

        remoteStream = new MediaStream();
        document.getElementById("user-1-video").srcObject = remoteStream;

        localStream.getTracks().forEach(element => {
            peerConnection.addTrack(element, localStream);
        });

        peerConnection.ontrack = async (event) => {
            event.streams[0].getTracks().forEach(element => {
                remoteStream.addTrack(element);
            });
        }

        peerConnection.onicecandidate = async (event) => {
            if(event.candidate) {

                document.getElementById("offer-sdp").value = JSON.stringify(peerConnection.localDescription);
                navigator.clipboard.writeText(JSON.stringify(peerConnection.localDescription));
            }
        }

        let offer = document.getElementById("offer-sdp").value;
        if (!offer) return alert("No offer provided");
        offer = JSON.parse(offer)
        await peerConnection.setRemoteDescription(offer);

        let answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        answer = JSON.stringify(answer)
        document.getElementById("answer-sdp").value = answer;
    }

    const addAnswer = async () => {
        let answer = document.getElementById("answer-sdp").value;
        if (!answer) return alert("No answer provided");

        answer = JSON.parse(answer);
        if(!peerConnection.currentRemoteDescription) {
            peerConnection.setRemoteDescription(answer);
        }
    }

    const answerHandler = async() => {
        let answer = document.getElementById("answer-sdp").value;
        if (!answer) {
            createAnswer();
        } else {
            addAnswer();
        }
    }

    init();

    return (
        <div className="videoChat">
            <div className="containter">
                <div id="videos">
                    <video className="video-player" id="user-1-video" autoPlay playsInline/>
                    <video className="video-player" id="user-2-video" autoPlay playsInline/>
                </div>
            </div>
            <div className="containter">
            <div id="inputs">
                <label htmlFor="offer-sdp">Offer SDP</label>
                <button id="create-offer" onClick={createOffer}>Create Offer</button>
                <br/>
                <textarea id="offer-sdp"></textarea>

                <br/>
            
                <label htmlFor="answer-sdp">Answer SDP</label>
                <button id="create-answer" onClick={answerHandler}>Create/Add Answer</button>

                <br/>
                <textarea id="answer-sdp"></textarea>

            </div>
            </div>
            
        </div>
    );
}

export default VideoChat;