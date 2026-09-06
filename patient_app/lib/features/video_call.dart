import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:patient_app/socket.dart';

class VideoCall extends StatefulWidget {
  final String callerSocketId;
  final dynamic offer;

  const VideoCall({
    super.key,
    required this.callerSocketId,
    required this.offer,
  });

  @override
  State<VideoCall> createState() => _VideoCallState();
}

class _VideoCallState extends State<VideoCall> {
  // ============================================================
  // RENDERERS
  // ============================================================

  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();

  // ============================================================
  // WEBRTC
  // ============================================================

  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  // ICE candidates which arrive before remote description
  final List<RTCIceCandidate> _pendingCandidates = [];

  bool _remoteDescriptionSet = false;

  // ============================================================
  // CONTROLS
  // ============================================================

  bool _micEnabled = true;
  bool _cameraEnabled = true;

  bool _isConnected = false;

  // ============================================================
  // SOCKET
  // ============================================================

  final SocketService _socketService = SocketService();

  // ============================================================
  // INIT
  // ============================================================

  @override
  void initState() {
    super.initState();

    _initializeCall();
  }

  // ============================================================
  // INITIALIZE WEBRTC
  // ============================================================

  Future<void> _initializeCall() async {
    try {
      print("====================================");
      print("📞 INITIALIZING WEBRTC CALL");
      print("====================================");

      // ----------------------------------------------------------
      // Initialize renderers
      // ----------------------------------------------------------

      await _localRenderer.initialize();
      await _remoteRenderer.initialize();

      print("✅ Renderers initialized");

      // ----------------------------------------------------------
      // Get camera + microphone
      // ----------------------------------------------------------

      _localStream = await navigator.mediaDevices.getUserMedia({
        'audio': true,
        'video': {
          'facingMode': 'user',
        },
      });

      print("🎥 Camera + microphone initialized");

      // Show patient's own video
      _localRenderer.srcObject = _localStream;

      // ----------------------------------------------------------
      // Create PeerConnection
      // ----------------------------------------------------------

      _peerConnection = await createPeerConnection({
        'iceServers': [
          // STUN
          {
            'urls': 'stun:stun.l.google.com:19302',
          },

          // TURN
          {
            'urls': 'turn:openrelay.metered.ca:80',
            'username': 'openrelayproject',
            'credential': 'openrelayproject',
          },
          {
            'urls': 'turn:openrelay.metered.ca:443',
            'username': 'openrelayproject',
            'credential': 'openrelayproject',
          },
          {
            'urls': 'turn:openrelay.metered.ca:443?transport=tcp',
            'username': 'openrelayproject',
            'credential': 'openrelayproject',
          },
        ],
      });

      print("🔗 PeerConnection created");

      // ----------------------------------------------------------
      // Add local tracks
      // ----------------------------------------------------------

      for (final track in _localStream!.getTracks()) {
        await _peerConnection!.addTrack(
          track,
          _localStream!,
        );
      }

      print("🎥 Local tracks added");

      // ----------------------------------------------------------
      // Connection State
      // ----------------------------------------------------------

      _peerConnection!.onConnectionState = (state) {
        print("🔗 CONNECTION STATE: $state");

        if (!mounted) return;

        setState(() {
          _isConnected =
              state == RTCPeerConnectionState.RTCPeerConnectionStateConnected;
        });
      };

      // ----------------------------------------------------------
      // ICE Connection State
      // ----------------------------------------------------------

      _peerConnection!.onIceConnectionState = (state) {
        print("🧊 ICE CONNECTION STATE: $state");
      };

      // ----------------------------------------------------------
      // ICE Gathering State
      // ----------------------------------------------------------

      _peerConnection!.onIceGatheringState = (state) {
        print("📡 ICE GATHERING STATE: $state");
      };

      // ----------------------------------------------------------
      // ICE Candidate
      // ----------------------------------------------------------

      _peerConnection!.onIceCandidate = (candidate) {
        if (candidate.candidate == null) {
          print("🧊 ICE gathering completed");
          return;
        }

        print(
          "🧊 Sending ICE candidate: ${candidate.candidate}",
        );

        _socketService.socket?.emit(
          "ice-candidate",
          {
            "targetSocketId": widget.callerSocketId,
            "candidate": {
              "candidate": candidate.candidate,
              "sdpMid": candidate.sdpMid,
              "sdpMLineIndex": candidate.sdpMLineIndex,
            },
          },
        );
      };

      // ----------------------------------------------------------
      // Remote Track
      // ----------------------------------------------------------

      _peerConnection!.onTrack = (RTCTrackEvent event) {
        print("📺 REMOTE TRACK RECEIVED");

        if (event.streams.isNotEmpty) {
          final remoteStream = event.streams[0];

          print(
            "📺 Remote stream received: ${remoteStream.id}",
          );

          _remoteRenderer.srcObject = remoteStream;

          if (mounted) {
            setState(() {});
          }
        }
      };

      // ----------------------------------------------------------
      // Listen for ICE candidates from doctor
      // ----------------------------------------------------------

      _listenForIceCandidates();

      // ----------------------------------------------------------
      // Set doctor's offer
      // ----------------------------------------------------------

      await _setRemoteOffer();

      // ----------------------------------------------------------
      // Create answer
      // ----------------------------------------------------------

      await _createAndSendAnswer();

      print("====================================");
      print("✅ WEBRTC INITIALIZATION COMPLETED");
      print("====================================");
    } catch (e, stackTrace) {
      print("❌ WebRTC initialization error: $e");
      print(stackTrace);
    }
  }

