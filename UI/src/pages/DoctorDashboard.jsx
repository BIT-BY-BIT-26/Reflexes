import React, { useEffect, useState, useRef } from 'react'
import Sidebar from '../components/Hospitals/Sidebar'
import Navbar from '../components/Navbar'
import AccessFeatures from '../features/doctor/AccessFeatures'
import DoctorHome from '../components/Doctors/DoctorHome'
import { getDoctorStatus } from '../api/backend'
import socket from '../socket'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../redux/slices/notificationSlice'

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const statsIntervalRef = useRef(null);
  const [patientSocketId, setPatientSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const handlePatientOnline = (data) => {
      console.log("🟢 Patient online:", data.patientId);
      console.log("Patient socket ID:", data.socketId);
      setPatientSocketId(data.socketId);
    };

    socket.on("patient-online", handlePatientOnline);

    return () => {
      socket.off("patient-online", handlePatientOnline);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      console.log("🎥 Camera + microphone started");
      console.log("Video tracks:", stream.getVideoTracks());
      console.log("Audio tracks:", stream.getAudioTracks());
    } catch (error) {
      console.log("❌ Camera/Mic error:", error);
    }
  };

  const cleanupPeerConnection = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const callPatient = async () => {
    try {
      if (!localStream) {
        alert("Start camera first");
        return;
      }

      if (!patientSocketId) {
        alert("Patient is not connected");
        return;
      }

      // Agar pehle se koi call chal rahi thi to usse band karo
      cleanupPeerConnection();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });

      peerConnection.current = pc;

      // 🔍 WEBRTC DEBUG — jab connection close/failed ho jaye to interval clear ho
      statsIntervalRef.current = setInterval(async () => {
        const currentPC = peerConnection.current;

        if (!currentPC) {
          clearInterval(statsIntervalRef.current);
          return;
        }

        if (
          currentPC.connectionState === "failed" ||
          currentPC.connectionState === "closed" ||
          currentPC.connectionState === "disconnected"
        ) {
          clearInterval(statsIntervalRef.current);
          statsIntervalRef.current = null;
        }

        console.log("========== WEBRTC STATE ==========");
        console.log("Connection State:", currentPC.connectionState);
        console.log("ICE State:", currentPC.iceConnectionState);
        console.log("Signaling State:", currentPC.signalingState);

        const stats = await currentPC.getStats();

        stats.forEach((report) => {
          if (
            report.type === "inbound-rtp" &&
            (report.kind === "video" || report.mediaType === "video")
          ) {
            console.log("📥 INBOUND VIDEO STATS:", {
              packetsReceived: report.packetsReceived,
              bytesReceived: report.bytesReceived,
              framesReceived: report.framesReceived,
              framesDecoded: report.framesDecoded,
              keyFramesDecoded: report.keyFramesDecoded,
              frameWidth: report.frameWidth,
              frameHeight: report.frameHeight,
            });
          }
        });
      }, 2000);

      // Doctor ke camera + mic tracks WebRTC mein add
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // ICE candidate milte hi patient ko bhejna
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 DOCTOR ICE CANDIDATE:", {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          });

          socket.emit("ice-candidate", {
            targetSocketId: patientSocketId,
            candidate: event.candidate,
          });
        } else {
          console.log("🏁 Doctor ICE gathering completed");
        }
      };

      pc.onicecandidateerror = (event) => {
        console.error("❌ ICE CANDIDATE ERROR:", {
          errorCode: event.errorCode,
          errorText: event.errorText,
          url: event.url,
        });
      };

      pc.onconnectionstatechange = () => {
        console.log("🔗 CONNECTION STATE:", pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE CONNECTION STATE:", pc.iceConnectionState);
      };

      pc.ontrack = (event) => {
        console.log("📺 Patient remote track received");
        console.log("Track:", event.track);
        console.log("Track kind:", event.track.kind);
        console.log("Track enabled:", event.track.enabled);
        console.log("Track readyState:", event.track.readyState);

        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];

          console.log("📺 Patient remote stream:", stream);
          console.log("Remote video tracks:", stream.getVideoTracks());
          console.log("Remote audio tracks:", stream.getAudioTracks());

          setRemoteStream(stream);
        }
      };

      // Offer create
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Patient ko call bhejo
      socket.emit("call-user", {
        targetSocketId: patientSocketId,
        offer,
      });

      console.log("📞 Call sent to patient");
    } catch (error) {
      console.error("❌ Call failed:", error);
    }
  };

  useEffect(() => {
    const handleCallAccepted = async (data) => {
      console.log("📲 CALL ACCEPTED!");
      console.log("Answer received:", data.answer);

      try {
        if (!peerConnection.current) {
          console.log("❌ PeerConnection not found");
          return;
        }

        const answer = new RTCSessionDescription(data.answer);
        await peerConnection.current.setRemoteDescription(answer);

        console.log("✅ Doctor remote answer set");
      } catch (error) {
        console.error("❌ Error setting remote answer:", error);
      }
    };

    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
    };
  }, []);

  useEffect(() => {
    const video = remoteVideoRef.current;

    if (!video || !remoteStream) {
      console.log("❌ Video element or remote stream missing");
      return;
    }

    console.log("🎬 Attaching patient stream to video");

    video.srcObject = remoteStream;

    console.log("Video element:", video);
    console.log("Video srcObject:", video.srcObject);

    video.onloadedmetadata = () => {
      console.log("📦 Remote video metadata loaded");
      console.log("Video width:", video.videoWidth);
      console.log("Video height:", video.videoHeight);
      console.log("Ready state:", video.readyState);
      console.log("Paused:", video.paused);

      video.play()
        .then(() => {
          console.log("▶️ Remote video PLAYING");
        })
        .catch((error) => {
          console.error("❌ Remote video play failed:", error);
        });
    };

    return () => {
      video.onloadedmetadata = null;
    };
  }, [remoteStream]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Component unmount hone par peer connection aur stream saaf karo
  useEffect(() => {
    return () => {
      cleanupPeerConnection();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctorId;

  useEffect(() => {
    const handleNewAppointment = (data) => {
      dispatch(addNotification({
        id: data.appointmentId,
        message: data.message,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        date: data.date,
        type: "NEW_APPOINTMENT",
        createdAt: new Date().toISOString()
      }));
    };
    socket.on("new-appointment", handleNewAppointment);

    return () => {
      socket.off("new-appointment", handleNewAppointment);
    };
  }, [dispatch]);

  useEffect(() => {
    fetchDoctorStatus();
  }, []);

  useEffect(() => {
    if (!doctorId) return;

    socket.connect();
    socket.emit("joinDoctor", doctorId);

    return () => {
      socket.disconnect();
    };
  }, [doctorId]);

  const fetchDoctorStatus = async () => {
    try {
      const res = await getDoctorStatus();
      setDoctorStatus(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <button
        onClick={startCamera}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Start Camera
      </button>
      <button
        onClick={callPatient}
        className="px-4 py-2 bg-green-600 text-white rounded ml-2"
      >
        Call Patient
      </button>
      {localStream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-96 rounded-lg"
        />
      )}

      {remoteStream && (
        <div className="mt-4">
          <p className="text-lg font-bold">Patient Video</p>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls
            className="w-[500px] h-[350px] bg-black rounded-lg object-cover"
          />
        </div>
      )}

      {/* Main area */}
      <div>
        {doctorStatus?.profileCompleted ? (
          <DoctorHome />
        ) : (
          <AccessFeatures
            doctorStatus={doctorStatus}
            refreshDoctorStatus={fetchDoctorStatus}
          />
        )}
      </div>
    </>
  )
}

export default DoctorDashboard