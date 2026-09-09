import 'dart:ui';

const baseUrl = "http://localhost:3000/api";

// Socket.IO attaches at the server root, not under /api, so it cannot reuse
// baseUrl - passing the /api suffix silently fails the handshake.
const socketUrl = "http://localhost:3000";

// MediReach AI voice assistant (separate hosted FastAPI service).
// Unlike `baseUrl` this is a real hosted URL, so it works on a physical device.
const voiceAgentBaseUrl = "https://medical-voice-agent.onrender.com";
class AppColors {
  static const Color background = Color(0xFF05070D);
  static const Color card = Color(0xFF101827);

  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color glowBlue = Color(0xFF60A5FA);

  static const Color white = Color(0xFFFFFFFF);
  static const Color grey = Color(0xFF94A3B8);

  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);

  static const Color border = Color(0xFF1E293B);
}