  // ============================================================
  // RECEIVE ICE CANDIDATE
  // ============================================================

  void _listenForIceCandidates() {
    _socketService.socket?.on(
      "ice-candidate",
      (data) async {
        print("🧊 ICE CANDIDATE RECEIVED");

        try {
          final candidateData =
              Map<String, dynamic>.from(data["candidate"]);

          final candidate = RTCIceCandidate(
            candidateData["candidate"],
            candidateData["sdpMid"],
            candidateData["sdpMLineIndex"],
          );

          // ------------------------------------------------------
          // Remote description not set yet
          // ------------------------------------------------------

          if (!_remoteDescriptionSet) {
            print("⏳ Remote description not set");
            print("⏳ Buffering ICE candidate");

            _pendingCandidates.add(candidate);

            return;
          }

          // ------------------------------------------------------
          // Remote description already set
          // ------------------------------------------------------

          await _peerConnection!.addCandidate(candidate);

          print("✅ ICE candidate added");
        } catch (e) {
          print("❌ Error adding ICE candidate: $e");
        }
      },
    );
  }

  // ============================================================
  // SET REMOTE OFFER
  // ============================================================

  Future<void> _setRemoteOffer() async {
    try {
      print("📥 Processing doctor's offer...");

      final offerData =
          Map<String, dynamic>.from(widget.offer);

      final String? sdp = offerData["sdp"];
      final String? type = offerData["type"];

      if (sdp == null || type == null) {
        throw Exception(
          "Invalid offer: SDP or type is null",
        );
      }

      final remoteOffer = RTCSessionDescription(
        sdp,
        type,
      );

      // ----------------------------------------------------------
      // Set remote description
      // ----------------------------------------------------------

      await _peerConnection!.setRemoteDescription(
        remoteOffer,
      );

      _remoteDescriptionSet = true;

      print("✅ Doctor's offer set as remote description");

      // ----------------------------------------------------------
      // Add buffered ICE candidates
      // ----------------------------------------------------------

      if (_pendingCandidates.isNotEmpty) {
        print(
          "🧊 Adding ${_pendingCandidates.length} buffered ICE candidates",
        );

        for (final candidate in _pendingCandidates) {
          try {
            await _peerConnection!.addCandidate(candidate);

            print("✅ Buffered ICE candidate added");
          } catch (e) {
            print(
              "❌ Error adding buffered candidate: $e",
            );
          }
        }

        _pendingCandidates.clear();
      }
    } catch (e) {
      print("❌ Error setting remote offer: $e");
      rethrow;
    }
  }

  // ============================================================
  // CREATE + SEND ANSWER
  // ============================================================

  Future<void> _createAndSendAnswer() async {
    try {
      print("📲 Creating answer...");

      final answer =
          await _peerConnection!.createAnswer();

      // ----------------------------------------------------------
      // Set local description
      // ----------------------------------------------------------

      await _peerConnection!.setLocalDescription(
        answer,
      );

      print("✅ Local description set");

      // ----------------------------------------------------------
      // Send answer to doctor
      // ----------------------------------------------------------

      _socketService.socket?.emit(
        "call-accepted",
        {
          "targetSocketId": widget.callerSocketId,
          "answer": {
            "sdp": answer.sdp,
            "type": answer.type,
          },
        },
      );

      print("📤 ANSWER SENT TO DOCTOR");
    } catch (e) {
      print("❌ Error creating answer: $e");
      rethrow;
    }
  }

  // ============================================================
  // MICROPHONE
  // ============================================================

