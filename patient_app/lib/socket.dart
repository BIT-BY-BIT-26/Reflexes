import 'package:patient_app/utils/constants.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

/// The app's single Socket.IO connection.
///
/// Three things had to be true before any real-time update could reach the
/// patient, and none of them were:
///
///  1. The server's `io.use()` guard rejects a handshake without a JWT, so the
///     old token-less connection never got past authentication.
///  2. Rooms are joined server-side from that JWT (see Backend/socket.js), so
///     there is nothing for the client to ask to join - it only has to connect
///     as itself.
///  3. The doctor-room event is `joinDoctor`; the old `joinDoctorRoom` had no
///     handler, so queue updates never arrived either.
///
/// One connection is shared by every screen. Screens register the events they
/// care about and drop them again in dispose; only logout tears the socket
/// down, so leaving one screen never kills another screen's feed.
class SocketService {
  static final SocketService _instance = SocketService._internal();

  factory SocketService() => _instance;

  SocketService._internal();

  IO.Socket? _socket;

  /// The token the live connection was authenticated with. A different token
  /// (a re-login as someone else) has to rebuild the socket rather than reuse
  /// a connection still bound to the previous user.
  String? _token;

  /// Caller handler -> the wrapper actually registered on the socket, per
  /// event. Needed so [off] can remove exactly what [on] added.
  ///
  /// Typed structurally rather than as the package's `EventHandler`, which is
  /// only exported from a `src/` path.
  final Map<String, Map<Function, dynamic Function(dynamic)>> _handlers = {};

  bool get isConnected => _socket?.connected ?? false;

  /// Opens the shared authenticated connection. Safe to call from several
  /// screens - it is a no-op once connected with the same token.
  void connect(String token) {
    if (_socket != null && _token == token) {
      if (!_socket!.connected) {
        _socket!.connect();
      }
      return;
    }

    // Re-login as a different user: drop the old socket and its handlers.
    if (_socket != null) {
      disconnect();
    }

    _token = token;

    _socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableReconnection()
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      // The server already put this socket in its patient rooms from the JWT.
      // This only re-announces presence, so a doctor who connects later still
      // learns the patient is online.
      _socket!.emit("patient-join");

      // ignore: avoid_print
      print("✅ Socket connected");
    });

    _socket!.onConnectError((error) {
      // Most often an expired or missing JWT - the guard replies "Unauthorized".
      // ignore: avoid_print
      print("❌ Socket connect error: $error");
    });

    _socket!.onDisconnect((_) {
      // ignore: avoid_print
      print("🟥 Socket disconnected");
    });
  }

  /// Registers [handler] for [event]. Payloads that are not JSON objects are
  /// dropped rather than crashing the cast, since a screen always expects a map.
  void on(String event, void Function(Map<String, dynamic>) handler) {
    if (_socket == null) return;

    wrapper(dynamic data) {
      if (data is Map) {
        handler(Map<String, dynamic>.from(data));
      }
    }

    _handlers.putIfAbsent(event, () => {})[handler] = wrapper;

    _socket!.on(event, wrapper);
  }

  /// Removes one handler, or every handler this service registered for [event]
  /// when [handler] is omitted.
  void off(String event, [void Function(Map<String, dynamic>)? handler]) {
    final registered = _handlers[event];
    if (_socket == null || registered == null) return;

    if (handler != null) {
      final wrapper = registered.remove(handler);
      if (wrapper != null) {
        _socket!.off(event, wrapper);
      }
      return;
    }

    for (final wrapper in registered.values) {
      _socket!.off(event, wrapper);
    }

    _handlers.remove(event);
  }

  /// Subscribes to a doctor's live OPD queue. `joinDoctor` is the handler the
  /// server actually registers.
  void joinDoctor(String doctorId) {
    _socket?.emit("joinDoctor", doctorId);
  }

  /// Full teardown. Belongs to logout - a screen leaving should [off] its own
  /// events instead, or it will cut every other screen's feed too.
  void disconnect() {
    _handlers.clear();

    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _token = null;
  }
}
