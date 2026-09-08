import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  // =========================================================
  // SINGLETON
  // =========================================================

  static final SocketService _instance = SocketService._internal();

  factory SocketService() => _instance;

  SocketService._internal();

  IO.Socket? socket;

  // =========================================================
  // DOCTOR SOCKET
  // =========================================================

  void connectDoctor({
    required String baseUrl,
    required String token,
    required String doctorId,
    required Function(Map<String, dynamic>) onQueueUpdate,
    required Function(Map<String, dynamic>) onPaused,
    required Function(Map<String, dynamic>) onResumed,
    required Function(Map<String, dynamic>) onStopped,
  }) {
    if (socket != null && socket!.connected) {
      print("🟢 Doctor socket already connected");
      return;
    }

    print("🔵 Trying to connect doctor socket...");
    print("Doctor ID: $doctorId");

    socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({
            'token': token,
          })
          .disableAutoConnect()
          .build(),
    );

    // =======================================================
    // CONNECT
    // =======================================================

    socket!.onConnect((_) {
      print("🟢 DOCTOR SOCKET CONNECTED!");
      print("Socket ID: ${socket!.id}");

      // Backend expects doctor ID
      socket!.emit("joinDoctor", doctorId);

      print("📢 joinDoctor emitted: $doctorId");
    });

    // =======================================================
    // CONNECTION ERROR
    // =======================================================

    socket!.onConnectError((error) {
      print("❌ DOCTOR SOCKET CONNECTION ERROR: $error");
    });

    socket!.onError((error) {
      print("❌ DOCTOR SOCKET ERROR: $error");
    });

    // =======================================================
    // QUEUE UPDATED
    // =======================================================

    socket!.on("queueUpdated", (data) {
      print("📢 QUEUE UPDATED: $data");

      onQueueUpdate(
        Map<String, dynamic>.from(data),
      );
    });

    // =======================================================
    // OPD PAUSED
    // =======================================================

    socket!.on("opdPaused", (data) {
      print("⏸️ OPD PAUSED: $data");

      onPaused(
        Map<String, dynamic>.from(data),
      );
    });

    // =======================================================
    // OPD RESUMED
    // =======================================================

    socket!.on("opdResumed", (data) {
      print("▶️ OPD RESUMED: $data");

      onResumed(
        Map<String, dynamic>.from(data),
      );
    });

    // =======================================================
    // OPD STOPPED
    // =======================================================

    socket!.on("opdStopped", (data) {
      print("🛑 OPD STOPPED: $data");

      onStopped(
        Map<String, dynamic>.from(data),
      );
    });

    // =======================================================
    // DISCONNECT
    // =======================================================

    socket!.onDisconnect((reason) {
      print("🔴 DOCTOR SOCKET DISCONNECTED: $reason");
    });

    // =======================================================
    // START CONNECTION
    // =======================================================

    socket!.connect();
  }

  // =========================================================
  // PATIENT SOCKET
  // =========================================================

  void connectPatient({
  required String baseUrl,
  required String token,
  required String patientId,
  required Function(Map<String, dynamic>) onQueueUpdate,
  required Function(Map<String, dynamic>) onPaused,
  required Function(Map<String, dynamic>) onResumed,
  required Function(Map<String, dynamic>) onStopped,
  required Function(Map<String, dynamic>) onIncomingCall,
}) {
  if (socket != null && socket!.connected) {
    print("🟢 Patient socket already connected");
    return;
  }

  print("🔵 Trying to connect patient socket...");
  print("Patient ID: $patientId");

  socket = IO.io(
    baseUrl,
    IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({
          'token': token,
        })
        .disableAutoConnect()
        .build(),
  );

  socket!.onConnect((_) {
    print("🟢 PATIENT SOCKET CONNECTED!");
    print("Socket ID: ${socket!.id}");

    socket!.emit("patient-join", {
      "patientId": patientId,
    });

    print("📢 patient-join emitted: $patientId");
  });

  socket!.onConnectError((error) {
    print("❌ PATIENT SOCKET CONNECTION ERROR: $error");
  });

  socket!.onError((error) {
    print("❌ PATIENT SOCKET ERROR: $error");
  });

  socket!.on("queueUpdated", (data) {
    print("📢 PATIENT QUEUE UPDATED: $data");

    onQueueUpdate(
      Map<String, dynamic>.from(data),
    );
  });

  socket!.on("opdPaused", (data) {
    print("⏸️ PATIENT OPD PAUSED: $data");

    onPaused(
      Map<String, dynamic>.from(data),
    );
  });

  socket!.on("opdResumed", (data) {
    print("▶️ PATIENT OPD RESUMED: $data");

    onResumed(
      Map<String, dynamic>.from(data),
    );
  });

  

  socket!.on("opdStopped", (data) {
    print("🛑 PATIENT OPD STOPPED: $data");

    onStopped(
      Map<String, dynamic>.from(data),
    );
  });

  socket!.on("incoming-call", (data) {
    print("📞 INCOMING CALL RECEIVED!");
    print("Caller Socket: ${data["callerSocketId"]}");
    print("Offer: ${data["offer"]}");

    onIncomingCall(
      Map<String, dynamic>.from(data),
    );
  });

  socket!.onDisconnect((reason) {
    print("🔴 PATIENT SOCKET DISCONNECTED: $reason");
  });

  socket!.connect();
}

  // =========================================================
  // DISCONNECT
  // =========================================================

  void disconnect() {
    print("🔌 Disconnecting socket...");

    socket?.off("connect");
    socket?.off("connect_error");
    socket?.off("queueUpdated");
    socket?.off("opdPaused");
    socket?.off("opdResumed");
    socket?.off("opdStopped");
    socket?.off("disconnect");

    socket?.disconnect();
    socket?.dispose();

    socket = null;
  }
}