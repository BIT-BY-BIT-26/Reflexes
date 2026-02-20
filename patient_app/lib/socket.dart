import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? socket;

  // callbacks
  Function(Map data)? onAppointmentConfirmed;
  Function(Map data)? onConsultationStarted;
  Function()? onCallRejected;
  Function()? onCallEnded;
  Function(String role)? onUserJoined;

  void connectPatient(String patientId) {
    if (socket != null && socket!.connected) return;

    socket = IO.io(
      "http://192.168.137.1:3000",
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .build(),
    );

    socket!.onConnect((_) {
      print("🟢 Patient socket connected");

      socket!.emit("patient-join", {"patientId": patientId});
    });

    socket!.onDisconnect((_) {
      print("🔴 Patient socket disconnected");
    });

    // ✅ Appointment confirmed
    socket!.on("APPOINTMENT_CONFIRMED", (data) {
      onAppointmentConfirmed?.call(data);
    });

    // ✅ Doctor started consultation
    socket!.on("consultation-started", (data) {
      print("📞 Doctor started consultation");
      onConsultationStarted?.call(data);
    });

    // ✅ Call rejected
    socket!.on("call-rejected", (_) {
      onCallRejected?.call();
    });

    // ✅ Call ended
    socket!.on("call-ended", (_) {
      onCallEnded?.call();
    });

    // ✅ Someone joined room
    socket!.on("user-joined", (data) {
      onUserJoined?.call(data["role"]);
    });
  }

  // 🔵 Join Call Room
  void joinCallRoom(String roomId) {
    socket?.emit("join-call-room", {"roomId": roomId, "role": "PATIENT"});
  }

  // 🔴 End Call
  void endCall(String roomId) {
    socket?.emit("end-call", {"roomId": roomId});
  }

  void disconnect() {
    if (socket != null) {
      socket!.disconnect();
      socket!.dispose();
      socket = null;
      print("🛑 Socket disposed");
    }
  }
}