  void _toggleMic() {
    if (_localStream == null) return;

    final audioTracks =
        _localStream!.getAudioTracks();

    if (audioTracks.isEmpty) return;

    final track = audioTracks.first;

    track.enabled = !track.enabled;

    if (!mounted) return;

    setState(() {
      _micEnabled = track.enabled;
    });

    print(
      _micEnabled
          ? "🎤 Microphone ON"
          : "🔇 Microphone OFF",
    );
  }

  // ============================================================
  // CAMERA
  // ============================================================

  void _toggleCamera() {
    if (_localStream == null) return;

    final videoTracks =
        _localStream!.getVideoTracks();

    if (videoTracks.isEmpty) return;

    final track = videoTracks.first;

    track.enabled = !track.enabled;

    if (!mounted) return;

    setState(() {
      _cameraEnabled = track.enabled;
    });

    print(
      _cameraEnabled
          ? "📹 Camera ON"
          : "📷 Camera OFF",
    );
  }

  // ============================================================
  // END CALL
  // ============================================================

  Future<void> _endCall() async {
    print("📞 Ending call...");

    try {
      // Stop local tracks
      for (final track
          in _localStream?.getTracks() ?? []) {
        track.stop();
      }

      // Dispose local stream
      await _localStream?.dispose();

      // Close peer connection
      await _peerConnection?.close();

      // Clear renderers
      _localRenderer.srcObject = null;
      _remoteRenderer.srcObject = null;

      // Remove socket listeners
      _socketService.socket?.off(
        "ice-candidate",
      );

      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      print("❌ Error ending call: $e");
    }
  }

  // ============================================================
  // DISPOSE
  // ============================================================

  @override
  void dispose() {
    print("🧹 Disposing VideoCall screen...");

    _socketService.socket?.off(
      "ice-candidate",
    );

    _localRenderer.srcObject = null;
    _remoteRenderer.srcObject = null;

    _localRenderer.dispose();
    _remoteRenderer.dispose();

    _localStream?.dispose();
    _peerConnection?.close();

    super.dispose();
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,

      body: SafeArea(
        child: Stack(
          children: [

            // ==================================================
            // DOCTOR VIDEO
            // ==================================================

            Positioned.fill(
              child: _remoteRenderer.srcObject != null
                  ? RTCVideoView(
                      _remoteRenderer,
                      objectFit:
                          RTCVideoViewObjectFit
                              .RTCVideoViewObjectFitCover,
                    )
                  : const Center(
                      child: Column(
                        mainAxisSize:
                            MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(
                            color: Colors.white,
                          ),
                          SizedBox(height: 16),
                          Text(
                            "Connecting to doctor...",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ),
            ),

            // ==================================================
            // CONNECTION STATUS
            // ==================================================

            Positioned(
              top: 20,
              left: 20,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius:
                      BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize:
                      MainAxisSize.min,
                  children: [
                    Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: _isConnected
                            ? Colors.green
                            : Colors.orange,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 7),
                    Text(
                      _isConnected
                          ? "Connected"
                          : "Connecting",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ==================================================
            // PATIENT SELF VIDEO
            // ==================================================

            Positioned(
              top: 20,
              right: 20,
              child: Container(
                width: 120,
                height: 170,
                decoration: BoxDecoration(
                  color: Colors.grey.shade900,
                  borderRadius:
                      BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.white30,
                  ),
                ),
                clipBehavior: Clip.hardEdge,
                child: RTCVideoView(
                  _localRenderer,
                  mirror: true,
                  objectFit:
                      RTCVideoViewObjectFit
                          .RTCVideoViewObjectFitCover,
                ),
              ),
            ),

            // ==================================================
            // BOTTOM CONTROLS
            // ==================================================

            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment:
                    MainAxisAlignment.center,
                children: [

                  // MIC
                  _controlButton(
                    icon: _micEnabled
                        ? Icons.mic
                        : Icons.mic_off,
                    onTap: _toggleMic,
                  ),

                  const SizedBox(width: 20),

                  // CAMERA
                  _controlButton(
                    icon: _cameraEnabled
                        ? Icons.videocam
                        : Icons.videocam_off,
                    onTap: _toggleCamera,
                  ),

                  const SizedBox(width: 20),

                  // END CALL
                  _controlButton(
                    icon: Icons.call_end,
                    backgroundColor:
                        Colors.red,
                    onTap: _endCall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // CONTROL BUTTON
  // ============================================================

  Widget _controlButton({
    required IconData icon,
    required VoidCallback onTap,
    Color backgroundColor = Colors.white24,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 58,
        height: 58,
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 27,
        ),
      ),
    );
  }
}

