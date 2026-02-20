import React, { useRef, useState } from "react";
import socket from "../socket/socket";

const LiveCall = () => {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [started, setStarted] = useState(false);

  // 1️⃣ Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setStarted(true);
    } catch (err) {
      console.error(err);
      alert("Camera permission allow karo");
    }
  };

  // 2️⃣ Create Offer (YAHAN add karna tha 👇)
  const createOffer = async () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // save reference
    peerRef.current = pc;

    // add local stream
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // remote stream receive
    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // send ice candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
            roomId: appointmentId,
            candidate: event.candidate
        });

      }
    };

    // create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
        roomId: "ROOM_ID_YAHAN",
        offer: offer
    });

    console.log("✅ OFFER SENT:", offer);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">

      {!started && (
        <button
          onClick={startCamera}
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          Start Camera
        </button>
      )}

      {started && (
        <button
          onClick={createOffer}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg mt-4"
        >
          Call Patient
        </button>
      )}

      {/* Local Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="mt-6 w-80 h-56 rounded-lg border-4 border-white object-cover"
      />

      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="mt-6 w-80 h-56 rounded-lg border-4 border-red-500 object-cover"
      />
    </div>
  );
};

export default LiveCall;
