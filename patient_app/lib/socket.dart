import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {

  static final SocketService _instance =
      SocketService._internal();

  factory SocketService() => _instance;

  SocketService._internal();

  IO.Socket? socket;

    void connect({
    required String baseUrl,
    required Function(Map<String, dynamic>) onQueueUpdate,
    required Function(Map<String, dynamic>) onPaused,
    required Function(Map<String, dynamic>) onResumed,
    required Function(Map<String, dynamic>) onStopped,
  }) {
    if (socket != null && socket!.connected) return;

    socket = IO.io(
      "http://localhost:3000",
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .build(),
    );
    
    socket!.onConnect((_) {
      print("✅ Socket Connected");
    });

    // 🔥 MAIN LIVE UPDATE
    socket!.on("queueUpdated", (data) {
      onQueueUpdate(Map<String, dynamic>.from(data));
    });

    socket!.on("opdPaused", (data) {
      onPaused(Map<String, dynamic>.from(data));
    });

    socket!.on("opdResumed", (data) {
      onResumed(Map<String,dynamic>.from(data));
    });

    socket!.on("opdStopped", (data) {
      onStopped(Map<String, dynamic>.from(data));
    });

    socket!.onDisconnect((_) {
      print("🟥 Socket Disconnected");
    });
  }

  void joinDoctorRoom(String doctorId) {
    socket?.emit(
      "joinDoctorRoom",
      doctorId,
    );
  }

  void disconnect() {
    socket?.disconnect();
    socket?.dispose();
    socket = null;
  }
}