// import React, { useRef, useState, useEffect } from "react";
// import socket from "../socket/socket";

// const LiveCall = ({ room }) => {
//   const videoRef = useRef(null);        // Local video
//   const remoteVideoRef = useRef(null);  // Patient video
//   const peerRef = useRef(null);         // RTCPeerConnection
//   const [stream, setStream] = useState(null);
//   const [started, setStarted] = useState(false);

//   const roomId = room.roomId; // roomId passed from Dashboard

//   // 1️⃣ Start Camera automatically on mount
//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         videoRef.current.srcObject = mediaStream;
//         setStream(mediaStream);
//         setStarted(true);
//       } catch (err) {
//         console.error("Camera permission denied:", err);
//         alert("Camera permission allow karo");
//       }
//     };

//     startCamera();
//   }, []);

//   // 2️⃣ Create Peer Connection & Offer
//   const createOffer = async () => {
//     if (!stream) return alert("Camera not started yet!");

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     peerRef.current = pc;

//     // Add local tracks
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     // Remote tracks
//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     // ICE candidates
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           roomId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     // Create Offer
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     // Send offer to server
//     socket.emit("offer", {
//       roomId,
//       offer,
//     });
//     console.log("✅ Offer sent to patient");
//   };

//   // 3️⃣ Listen for Answer from patient
//   useEffect(() => {
//     socket.on("answer", async ({ answer }) => {
//       if (!peerRef.current) return;
//       await peerRef.current.setRemoteDescription(answer);
//       console.log("✅ Answer received from patient");
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       if (peerRef.current && candidate) {
//         try {
//           await peerRef.current.addIceCandidate(candidate);
//         } catch (err) {
//           console.error("Error adding ICE candidate:", err);
//         }
//       }
//     });

//     return () => {
//       socket.off("answer");
//       socket.off("ice-candidate");
//     };
//   }, []);

//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
//       <h2 className="text-white text-xl font-bold mb-4">Live Consultation</h2>

//       {/* Local Video */}
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         className="w-80 h-56 rounded-lg border-4 border-white object-cover mb-4"
//       />

//       {/* Remote Video */}
//       <video
//         ref={remoteVideoRef}
//         autoPlay
//         playsInline
//         className="w-80 h-56 rounded-lg border-4 border-red-500 object-cover mb-4"
//       />

//       {/* Start Call Button */}
//       {started && (
//         <button
//           className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition duration-200"
//           onClick={createOffer}
//         >
//           Call Patient
//         </button>
//       )}
//     </div>
//   );
// };

// export default LiveCall;

import React, { useRef, useState, useEffect } from "react";
import socket from "../socket/socket";

const LiveCall = ({ room }) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    };
    startCamera();
  }, []);

  const startCall = async () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerRef.current = pc;

    // add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // remote stream
    pc.ontrack = (event) => { remoteRef.current.srcObject = event.streams[0]; };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId: room.roomId, candidate: event.candidate });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { roomId: room.roomId, offer });
  };

  useEffect(() => {
    socket.on("answer", async ({ answer }) => {
      if (peerRef.current) await peerRef.current.setRemoteDescription(answer);
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerRef.current) await peerRef.current.addIceCandidate(candidate);
    });
    return () => {
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <h2 className="text-white mb-4">Live Consultation</h2>
      <video ref={localRef} autoPlay muted className="w-80 h-56 border mb-2" />
      <video ref={remoteRef} autoPlay className="w-80 h-56 border mb-2" />
      {stream && <button onClick={startCall} className="bg-green-600 text-white px-4 py-2 rounded">Call Patient</button>}
    </div>
  );
};

export default LiveCall;